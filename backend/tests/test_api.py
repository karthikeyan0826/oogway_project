import pytest
import pytest_asyncio
from pathlib import Path
from httpx import AsyncClient, ASGITransport

from backend.app.main import app
from backend.app.db.session import init_db
from backend.app.rag.chunker import RecursiveSemanticChunker
from backend.app.rag.vector_store import global_vector_store
from backend.app.core.config import settings

@pytest_asyncio.fixture
async def client():
    await init_db()
    if not global_vector_store.chunks:
        data_path = Path(settings.DATA_DIR)
        chunker = RecursiveSemanticChunker()
        all_chunks = []
        for file in data_path.glob("*.md"):
            content = file.read_text(encoding="utf-8")
            chunks = chunker.chunk_transcript(content, doc_id_prefix=file.stem)
            all_chunks.extend(chunks)
        if all_chunks:
            await global_vector_store.add_chunks(all_chunks)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

@pytest.mark.asyncio
async def test_healthz_endpoint(client: AsyncClient):
    resp = await client.get("/healthz")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "timestamp" in data

@pytest.mark.asyncio
async def test_ready_endpoint(client: AsyncClient):
    resp = await client.get("/ready")
    assert resp.status_code == 200
    data = resp.json()
    assert "database" in data
    assert "indexed_chunks" in data
    assert "ollama" in data

@pytest.mark.asyncio
async def test_sessions_crud_and_isolation(client: AsyncClient):
    # 1. Create Session A
    resp_a = await client.post("/api/sessions", json={"title": "Session A - Product Strategy"})
    assert resp_a.status_code == 201
    session_a = resp_a.json()
    assert session_a["title"] == "Session A - Product Strategy"
    session_a_id = session_a["id"]

    # 2. Create Session B
    resp_b = await client.post("/api/sessions", json={"title": "Session B - PLG Metrics"})
    assert resp_b.status_code == 201
    session_b = resp_b.json()
    session_b_id = session_b["id"]

    # 3. List Sessions
    list_resp = await client.get("/api/sessions")
    assert list_resp.status_code == 200
    sessions = list_resp.json()
    ids = [s["id"] for s in sessions]
    assert session_a_id in ids
    assert session_b_id in ids

    # 4. Fetch Isolated Session A
    get_a = await client.get(f"/api/sessions/{session_a_id}")
    assert get_a.status_code == 200
    data_a = get_a.json()
    assert data_a["id"] == session_a_id
    assert data_a["messages"] == []

    # 5. Delete Session B
    del_b = await client.delete(f"/api/sessions/{session_b_id}")
    assert del_b.status_code == 204

    # Verify Session B is gone, but Session A remains intact
    check_b = await client.get(f"/api/sessions/{session_b_id}")
    assert check_b.status_code == 404

    check_a = await client.get(f"/api/sessions/{session_a_id}")
    assert check_a.status_code == 200

@pytest.mark.asyncio
async def test_chat_endpoint_grounded_response(client: AsyncClient):
    chat_payload = {
        "message": "What is High Agency according to Shreyas Doshi?",
        "provider": "ollama",
        "model": "llama3:8b",
    }
    resp = await client.post("/api/chat", json=chat_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "session_id" in data
    assert "message_id" in data
    assert data["role"] == "assistant"
    assert len(data["content"]) > 0
    assert len(data["citations"]) > 0
    assert any("Shreyas Doshi" in c["guest"] for c in data["citations"])

@pytest.mark.asyncio
async def test_chat_endpoint_out_of_domain_refusal(client: AsyncClient):
    chat_payload = {
        "message": "What is the capital of Mars and how do I build a spaceship to get there?",
        "provider": "ollama",
    }
    resp = await client.post("/api/chat", json=chat_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "I cannot find information about this in the podcast transcripts." in data["content"]
    assert len(data["citations"]) == 0

@pytest.mark.asyncio
async def test_chat_providers_endpoint(client: AsyncClient):
    resp = await client.get("/api/chat/providers")
    assert resp.status_code == 200
    data = resp.json()
    assert "active_default" in data
    assert "providers" in data
    provider_ids = [p["id"] for p in data["providers"]]
    assert "ollama" in provider_ids
    assert "anthropic" in provider_ids
    assert "openai" in provider_ids
