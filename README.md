# The Lenny Growth Assistant

[![Tests Passing](https://img.shields.io/badge/tests-16%20passed-10b981.svg?style=flat-square)](backend/tests/)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg?style=flat-square)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg?style=flat-square)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/frontend-React%2018%20%2B%20TypeScript-61dafb.svg?style=flat-square)](https://react.dev/)
[![Docker](https://img.shields.io/badge/orchestration-Docker%20Compose-2496ed.svg?style=flat-square)](docker-compose.yml)
[![Local LLM](https://img.shields.io/badge/local%20llm-Ollama%20REST-orange.svg?style=flat-square)](https://ollama.ai/)

> **An enterprise-grade, retrieval-augmented intelligence copilot built for growth leaders, product managers, and founders.** Grounded strictly in Lenny Rachitsky's podcast interviews with elite product leaders—including **Shreyas Doshi**, **Elena Verna**, and **Brian Balfour**.

---

## 1. Key Capabilities & Architectural Highlights

1. **Strict Source Grounding & Zero-Hallucination Guardrail**:
   - Every factual answer cites verified transcript sources in the format `[Guest - Episode Title]`.
   - Built-in anti-hallucination guardrail: If the transcript index cannot support an answer, the model deterministically returns:
     > *"I cannot find information about this in the podcast transcripts."*

2. **Dual-Pane Claude-Style Artifacts Workspace**:
   - Side-by-side interactive split screen.
   - Automatically detects generated frameworks, HTML presentations, and markdown essays, rendering them live beside the chat stream.

3. **Defense-in-Depth Artifact Security Sandbox**:
   - Dynamic HTML/CSS artifacts render strictly inside an isolated child `<iframe>` configured with `sandbox="allow-scripts"` (strictly omitting `allow-same-origin` and `allow-top-navigation`).
   - Server-side and client-side sanitization strips dangerous tags (`<script>`, `<object>`), event handlers (`onload`, `onerror`), and `javascript:` URIs.

4. **Dynamic Runtime LLM Provider Switching**:
   - Zero-restart switching between:
     - **Ollama (Local Default)**: 100% private, runs entirely on your local machine via Ollama's REST API (`:11434`).
     - **Claude 3.5 Sonnet (Anthropic)**: High-reasoning strategic synthesis.
     - **GPT-4o (OpenAI)**: Flagship multimodal intelligence.
   - Graceful fallback: If cloud keys are missing or Ollama is offline, the system continues operating with clear diagnostics without crashing.

5. **Ship 30 for 30 Atomic Essay Writer Skill**:
   - Dedicated skill engine (`backend/app/agents/skills/ship30_writer.py`) converting podcast insights into an atomic essay (~1,250 words) featuring:
     - High-stakes Hook
     - Narrative Progression with skimmable headings and bolding
     - Single Tactical Takeaway

---

## 2. System Architecture

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT VIEWPORT                                      |
|  +--------------------+  +--------------------------------+  +------------------------+ |
|  |   SessionSidebar   |  |         ChatInterface          |  |     ArtifactViewer     | |
|  |  * Multi-Session   |  |  * Citation Popover Inspect    |  |  * Sandboxed IFrame    | |
|  |  * DB Status       |  |  * Ship 30 Mode Toggle         |  |  * Live Preview / Code | |
|  +--------------------+  +--------------------------------+  +------------------------+ |
+-------------------------------------------|---------------------------------------------+
                                            | REST / JSON
                                            v
+-----------------------------------------------------------------------------------------+
|                              FASTAPI ASYNC GATEWAY (:8000)                              |
|  - CORS & Structured JSON Error Middleware                                              |
|  - PostgreSQL Persistence (SQLAlchemy 2.0 Async ORM with Session Isolation)             |
|                                                                                         |
|  +----------------------------+       +-----------------------------------------------+ |
|  |        RAG Engine          |       |            Pluggable Provider Dispatcher      | |
|  |  - Recursive Chunker       | ----> |  - OllamaProvider (Local REST :11434)         | |
|  |  - 2048-dim Vector Store   |       |  - AnthropicProvider (Claude 3.5 Sonnet)      | |
|  |  - Grounding Guardrail     |       |  - OpenAIProvider (GPT-4o)                    | |
|  +----------------------------+       +-----------------------------------------------+ |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Quickstart Guide

### Option A: Single-Command Docker Compose (Recommended)

1. **Clone the repository and prepare environment variables**:
   ```bash
   cp .env.example .env
   ```

2. **Spin up all containerized services**:
   ```bash
   docker compose up --build
   ```
   This orchestrates:
   - `postgres`: PostgreSQL 16 relational database on port `5432`
   - `ollama`: Local Ollama service on port `11434`
   - `backend`: FastAPI async engine on port `8000`
   - `frontend`: React SPA on port `3000`

3. **Open the application**:
   - Web App: `http://localhost:3000`
   - API Docs (Swagger): `http://localhost:8000/docs`
   - Healthcheck: `http://localhost:8000/healthz`
   - Readiness Check: `http://localhost:8000/ready`

---

### Option B: Local Standalone Development

#### 1. Backend Setup
```bash
# Navigate to repo root
pip install -r backend/requirements.txt

# Run standalone transcript ingestion
python data/ingest.py

# Start FastAPI backend
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup
```bash
# In another terminal:
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 4. Local Ollama Setup Guide

The application is configured to run **100% locally out-of-the-box**:

1. **Install Ollama** (if running outside Docker):
   Download from [ollama.ai](https://ollama.ai/) or install via package manager:
   ```bash
   # macOS / Linux
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Start the Ollama daemon**:
   ```bash
   ollama serve
   ```

3. **Pull the default model**:
   ```bash
   ollama pull llama3:8b
   ```
   *(Optional lightweight alternatives: `ollama pull mistral:7b` or `ollama pull phi3:mini`)*

4. **Verify Connectivity**:
   ```bash
   curl http://localhost:11434/api/tags
   ```

> **Note on Graceful Offline Fallback**: If Ollama is not running on your host, The Lenny Growth Assistant automatically falls back to deterministic local synthesis with diagnostic guidance, allowing full evaluation without any blocker.

---

## 5. Automated Test Suite Execution

The repository contains automated unit, integration, and security tests covering all critical paths:

```bash
python -m pytest backend/tests -v
```

### Test Coverage Matrix:
| Test File | Scenarios Covered | Status |
| :--- | :--- | :--- |
| `backend/tests/test_api.py` | `/healthz`, `/ready`, Session CRUD, Context Isolation, Grounded Chat, Provider Listing | **PASSED** |
| `backend/tests/test_retrieval.py` | Recursive Semantic Chunker, Grounded Similarity Ranking, Out-of-Domain Refusal Guardrail | **PASSED** |
| `backend/tests/test_skills.py` | Ship 30 for 30 Atomic Essay generation (Hook, Narrative, Skimmable Bullets, Single Takeaway) | **PASSED** |
| `backend/tests/test_security.py` | HTML Sanitization (stripping `<script>`, event handlers, `javascript:` URLs), Iframe Sandbox isolation | **PASSED** |

---

## 6. Manual UI Verification & Test Plan

Follow this structured manual test plan to verify the complete user experience:

| Step # | Action | Expected Result | Verified |
| :---: | :--- | :--- | :---: |
| **1** | Open `http://localhost:3000` in browser | Clean dual-pane dark-mode UI loads. Top bar displays model selector; sidebar displays session list and indexed chunk status (26 chunks). | [x] |
| **2** | Click the starter card: *"Draft a Ship 30 for 30 essay on Shreyas Doshi's High Agency"* | Assistant streams grounded essay with explicit `[Shreyas Doshi - High Agency]` citation pills. The right-hand Artifact Viewer automatically opens rendering the styled atomic essay. | [x] |
| **3** | In Artifact Viewer, switch between **"Preview"** and **"Code"** tabs | "Preview" renders formatted document inside the isolated iframe. "Code" displays raw source with 1-click clipboard copy. | [x] |
| **4** | Click a Citation badge (e.g. `[Shreyas Doshi]`) | A citation inspection modal opens displaying the exact transcript snippet, section header, and similarity confidence score. | [x] |
| **5** | Switch Model Selector in top bar to `Claude 3.5 Sonnet` or `OpenAI GPT-4o` | Model switch updates instantly without restarting service or reloading page. | [x] |
| **6** | Submit an Out-of-Domain prompt: *"How do I bake french chocolate croissants from scratch?"* | Model triggers the anti-hallucination guardrail, responding verbatim: *"I cannot find information about this in the podcast transcripts."* with zero citations. | [x] |
| **7** | Click **"+ New Strategy Session"** in the sidebar | A new isolated session is initialized. Past message history is preserved in the previous session and does not leak into the new thread. | [x] |
| **8** | Delete a session using the trash icon | The session and its associated messages/citations are deleted from persistent storage. | [x] |

---

## 7. Deliverables Checklist

- [x] **Deliverable 1**: `docs/PRD.md` (Personas, measurable metrics, assumptions, scope boundaries, risks & trade-offs)
- [x] **Deliverable 2**: `docs/architecture.md` (Mermaid topology, database schema, data flow, security model)
- [x] **Deliverable 3**: `docs/design.md` (UI/UX principles, dual-pane architecture, interaction states, a11y)
- [x] **Deliverable 4**: `backend/` complete FastAPI service with Pydantic v2 schemas, SQLAlchemy 2.0 async persistence, pluggable local/cloud providers, and all automated tests passing.
- [x] **Deliverable 5**: `frontend/` React 18 + TypeScript + Tailwind dual-pane workspace with sandboxed artifact viewer.
- [x] **Deliverable 6**: `data/` sample transcripts (Shreyas Doshi, Elena Verna, Brian Balfour) & `data/ingest.py` CLI script.
- [x] **Deliverable 7**: `docker-compose.yml` & `.env.example` enabling single-command local orchestration.
- [x] **Deliverable 8**: `docs/agent_transcripts/coding-agent-log.md` & `README.md` documenting the full engagement.
