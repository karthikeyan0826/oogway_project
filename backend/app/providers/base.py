from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class ProviderResponse:
    def __init__(
        self,
        content: str,
        provider: str,
        model: str,
        usage: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ):
        self.content = content
        self.provider = provider
        self.model = model
        self.usage = usage or {}
        self.error = error

    def to_dict(self) -> Dict[str, Any]:
        return {
            "content": self.content,
            "provider": self.provider,
            "model": self.model,
            "usage": self.usage,
            "error": self.error,
        }

class LLMProvider(ABC):
    """
    Abstract interface for LLM execution providers (Local Ollama, Cloud Anthropic, Cloud OpenAI).
    """
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.2,
    ) -> ProviderResponse:
        pass

    @abstractmethod
    async def check_health(self) -> Dict[str, Any]:
        pass
