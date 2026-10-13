# System Architecture & Technical Specification
## The Lenny Growth Assistant

### 1. High-Level System Architecture & Topology

The Lenny Growth Assistant is built on a decoupled, cloud-agnostic forward-deployed architecture. The system orchestrates containerized services via Docker Compose: a high-concurrency FastAPI asynchronous backend, a high-performance React + TypeScript frontend, a PostgreSQL database for persistent isolated session state, and a local Ollama container for zero-dependency offline inference.

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (Browser)"]
        UI["React 18 + TypeScript SPA"]
        ChatPane["Chat & Streaming Interface"]
        ArtifactPane["Artifact Sandbox Viewer (iframe)"]
        ModelSwitch["Runtime LLM Selector"]
    end

    subgraph APILayer ["FastAPI Gateway (:8000)"]
        Router["FastAPI Async Router"]
        CorsMW["CORS & Request ID Middleware"]
        AuthSec["Security & Sanitizer Engine"]
        SessionMgr["Session Isolation Manager"]
        
        subgraph RAGPipeline ["RAG & Grounding Engine"]
            Retriever["Context Retriever (Top-K)"]
            Chunker["Semantic Recursive Chunker"]
            VectorStore["Cosine Vector Store (In-Memory / Postgres)"]
        end

        subgraph AgentSkillLayer ["Agent & Skill Runtime"]
            AgentLoop["Growth Agent Core"]
            Ship30Skill["Ship 30 for 30 Essay Generator"]
            GuardrailEngine["Citation & Hallucination Guardrail"]
        end

        subgraph ProviderLayer ["Pluggable LLM Provider Dispatcher"]
            ProviderBase["LLMProvider (Abstract Base)"]
            OllamaProv["OllamaProvider (Local REST :11434)"]
            CloudProv["CloudProvider (Claude 3.5 / GPT-4o)"]
        end
    end

    subgraph DataStorage ["Persistent Data Layer"]
        PostgresDB[("PostgreSQL 16 DB\n(Sessions, Messages, Metadata)")]
        TranscriptsDisk[("data/sample_transcripts/\n(Shreyas, Elena, Balfour)")]
    end

    UI --> |REST / Streaming JSON| Router
    Router --> SessionMgr
    Router --> AuthSec
    SessionMgr --> PostgresDB
    Router --> AgentLoop

    AgentLoop --> Retriever
    Retriever --> VectorStore
    VectorStore -.-> TranscriptsDisk
    
    AgentLoop --> Ship30Skill
    AgentLoop --> GuardrailEngine
    AgentLoop --> ProviderBase
    
    ProviderBase --> OllamaProv
    ProviderBase --> CloudProv
    
    OllamaProv -.-> |Local REST| OllamaService["Ollama Daemon (:11434)"]
    CloudProv -.-> |TLS API HTTPS| CloudAPIs["Anthropic / OpenAI API"]
    
    AgentLoop --> |Response + Citations + Artifacts| UI
    UI -.-> |Sanitized HTML / Markdown| ArtifactPane
