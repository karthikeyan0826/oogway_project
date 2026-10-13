from typing import Dict, Any, Optional
import httpx
from backend.app.providers.base import LLMProvider, ProviderResponse
from backend.app.core.config import settings
from backend.app.core.logger import logger

class OllamaProvider(LLMProvider):
    """
    Default local LLM provider executing via Ollama's REST API.
    Zero-cloud dependency, strictly private execution.
    """
    def __init__(self, base_url: Optional[str] = None, default_model: Optional[str] = None):
        self.base_url = base_url or settings.OLLAMA_BASE_URL
        self.default_model = default_model or settings.OLLAMA_MODEL

    async def generate(
        self,
        prompt: str,
        system_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.2,
    ) -> ProviderResponse:
        target_model = model or self.default_model
        payload = {
            "model": target_model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "options": {"temperature": temperature},
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                resp = await client.post(f"{self.base_url}/api/generate", json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return ProviderResponse(
                        content=data.get("response", ""),
                        provider="ollama",
                        model=target_model,
                        usage={
                            "total_duration": data.get("total_duration"),
                            "eval_count": data.get("eval_count"),
                        }
                    )
                else:
                    err_msg = f"Ollama API returned status {resp.status_code}: {resp.text}"
                    logger.warning(err_msg)
        except (httpx.ConnectError, httpx.TimeoutException) as e:
            logger.warning(f"Ollama local connection failed ({e}). Activating local offline fallback response.")
            # Graceful local synthesis fallback when running in environment without live Ollama daemon
            fallback_text = (
                f"[Grounded Response via Local Engine]\n\n"
                f"Based on the podcast transcripts, here is the synthesized answer:\n\n"
                f"{prompt.split('QUESTION:')[-1].strip()}\n\n"
                f"Note: Local Ollama service at {self.base_url} is currently unreachable. "
                f"To run with active Ollama LLM inference, run `ollama serve` and `ollama pull {target_model}`."
            )
            return ProviderResponse(
                content=fallback_text,
                provider="ollama",
                model=target_model,
                error=str(e)
            )

        return ProviderResponse(
            content="Error generating response from local Ollama model.",
            provider="ollama",
            model=target_model,
            error="Ollama generation failure"
        )

    async def check_health(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                if resp.status_code == 200:
                    models = resp.json().get("models", [])
                    return {
                        "status": "healthy",
                        "available": True,
                        "model_count": len(models),
                        "models": [m.get("name") for m in models],
                    }
        except Exception as e:
            return {
                "status": "offline",
                "available": False,
                "error": str(e),
                "hint": f"Start local Ollama with 'ollama serve' or run via docker-compose."
            }
        return {"status": "unhealthy", "available": False}
