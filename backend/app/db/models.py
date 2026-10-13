import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import Column, String, Text, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False, default="New Conversation")
    provider = Column(String(50), nullable=False, default="ollama")
    model = Column(String(100), nullable=False, default="llama3:8b")
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    messages = relationship(
        "Message",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
        lazy="selectin"
    )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "provider": self.provider,
            "model": self.model,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "message_count": len(self.messages) if self.messages else 0,
        }

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    provider_used = Column(String(50), nullable=True)
    model_used = Column(String(100), nullable=True)
    artifact = Column(JSON, nullable=True)  # {"title": "...", "type": "html"|"markdown", "content": "..."}
    created_at = Column(DateTime, default=utc_now, nullable=False)

    session = relationship("Session", back_populates="messages")
    citations = relationship(
        "Citation",
        back_populates="message",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "session_id": self.session_id,
            "role": self.role,
            "content": self.content,
            "provider_used": self.provider_used,
            "model_used": self.model_used,
            "artifact": self.artifact,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "citations": [c.to_dict() for c in self.citations] if self.citations else [],
        }

class Citation(Base):
    __tablename__ = "citations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    message_id = Column(String(36), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    guest = Column(String(100), nullable=False)
    episode_title = Column(String(255), nullable=False)
    section = Column(String(255), nullable=True)
    snippet = Column(Text, nullable=False)
    score = Column(Float, nullable=False, default=0.0)

    message = relationship("Message", back_populates="citations")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "message_id": self.message_id,
            "guest": self.guest,
            "episode_title": self.episode_title,
            "section": self.section,
            "snippet": self.snippet,
            "score": round(self.score, 4),
        }

class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    guest = Column(String(100), nullable=False)
    episode_title = Column(String(255), nullable=False)
    episode_number = Column(String(50), nullable=True)
    raw_content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