```

---

### 2. Database Schema (SQLAlchemy 2.0 Async)

The system enforces relational integrity and strict session-level isolation. Each session maintains independent message threads and parameters without cross-talk.

```mermaid
erDiagram
    SESSIONS ||--o{ MESSAGES : contains
    MESSAGES ||--o{ CITATIONS : references
    TRANSCRIPTS ||--o{ TRANSCRIPT_CHUNKS : splits_into

    SESSIONS {
        uuid id PK "Primary Key (UUID4)"
        string title "Conversation title"
        string provider "Selected default provider (ollama/claude/openai)"
        string model "Model identifier"
        jsonb system_prompt_override "Custom system overrides"
        timestamp created_at "UTC Timestamp"
        timestamp updated_at "UTC Timestamp"
    }

    MESSAGES {
        uuid id PK "Primary Key (UUID4)"
        uuid session_id FK "References SESSIONS.id"
        string role "user | assistant | system"
        text content "Message body (Markdown / Plain)"
        string model_used "Model used for generation"
        string provider_used "Provider used (ollama/anthropic/openai)"
        jsonb artifact "Extracted artifact payload (title, type, content)"
        timestamp created_at "UTC Timestamp"
    }

    CITATIONS {
        uuid id PK "Primary Key (UUID4)"
        uuid message_id FK "References MESSAGES.id"
        string guest "Guest name (e.g. Shreyas Doshi)"
        string episode_title "Episode title"
        string section "Timestamp or section header"
        text snippet "Verbatim snippet used for grounding"
        float score "Similarity confidence score"
    }

    TRANSCRIPTS {
        uuid id PK "Primary Key"
        string guest "Podcast guest name"
        string episode_title "Podcast episode title"
        string episode_url "Canonical URL / reference"
        text full_text "Raw transcript markdown"
        timestamp ingested_at "Ingestion timestamp"
    }

    TRANSCRIPT_CHUNKS {
        uuid id PK "Primary Key"
        uuid transcript_id FK "References TRANSCRIPTS.id"
        integer chunk_index "Ordering index"
        text chunk_text "Segment text (~400 tokens)"
        jsonb metadata "Guest, Title, Section tags"
        vector embedding "Embedding vector"
    }
```

---

### 3. Data Flow & End-to-End Execution Lifecycles

#### A. Ingestion Flow (`data/ingest.py`)
1. Ingestion CLI traverses `data/sample_transcripts/` reading `.md` and `.txt` files.
2. Metadata header is parsed (Guest, Episode Title, Episode Number).
3. `RecursiveSemanticChunker` decomposes text with overlapping windows (chunk size: 800-1200 characters, overlap: 150 characters), preserving speaker turns and paragraph boundaries.
4. Chunks are converted into vector embeddings and indexed in `VectorStore` with metadata tags.

#### B. Query & Agent Execution Flow
1. **User Request**: User sends a prompt via Frontend with an optional provider switch (e.g., `ollama` or `claude-3-5-sonnet`).
2. **Context Retrieval**: `Retriever` queries `VectorStore` for top-$k$ relevant chunks ($k=4$) matching the user query semantics.
3. **Guardrail Evaluation**:
   - If maximum retrieval similarity is below the relevance threshold ($< 0.35$), the agent returns the deterministic grounded refusal:
     `"I cannot find information about this in the podcast transcripts."`
   - If relevant chunks exist, context is formatted with explicit tags: `[Guest: {guest} | Title: {episode_title} | Section: {section}]`.
4. **Agent Skill Execution**:
   - If the user requested an essay, synthesis, or framework draft (or invoked the Ship 30 mode), `ship30_writer.py` activates: enforces the ~1,250 word atomic essay format (Hook, Story/Framework, Bulleted Evidence, Single Actionable Takeaway).
   - The provider executes the prompt and streams or returns the grounded response.
5. **Artifact Detection & Sanitization**:
   - The backend and frontend detect structured code blocks (HTML, Markdown essays, SVG diagrams).
   - Artifact payloads are sanitized, packaged into structured JSON, and dispatched to the client.
6. **Persistence**: The query and generated response (including citations and artifact metadata) are committed to PostgreSQL within the isolated session ID.

---

### 4. Security & Isolation Architecture

1. **Defense-in-Depth Artifact Sandboxing**:
   - Generated HTML/CSS/JS is rendered in a dedicated child `<iframe>`.
   - The iframe is isolated with attribute `sandbox="allow-scripts"` (strictly omitting `allow-same-origin`, `allow-top-navigation`, and `allow-modals`). This guarantees that scripts cannot access the parent application's DOM, local storage, cookies, or dispatch requests under parent origins.
   - Content is pre-sanitized using strict attribute and tag allow-lists, neutralizing potential XSS vectors before rendering.

2. **Secret & Key Isolation**:
   - Cloud keys (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) are optional and managed strictly through backend environment variables (`.env`).
   - The client application never receives or stores raw API keys.
   - If an API key is missing, the system gracefully falls back to local Ollama or returns a safe structured error rather than exposing stack traces.

3. **CORS & Input Validation**:
   - Strict CORS configuration restricts origins to configured frontend URLs.
   - All input requests are validated against strict Pydantic v2 schemas with length caps and type coercion.
   - SQL operations use SQLAlchemy async ORM with parameterized queries, preventing SQL injection.
