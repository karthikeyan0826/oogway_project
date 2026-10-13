from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.core.config import settings
from backend.app.core.logger import logger
from backend.app.db.session import init_db
from backend.app.api.routes import health, sessions, chat
from backend.app.rag.chunker import RecursiveSemanticChunker
from backend.app.rag.vector_store import global_vector_store

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize Database Tables
    logger.info("Initializing database schema...")
    await init_db()

    # 2. Ingest Sample Transcripts into Vector Store on Startup
    logger.info(f"Checking transcript directory: {settings.DATA_DIR}")
    data_path = Path(settings.DATA_DIR)
    if data_path.exists():
        chunker = RecursiveSemanticChunker()
        all_chunks = []
        for file in data_path.glob("*.md"):
            try:
                content = file.read_text(encoding="utf-8")
                chunks = chunker.chunk_transcript(content, doc_id_prefix=file.stem)
                all_chunks.extend(chunks)
                logger.info(f"Loaded {len(chunks)} chunks from {file.name}")
            except Exception as e:
                logger.error(f"Failed to load transcript {file.name}: {e}")

        if all_chunks:
            await global_vector_store.add_chunks(all_chunks)
            logger.info(f"Knowledge base initialized with {len(global_vector_store.chunks)} chunks.")
    else:
        logger.warning(f"Data directory {settings.DATA_DIR} does not exist. Vector store starting empty.")

    yield

    logger.info("Application shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise RAG Assistant grounded in Lenny Rachitsky's podcast interviews.",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Structured JSON Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred processing your request.",
            "detail": str(exc) if settings.ENVIRONMENT == "development" else None,
            "path": str(request.url.path),
        },
    )

# Include API Routers
app.include_router(health.router)
app.include_router(sessions.router)
app.include_router(chat.router)
