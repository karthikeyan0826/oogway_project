from typing import Dict, Any, Optional
import httpx
from backend.app.providers.base import LLMProvider, ProviderResponse
from backend.app.providers.ollama_provider import OllamaProvider
from backend.app.core.config import settings
from backend.app.core.logger import logger

class AnthropicProvider(LLMProvider):
    """
    Anthropic Claude provider for deep reasoning and complex synthesis.
    """
    def __init__(self, api_key: Optional[str] = None, default_model: Optional[str] = None):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.default_model = default_model or settings.ANTHROPIC_MODEL

    async def generate(
        self,
        prompt: str,
        system_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.2,
    ) -> ProviderResponse:
        target_model = model or self.default_model

        if not self.api_key:
            return ProviderResponse(
                content="Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in .env or switch to local Ollama.",
                provider="anthropic",
                model=target_model,
                error="MISSING_API_KEY"
            )

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": target_model,
            "max_tokens": 4096,
            "system": system_prompt,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post("https://api.anthropic.com/v1/messages", json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    text_blocks = [b.get("text", "") for b in data.get("content", []) if b.get("type") == "text"]
                    return ProviderResponse(
                        content="".join(text_blocks),
                        provider="anthropic",
                        model=target_model,
                        usage=data.get("usage", {})
                    )
                else:
                    return ProviderResponse(
                        content=f"Anthropic API error: {resp.status_code} - {resp.text}",
                        provider="anthropic",
                        model=target_model,
                        error=f"HTTP_{resp.status_code}"
                    )
        except Exception as e:
            logger.error(f"Error calling Anthropic API: {e}")
            return ProviderResponse(
                content=f"Network error communicating with Anthropic API: {str(e)}",
                provider="anthropic",
                model=target_model,
                error=str(e)
            )

    async def check_health(self) -> Dict[str, Any]:
        return {
            "provider": "anthropic",
            "configured": bool(self.api_key),
            "model": self.default_model
        }

class OpenAIProvider(LLMProvider):
    """
    OpenAI provider for GPT-4o / GPT-4o-mini execution.
    """
    def __init__(self, api_key: Optional[str] = None, default_model: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.default_model = default_model or settings.OPENAI_MODEL

    async def generate(
        self,
        prompt: str,
        system_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.2,
    ) -> ProviderResponse:
        target_model = model or self.default_model

        if not self.api_key:
            return ProviderResponse(
                content="OpenAI API key is not configured. Please set OPENAI_API_KEY in .env or switch to local Ollama.",
                provider="openai",
                model=target_model,
                error="MISSING_API_KEY"
            )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": target_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    choice = data.get("choices", [{}])[0]
                    content = choice.get("message", {}).get("content", "")
                    return ProviderResponse(
                        content=content,
                        provider="openai",
                        model=target_model,
                        usage=data.get("usage", {})
                    )
                else:
                    return ProviderResponse(
                        content=f"OpenAI API error: {resp.status_code} - {resp.text}",
                        provider="openai",
                        model=target_model,
                        error=f"HTTP_{resp.status_code}"
                    )
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            return ProviderResponse(
                content=f"Network error communicating with OpenAI API: {str(e)}",
                provider="openai",
                model=target_model,
                error=str(e)
            )

    async def check_health(self) -> Dict[str, Any]:
        return {
            "provider": "openai",
            "configured": bool(self.api_key),
            "model": self.default_model
        }

def get_provider(provider_name: Optional[str] = None) -> LLMProvider:
    """
    Factory function returning the requested LLM provider instance.
    Defaults to Ollama.
    """
    prov = (provider_name or settings.DEFAULT_PROVIDER).lower()
    if prov in {"claude", "anthropic"}:
        return AnthropicProvider()
    elif prov in {"openai", "gpt", "gpt-4o"}:
        return OpenAIProvider()
    else:
        return OllamaProvider()
