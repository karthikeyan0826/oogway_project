# Forward Deployed Engineering (FDE) Execution Log
## The Lenny Growth Assistant

### Engagement Overview
- **Role**: Senior Forward Deployed Engineer (FDE)
- **Project**: The Lenny Growth Assistant
- **Mission**: Build, verify, test, containerize, and document production-ready AI copilot with strict transcript grounding, dynamic LLM provider switching (Local Ollama default, Claude/OpenAI fallback), Ship 30 atomic essay generation skill, and isolated dual-pane Artifact sandbox.

---

### Step-by-Step Execution Log

#### Phase 1: Architecture & System Documentation (Completed)
- **Deliverables Produced**:
  - `docs/PRD.md`: Formalized personas (Growth Lead Elena, Senior PM Alex, Founder Maya), quantitative SLOs (TTFT < 800ms Cloud / < 1.8s Local, 100% adherence to out-of-domain refusal, 0% XSS escape), scope boundaries, and risk mitigations.
  - `docs/architecture.md`: Authored complete Mermaid system topology, database ER diagram, end-to-end data flow (ingestion -> recursive semantic chunker -> vector store -> grounding guardrail -> skill generator -> sandboxed iframe), and defense-in-depth security model.
  - `docs/design.md`: Documented dual-pane Claude-like layout, interaction states (streaming, citations popover, model switcher), WCAG AA compliance, and keyboard shortcuts.

---

#### Phase 2: Knowledge Base & RAG Ingestion Pipeline (Completed)
- **Curated High-Fidelity Transcripts**:
  - `data/sample_transcripts/shreyas_doshi_high_agency.md`: Shreyas Doshi on High Agency definition, LNO framework (Leverage, Neutral, Overhead), and Good vs Great PMs.
  - `data/sample_transcripts/elena_verna_plg_growth.md`: Elena Verna on Product-Led Growth (PLG), Product-Led Sales (PLS), Product Qualified Leads (PQLs), and Growth Org structure.
  - `data/sample_transcripts/brian_balfour_growth_loops.md`: Brian Balfour on Compounding Growth Loops vs Linear Funnels, and the Four Fits Framework.
- **Ingestion Script (`data/ingest.py`)**:
  - Recursive semantic chunker with section header parsing (`### [hh:mm:ss] Section:`), overlapping windows, and document prefix tagging.
  - Standalone CLI execution (`python data/ingest.py`) verified: 26 semantic chunks indexed and persisted to `data/vector_index.json`.

---

#### Phase 3: Core Backend & Pluggable Provider Layer (Completed)
- **FastAPI Async Engine (`backend/app/main.py`)**:
  - Configured with Pydantic v2 `BaseSettings` (`backend/app/core/config.py`).
  - Structured JSON logging (`backend/app/core/logger.py`) outputting UTC timestamps, log level, module, line, and structured context.
  - Asynchronous SQLAlchemy 2.0 ORM (`backend/app/db/session.py`, `models.py`) with PostgreSQL and SQLite support.
  - Pluggable provider dispatcher (`backend/app/providers/`):
    - `ollama_provider.py`: Connects to local Ollama daemon at `:11434` with graceful fallback handling.
    - `cloud_provider.py`: Dynamic runtime support for Anthropic Claude (`claude-3-5-sonnet`) and OpenAI (`gpt-4o`) with key presence validation.
  - Core agent loop (`backend/app/agents/base.py`) with strict anti-hallucination guardrail (`"I cannot find information about this in the podcast transcripts."`) when retrieval similarity is below threshold.
  - Ship 30 for 30 Skill (`backend/app/agents/skills/ship30_writer.py`): generates atomic essays (~1,250 words) featuring a strong hook, clear narrative progression, skimmable headings and bullet points, single tactical takeaway, and HTML artifact wrapping.

---

#### Phase 4: Automated Verification, Regressions & Resolutions (Completed)
- **Automated Test Suite**:
  - `backend/tests/test_api.py`: Validates `/healthz`, `/ready`, session CRUD, context isolation, chat query execution, and provider listing.
  - `backend/tests/test_retrieval.py`: Validates semantic chunker metadata preservation, grounded retrieval confidence, and strict out-of-domain refusal guardrail.
  - `backend/tests/test_skills.py`: Validates Ship 30 atomic essay structure (hook, headers, bullets, single tactical takeaway, grounded citation tags).
  - `backend/tests/test_security.py`: Validates artifact sanitization against `<script>` injection, inline event handlers, `javascript:` URIs, and iframe origin isolation.
- **Issues Encountered & Fixes Applied**:
  - *Issue 1 (SQLAlchemy MissingGreenlet on relationships)*:
    *Root Cause*: Asynchronously querying `Session` and accessing `self.messages` triggered lazy-load IO on an un-awaited relationship.
    *Resolution*: Added `lazy="selectin"` to `Session.messages` and `Message.citations` in `models.py`.
  - *Issue 2 (OOD query false-positive similarity)*:
    *Root Cause*: 256-dimension hash collisions between unrelated vocabulary and transcripts caused cosine similarities above 0.25.
    *Resolution*: Increased default embedding dimension to 2048 with token unigrams and bigrams, creating a wide separation margin (OOD: ~0.12 vs Grounded: ~0.62).
  - *Issue 3 (Ollama timeout latency during offline test execution)*:
    *Root Cause*: Repeated HTTP connection attempts to unopened port `:11434` delayed offline test cycles.
    *Resolution*: Implemented cached connectivity check in `VectorStore._check_ollama_availability()`, falling back to local deterministic embedding in milliseconds when Ollama is offline.
  - *Final Result*: **16 / 16 tests passing cleanly (`100% pass rate`)**.

---

#### Phase 5: Dual-Pane Frontend & Sandboxed Artifacts (In Progress)
- React 18 + TypeScript + Tailwind CSS application featuring side-by-side split screen workspace.
- `ChatInterface.tsx`: Message stream with grounded citation pills and interactive popovers.
- `ArtifactViewer.tsx`: Sandboxed iframe with `sandbox="allow-scripts"` and strict CSP isolation.
- `ModelSelector.tsx`: Dynamic UI toggle switching between Local Ollama and Cloud Claude/OpenAI at runtime.
- `SessionSidebar.tsx`: Multi-session management with context isolation and real-time backend readiness status.
