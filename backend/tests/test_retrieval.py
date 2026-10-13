import pytest
from backend.app.rag.chunker import RecursiveSemanticChunker
from backend.app.rag.vector_store import VectorStore
from backend.app.rag.retriever import TranscriptRetriever, GROUNDING_REFUSAL_MESSAGE

SAMPLE_TRANSCRIPT = """# Lenny's Podcast Transcript
## Guest: Shreyas Doshi
## Episode Title: High Agency and The LNO Framework
## Episode Number: 42

### [00:01:15] Section: Introduction and High Agency
High Agency is fundamentally the refusal to accept that the world is fixed and immutable. A high-agency person bends reality to achieve the right outcome.

### [00:08:40] Section: The LNO Framework
LNO stands for Leverage, Neutral, and Overhead. Treat Leverage tasks with 100% effort, Neutral with 80%, and Overhead with 50%.
"""

def test_chunker_extracts_metadata_and_sections():
    chunker = RecursiveSemanticChunker(target_chunk_size=500, overlap_size=50)
    chunks = chunker.chunk_transcript(SAMPLE_TRANSCRIPT, doc_id_prefix="shreyas_test")
    
    assert len(chunks) >= 2
    assert chunks[0].guest == "Shreyas Doshi"
    assert chunks[0].episode_title == "High Agency and The LNO Framework"
    assert any("High Agency" in c.section for c in chunks)
    assert any("LNO Framework" in c.section for c in chunks)

@pytest.mark.asyncio
async def test_grounded_retrieval_returns_relevant_context_and_citations():
    chunker = RecursiveSemanticChunker()
    chunks = chunker.chunk_transcript(SAMPLE_TRANSCRIPT, doc_id_prefix="test_shreyas")
    
    store = VectorStore(embedding_dim=256)
    await store.add_chunks(chunks)
    
    retriever = TranscriptRetriever(store=store, threshold=0.20)
    result = await retriever.retrieve("What is High Agency according to Shreyas Doshi?")
    
    assert result.is_grounded is True
    assert result.refusal_message is None
    assert len(result.citations) > 0
    assert result.citations[0]["guest"] == "Shreyas Doshi"
    assert "Shreyas Doshi" in result.context_text
    assert "High Agency" in result.context_text

@pytest.mark.asyncio
async def test_out_of_domain_query_enforces_strict_refusal_guardrail():
    chunker = RecursiveSemanticChunker()
    chunks = chunker.chunk_transcript(SAMPLE_TRANSCRIPT, doc_id_prefix="test_shreyas")
    
    store = VectorStore(embedding_dim=256)
    await store.add_chunks(chunks)
    
    # Query completely unrelated to product management, growth, or the podcast
    retriever = TranscriptRetriever(store=store, threshold=0.35)
    unrelated_query = "What is the secret baking temperature for grandma's sourdough bread pudding?"
    
    result = await retriever.retrieve(unrelated_query)
    
    assert result.is_grounded is False
    assert result.refusal_message == GROUNDING_REFUSAL_MESSAGE
    assert result.refusal_message == "I cannot find information about this in the podcast transcripts."
    assert len(result.citations) == 0
    assert result.context_text == ""
