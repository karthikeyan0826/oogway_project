#!/usr/bin/env python3
import asyncio
import argparse
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.rag.chunker import RecursiveSemanticChunker
from backend.app.rag.vector_store import VectorStore
from backend.app.core.logger import logger

async def run_ingestion(data_dir: Path, output_file: Path) -> int:
    logger.info(f"Starting standalone transcript ingestion from: {data_dir}")
    if not data_dir.exists():
        logger.error(f"Data directory {data_dir} does not exist.")
        return 1

    chunker = RecursiveSemanticChunker(target_chunk_size=900, overlap_size=150)
    store = VectorStore()
    all_chunks = []

    files = list(data_dir.glob("*.md")) + list(data_dir.glob("*.txt"))
    if not files:
        logger.warning(f"No .md or .txt transcript files found in {data_dir}")
        return 1

    for file_path in files:
        logger.info(f"Processing transcript: {file_path.name}")
        content = file_path.read_text(encoding="utf-8")
        chunks = chunker.chunk_transcript(content, doc_id_prefix=file_path.stem)
        logger.info(f"Generated {len(chunks)} semantic chunks for {file_path.name}")
        all_chunks.extend(chunks)

    logger.info(f"Generating embeddings and indexing {len(all_chunks)} total chunks...")
    await store.add_chunks(all_chunks)

    output_file.parent.mkdir(parents=True, exist_ok=True)
    store.save_to_file(str(output_file))
    logger.info(f"Successfully generated and persisted vector index to {output_file}")
    print(f"\n[OK] Ingestion Complete! Indexed {len(all_chunks)} chunks into {output_file}")
    return 0

def main():
    parser = argparse.ArgumentParser(description="Ingest podcast transcripts and build vector index.")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=PROJECT_ROOT / "data" / "sample_transcripts",
        help="Directory containing podcast transcript markdown files",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=PROJECT_ROOT / "data" / "vector_index.json",
        help="Output JSON path for serialized vector index",
    )
    args = parser.parse_args()
    exit_code = asyncio.run(run_ingestion(args.data_dir, args.output))
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
