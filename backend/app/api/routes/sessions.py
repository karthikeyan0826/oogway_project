from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from backend.app.db.session import get_db
from backend.app.db.models import Session, Message
from backend.app.core.config import settings

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])

class SessionCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    provider: Optional[str] = None
    model: Optional[str] = None

class SessionUpdate(BaseModel):
    title: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None

@router.get("")
async def list_sessions(db: AsyncSession = Depends(get_db)):
    """List all user sessions, ordered by last update."""
    query = select(Session).options(selectinload(Session.messages)).order_by(desc(Session.updated_at))
    result = await db.execute(query)
    sessions = result.scalars().all()
    return [s.to_dict() for s in sessions]

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_session(payload: SessionCreate, db: AsyncSession = Depends(get_db)):
    """Create a new isolated conversation session."""
    session = Session(
        title=payload.title or "New Conversation",
        provider=payload.provider or settings.DEFAULT_PROVIDER,
        model=payload.model or settings.OLLAMA_MODEL,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session.to_dict()

@router.get("/{session_id}")
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve an isolated session along with its full message history and citations."""
    query = (
        select(Session)
        .options(
            selectinload(Session.messages).selectinload(Message.citations)
        )
        .where(Session.id == session_id)
    )
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )

    return {
        **session.to_dict(),
        "messages": [m.to_dict() for m in session.messages],
    }

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a conversation session and all cascading messages and citations."""
    query = select(Session).where(Session.id == session_id)
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )

    await db.delete(session)
    await db.commit()
    return None
