from typing import List, Dict, Any, Optional
from backend.app.rag.vector_store import VectorStore, global_vector_store
from backend.app.core.config import settings
from backend.app.core.logger import logger

GROUNDING_REFUSAL_MESSAGE = "I cannot find information about this in the podcast transcripts."

class RetrievalResult:
    def __init__(
        self,
        query: str,
        chunks: List[Any],
        citations: List[Dict[str, Any]],
        is_grounded: bool,
        context_text: str,
        refusal_message: Optional[str] = None,
    ):
        self.query = query
        self.chunks = chunks
        self.citations = citations
        self.is_grounded = is_grounded
        self.context_text = context_text
        self.refusal_message = refusal_message

    def to_dict(self) -> Dict[str, Any]:
        return {
            "query": self.query,
            "is_grounded": self.is_grounded,
            "citations": self.citations,
            "refusal_message": self.refusal_message,
        }

class TranscriptRetriever:
    """
    Retriever that extracts top-k relevant transcript chunks,
    constructs verified citations, and enforces strict grounding guardrails.
    """
    def __init__(self, store: VectorStore = global_vector_store, threshold: float = None):
        self.store = store
        self.threshold = threshold if threshold is not None else settings.VECTOR_SIMILARITY_THRESHOLD

    async def retrieve(self, query: str, top_k: int = 4) -> RetrievalResult:
        search_results = await self.store.search(query=query, top_k=top_k)
        
        # Out-of-domain detection check
        if not search_results or search_results[0][1] < self.threshold:
            logger.info(
                f"Query '{query}' failed grounding threshold (top score: "
                f"{search_results[0][1] if search_results else 0.0:.4f} < {self.threshold}). Enforcing refusal."
            )
            return RetrievalResult(
                query=query,
                chunks=[],
                citations=[],
                is_grounded=False,
                context_text="",
                refusal_message=GROUNDING_REFUSAL_MESSAGE,
            )

        citations: List[Dict[str, Any]] = []
        context_parts: List[str] = []

        for chunk, score in search_results:
            citation_item = {
                "guest": chunk.guest,
                "episode_title": chunk.episode_title,
                "section": chunk.section,
                "snippet": chunk.text[:280] + ("..." if len(chunk.text) > 280 else ""),
                "score": round(score, 4),
            }
            citations.append(citation_item)
            
            context_parts.append(
                f"--- SOURCE CITATION [{chunk.guest} - {chunk.episode_title}] ---\n"
                f"Section: {chunk.section}\n"
                f"Content:\n{chunk.text}\n"
            )

        context_text = "\n\n".join(context_parts)
        return RetrievalResult(
            query=query,
            chunks=[c[0] for c in search_results],
            citations=citations,
            is_grounded=True,
            context_text=context_text,
            refusal_message=None,
        )

# Global singleton retriever instance
retriever = TranscriptRetriever()
