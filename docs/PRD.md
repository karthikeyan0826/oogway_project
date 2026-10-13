# Product Requirements Document (PRD)
## The Lenny Growth Assistant

### 1. Executive Summary & Vision
**The Lenny Growth Assistant** is an enterprise-grade, retrieval-augmented intelligence copilot built for growth leaders, product managers, and founders. It extracts actionable frameworks, tactical methodologies, and organizational wisdom directly from Lenny Rachitsky's podcast interviews with elite product leaders (including Shreyas Doshi, Elena Verna, and Brian Balfour). 

Unlike generic LLMs prone to hallucination and vague platitudes, The Lenny Growth Assistant enforces **strict source grounding**, provides **clickable verified transcript citations**, supports **dual-pane interactive artifact generation** (such as Ship 30 for 30 atomic essays, product roadmaps, and growth frameworks), and enables **dynamic runtime switching** between privacy-first local models (Ollama) and high-reasoning cloud providers (Claude 3.5 Sonnet, GPT-4o).

---

### 2. User Personas & Core Journeys

| Persona | Role & Context | Pain Points | Primary Jobs to Be Done (JTBD) |
| :--- | :--- | :--- | :--- |
| **P1: The Growth Lead** *(Elena, Head of Growth)* | Scaling B2B self-serve funnel or PLG motion. | Overwhelmed by generic advice; needs battle-tested tactical playbooks (e.g., product-led sales loops, virality metrics). | "Retrieve exact framework Brian Balfour or Elena Verna used to design self-reinforcing growth loops and format it into a tactical execution brief." |
| **P2: The Senior Product Manager** *(Alex, Group PM)* | Navigating roadmap prioritization, career growth, and stakeholder alignment. | High cognitive load; struggles to remember exact mental models (e.g., Shreyas Doshi’s High Agency, Good vs Great PM, LNO framework). | "Synthesize Shreyas Doshi's High Agency definition with concrete behavioral examples and output a Ship 30 for 30 atomic essay for team distribution." |
| **P3: The Seed/Series A Founder** *(Maya, Technical Founder)* | Transitioning from zero-to-one to scalable go-to-market. | Lacks senior product leadership advisory; needs high-fidelity answers with zero hallucinated fluff. | "Ask hyper-specific questions about early retention benchmarks and receive verbatim, cited answers without risking data privacy." |

---

### 3. Measurable Success Metrics & KPIs

To validate production readiness, the system is measured against explicit quantitative SLOs:

| Metric | Target SLA / KPI | Measurement Method |
| :--- | :--- | :--- |
| **Grounded Retrieval Precision** | $\ge 98\%$ grounded responses with explicit `[Guest - Title]` citations | Automated test suite validating citations on known benchmark queries. |
| **Zero-Hallucination Guardrail** | $100\%$ refusal rate on Out-Of-Domain (OOD) queries ("I cannot find information about this in the podcast transcripts.") | Red-team test cases with non-podcast topics (e.g., quantum computing, general cooking recipes). |
| **Time-to-First-Token (TTFT)** | $< 800\text{ ms}$ (Cloud) / $< 1,800\text{ ms}$ (Local Ollama) | Backend API latency logging via structured JSON telemetry. |
| **Session Isolation** | $100\%$ context segregation across sessions | Multi-session test suite verifying zero cross-contamination of message history or state. |
| **Artifact Security Sandbox** | $0$ XSS vulnerabilities, $0$ parent `window` DOM leaks | Automated security suite injecting malicious script payloads, event handlers, and data URIs into rendered artifacts. |
| **Local Offline Independence** | Fully operational demo out-of-the-box via Ollama REST API without cloud credentials | Docker-compose boot verification without internet access or API keys. |

---

### 4. Assumptions & System Constraints

1. **Transcript Quality**: Transcripts are pre-processed into structured markdown/text format with speaker tags, episode titles, and timestamps or topical section headers.
2. **Compute Flexibility**: The default demo runs locally on standard developer hardware (Apple Silicon M-series or modern x86 CPU with 16GB RAM) using lightweight quantization (e.g., `llama3:8b`, `mistral:7b`, or `phi3:mini`).
3. **Hybrid Fallback**: Cloud APIs (Anthropic Claude, OpenAI) can be activated at runtime via UI or header without restarting the application; missing keys trigger non-blocking graceful fallbacks.
4. **Isolated Sandboxing**: Any dynamic HTML/CSS rendered in the Artifacts viewer must execute strictly within an isolated `<iframe>` (`sandbox="allow-scripts"`) with origin isolation and pre-sanitized content.

---

### 5. Scope Boundaries

#### In-Scope (Phase 1 / Forward-Deployed MVP)
- Fast semantic vector search over curated core transcripts (Shreyas Doshi, Elena Verna, Brian Balfour).
- Dynamic model toggle (Ollama, Claude, OpenAI) switchable per-session or per-message.
- Dual-pane Claude-style workspace: Interactive chat on the left, rich Artifact Viewer on the right.
- In-app Ship 30 for 30 essay generation skill (~1,250 words, strong hook, narrative progression, skimmable headers, and single tactical takeaway).
- Strict citation engine with `[Guest - Episode Title]` grounded source links.
- Production-grade Docker Compose orchestration, PostgreSQL database, and automated test suite.

#### Out-of-Scope (Future Enhancements)
- Real-time YouTube / Spotify audio stream ingestion and live speech-to-text transcribing.
- Multi-user authentication with OAuth2/SAML SSO (deferred to enterprise phase; session UUIDs used currently).
- Direct social syndication (e.g., auto-posting generated Ship 30 essays to X or LinkedIn via API).

---

### 6. Risks, Trade-offs & Mitigations

| Risk / Challenge | Severity | Trade-off / Architectural Decision | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Ollama Hardware Latency** | Medium | Local LLMs on lower-end CPUs may take 10-25 seconds to generate full 1,200-word essays. | Provide responsive status indicators, support streaming or chunked updates, and offer instant one-click toggle to Cloud Claude/OpenAI when fast throughput is required. |
| **Strict RAG Refusal vs User Helpfulness** | High | Strict anti-hallucination guardrail might frustrate users asking border-case questions. | System explicitly clarifies missing corpus knowledge and suggests related podcast topics found in index. |
| **HTML/CSS Artifact Injection (XSS)** | Critical | Allowing models to generate raw HTML/CSS creates arbitrary script execution risks. | Multi-tier defense: (1) Server/Client regex and DOMPurify sanitization stripping scripts and unsafe handlers; (2) Sandboxed iframe with `sandbox="allow-scripts"` and `sandbox` attributes preventing parent window / cookie access. |
| **Context Window Overflow** | Medium | Long transcripts plus conversation history may exceed smaller local model context (e.g., 4k/8k tokens). | Semantic chunking with top-k=4 reranked chunks, injecting precise context snippets rather than whole transcript sections. |
