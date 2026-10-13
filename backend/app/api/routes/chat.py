from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.db.session import get_db
from backend.app.db.models import Session, Message, Citation
from backend.app.agents.base import growth_agent
from backend.app.providers.cloud_provider import get_provider
from backend.app.core.config import settings
from backend.app.core.logger import logger

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User prompt or question")
    session_id: Optional[str] = Field(None, description="Active session UUID")
    provider: Optional[str] = Field(None, description="'ollama', 'anthropic', or 'openai'")
    model: Optional[str] = Field(None, description="Specific model identifier")
    skill: Optional[str] = Field(None, description="Optional skill (e.g., 'ship30')")

class ChatResponse(BaseModel):
    session_id: str
    message_id: str
    role: str = "assistant"
    content: str
    citations: List[Dict[str, Any]]
    artifact: Optional[Dict[str, Any]] = None
    provider_used: str
    model_used: str

@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """
    Execute grounded RAG query or Ship 30 essay generation skill.
    Maintains strict session isolation and commits message history and citations to database.
    """
    session = None
    if request.session_id:
        result = await db.execute(select(Session).where(Session.id == request.session_id))
        session = result.scalar_one_or_none()

    if not session:
        # Auto-create session if not provided or not found
        title = request.message[:45] + ("..." if len(request.message) > 45 else "")
        session = Session(
            title=title,
            provider=request.provider or settings.DEFAULT_PROVIDER,
            model=request.model or settings.OLLAMA_MODEL,
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)

    # 1. Record User Message
    user_msg = Message(
        session_id=session.id,
        role="user",
        content=request.message,
    )
    db.add(user_msg)
    await db.commit()

    # 2. Run Grounded Agent Loop
    effective_provider = request.provider or session.provider
    effective_model = request.model or session.model

    agent_result = await growth_agent.execute(
        query=request.message,
        session_id=session.id,
        provider_name=effective_provider,
        model_name=effective_model,
        skill=request.skill,
    )

    # 3. Record Assistant Message
    assistant_msg = Message(
        session_id=session.id,
        role="assistant",
        content=agent_result.content,
        provider_used=agent_result.provider_used,
        model_used=agent_result.model_used,
        artifact=agent_result.artifact,
    )
    db.add(assistant_msg)
    await db.commit()
    await db.refresh(assistant_msg)

    # 4. Record Citations
    citation_records = []
    for c in agent_result.citations:
        cit = Citation(
            message_id=assistant_msg.id,
            guest=c.get("guest", "Unknown"),
            episode_title=c.get("episode_title", "Unknown"),
            section=c.get("section"),
            snippet=c.get("snippet", ""),
            score=c.get("score", 0.0),
        )
        db.add(cit)
        citation_records.append(c)

    await db.commit()

    return ChatResponse(
        session_id=session.id,
        message_id=assistant_msg.id,
        role="assistant",
        content=agent_result.content,
        citations=citation_records,
        artifact=agent_result.artifact,
        provider_used=agent_result.provider_used,
        model_used=agent_result.model_used,
    )

@router.get("/providers")
async def list_available_providers():
    """
    Returns runtime status and configuration of Local and Cloud LLM providers.
    """
    ollama_provider = get_provider("ollama")
    ollama_health = await ollama_provider.check_health()

    return {
        "active_default": settings.DEFAULT_PROVIDER,
        "providers": [
            {
                "id": "ollama",
                "name": "Ollama (Local Default)",
                "description": "Zero-cloud private local execution via Ollama REST API",
                "default_model": settings.OLLAMA_MODEL,
                "models": ["llama3:8b", "llama3", "mistral:7b", "phi3:mini"],
                "status": ollama_health.get("status", "offline"),
                "is_available": ollama_health.get("available", False),
            },
            {
                "id": "anthropic",
                "name": "Claude 3.5 Sonnet (Cloud)",
                "description": "Anthropic Claude for state-of-the-art strategic reasoning",
                "default_model": settings.ANTHROPIC_MODEL,
                "models": ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
                "status": "ready" if settings.ANTHROPIC_API_KEY else "not_configured",
                "is_available": bool(settings.ANTHROPIC_API_KEY),
            },
            {
                "id": "openai",
                "name": "GPT-4o (Cloud)",
                "description": "OpenAI flagship multimodal intelligence",
                "default_model": settings.OPENAI_MODEL,
                "models": ["gpt-4o", "gpt-4o-mini"],
                "status": "ready" if settings.OPENAI_API_KEY else "not_configured",
                "is_available": bool(settings.OPENAI_API_KEY),
            },
        ]
    }
