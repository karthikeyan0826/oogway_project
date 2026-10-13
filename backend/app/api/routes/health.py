from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.rag.vector_store import global_vector_store
from backend.app.providers.cloud_provider import get_provider

router = APIRouter(tags=["Health"])

@router.get("/healthz")
async def health_check():
    """
    Kubernetes / Docker liveness probe endpoint.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

@router.get("/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    Kubernetes / Docker readiness probe endpoint validating database
    connectivity and vector knowledge base indexing.
    """
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    ollama_provider = get_provider("ollama")
    ollama_health = await ollama_provider.check_health()

    is_ready = db_status == "ok" and len(global_vector_store.chunks) > 0

    return {
        "ready": is_ready,
        "database": db_status,
        "indexed_chunks": len(global_vector_store.chunks),
        "ollama": ollama_health,
        "cloud_providers": {
            "anthropic_configured": bool(settings.ANTHROPIC_API_KEY),
            "openai_configured": bool(settings.OPENAI_API_KEY),
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
