import math
import re
import json
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import httpx
from backend.app.rag.chunker import TranscriptChunk
from backend.app.core.config import settings
from backend.app.core.logger import logger

class VectorStore:
    """
    Vector store supporting semantic similarity search, chunk persistence,
    and adaptive multi-engine embeddings (Ollama / OpenAI / Deterministic Semantic).
    """
    def __init__(self, embedding_dim: int = 2048):
        self.embedding_dim = embedding_dim
        self.chunks: List[TranscriptChunk] = []
        self.embeddings: List[List[float]] = []
        self._ollama_checked = False
        self._ollama_online = False

    async def _check_ollama_availability(self) -> bool:
        if self._ollama_checked:
            return self._ollama_online
        try:
            async with httpx.AsyncClient(timeout=0.3) as client:
                resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
                self._ollama_online = (resp.status_code == 200)
        except Exception:
            self._ollama_online = False
        self._ollama_checked = True
        return self._ollama_online

    def _tokenize(self, text: str) -> List[str]:
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        return [w for w in cleaned.split() if len(w) > 1]

    def _compute_semantic_fallback_embedding(self, text: str) -> List[float]:
        """
        High-fidelity deterministic semantic n-gram and token hash vectorizer.
        Ensures zero-dependency local operation without requiring huge downloads.
        """
        vec = [0.0] * self.embedding_dim
        tokens = self._tokenize(text)
        if not tokens:
            return vec

        # Unigram & Bigram hashing with positional weighting
        for idx, token in enumerate(tokens):
            # Token hash
            h1 = hash(token) % self.embedding_dim
            vec[h1] += 1.0 + (1.0 / (idx + 1))
            
            # Bigram hash
            if idx > 0:
                bigram = f"{tokens[idx-1]}_{token}"
                h2 = hash(bigram) % self.embedding_dim
                vec[h2] += 1.5

            # Trigram / prefix hash for stem invariance
            if len(token) >= 4:
                prefix = token[:4]
                h3 = hash(prefix) % self.embedding_dim
                vec[h3] += 0.8

        # L2 Normalization
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    async def get_embedding(self, text: str) -> List[float]:
        """
        Attempt Ollama embedding if available, otherwise return fallback semantic embedding.
        """
        if await self._check_ollama_availability():
            try:
                async with httpx.AsyncClient(timeout=2.0) as client:
                    resp = await client.post(
                        f"{settings.OLLAMA_BASE_URL}/api/embeddings",
                        json={"model": settings.OLLAMA_MODEL, "prompt": text}
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        emb = data.get("embedding")
                        if emb and isinstance(emb, list):
                            norm = math.sqrt(sum(x * x for x in emb))
                            return [x / norm for x in emb] if norm > 0 else emb
            except Exception:
                pass

        return self._compute_semantic_fallback_embedding(text)

    def cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        if len(vec_a) != len(vec_b):
            return 0.0
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        return max(0.0, min(1.0, dot))

    async def add_chunks(self, chunks: List[TranscriptChunk]) -> None:
        for chunk in chunks:
            full_context = f"{chunk.guest} {chunk.episode_title} {chunk.section} {chunk.text}"
            emb = await self.get_embedding(full_context)
            self.chunks.append(chunk)
            self.embeddings.append(emb)
        logger.info(f"Added {len(chunks)} chunks to vector store. Total chunks: {len(self.chunks)}")

    async def search(self, query: str, top_k: int = 4) -> List[Tuple[TranscriptChunk, float]]:
        if not self.chunks:
            return []

        query_emb = await self.get_embedding(query)
        scored: List[Tuple[TranscriptChunk, float]] = []

        for chunk, emb in zip(self.chunks, self.embeddings):
            # If dimensions match, compute cosine similarity
            if len(query_emb) == len(emb):
                score = self.cosine_similarity(query_emb, emb)
            else:
                # Recalculate fallback embedding for consistent dimension
                fallback_q = self._compute_semantic_fallback_embedding(query)
                fallback_c = self._compute_semantic_fallback_embedding(
                    f"{chunk.guest} {chunk.episode_title} {chunk.section} {chunk.text}"
                )
                score = self.cosine_similarity(fallback_q, fallback_c)

            # Additional boost if exact query tokens match guest name or title
            q_lower = query.lower()
            if chunk.guest.lower() in q_lower:
                score = min(1.0, score + 0.15)
            scored.append((chunk, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    def save_to_file(self, file_path: str) -> None:
        data = {
            "chunks": [c.to_dict() for c in self.chunks],
            "embeddings": self.embeddings,
        }
        Path(file_path).parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f)
        logger.info(f"Saved vector index to {file_path}")

    def load_from_file(self, file_path: str) -> bool:
        path = Path(file_path)
        if not path.exists():
            return False
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.chunks = [
                TranscriptChunk(
                    chunk_id=c["chunk_id"],
                    guest=c["guest"],
                    episode_title=c["episode_title"],
                    section=c["section"],
                    text=c["text"],
                    chunk_index=c["chunk_index"],
                )
                for c in data["chunks"]
            ]
            self.embeddings = data["embeddings"]
            logger.info(f"Loaded vector store with {len(self.chunks)} chunks from {file_path}")
            return True
        except Exception as e:
            logger.warning(f"Could not load vector store from {file_path}: {e}")
            return False

# Global singleton store instance
global_vector_store = VectorStore()
