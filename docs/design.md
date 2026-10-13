# Design Specification & UI/UX Principles
## The Lenny Growth Assistant

### 1. Design System & Aesthetics
The Lenny Growth Assistant interface is built around high-density, focus-oriented aesthetics inspired by modern knowledge workspaces (such as Claude Artifacts, Linear, and Notion). It uses a deep zinc/slate dark-mode palette accented with high-contrast emerald/indigo indicators to establish an executive, professional feel.

#### Palette Tokens
- **Background Root**: `hsl(222, 47%, 7%)` (Deep Midnight `#0b0f19`)
- **Surface Elevation 1**: `hsl(220, 26%, 14%)` (Card & Sidebar `#1a202c`)
- **Surface Elevation 2**: `hsl(217, 19%, 20%)` (Active controls & hover states `#283143`)
- **Border Subtle**: `hsl(215, 14%, 28%)` (`rgba(255, 255, 255, 0.08)`)
- **Accent Primary**: `hsl(160, 84%, 39%)` (Lenny Growth Mint `#10b981`)
- **Accent Secondary**: `hsl(245, 82%, 67%)` (Artifact Violet `#6366f1`)
- **Typography**: Inter / Outfit system font stacks with explicit tabular figures for metrics.

---

### 2. Dual-Pane Architecture Layout

The viewport is divided into a responsive 50/50 (or collapsible 60/40) split-pane layout:

```
+-----------------------------------------------------------------------------------------------+
| TOP BAR: [Logo: Lenny Growth AI] | Session Title | [Model Switcher: Ollama/Claude] | Status   |
+---------------------+------------------------------------------+------------------------------+
| SIDEBAR (240px)     | CHAT PANE (Flexible ~50%)                | ARTIFACT PANE (~50%)         |
|                     |                                          |                              |
| [+ New Session]     | Message Stream:                          | Header: [Type] [Title] [Copy]|
|                     | User: "Summarize High Agency from Shreyas"|                              |
| Sessions:           | Assistant:                               | Live Rendered Artifact:      |
| * Shreyas - Agency  | "Shreyas Doshi describes High Agency as  | +--------------------------+ |
| * Balfour Loops     | the ability to bend reality to your will | | <h1>High Agency Essay</h1>| |
| * Elena PLG Tactics | without relying on permission [1]."      | | <p>Hook: Most PMs wait..</p>|
|                     |                                          | | <h3>Tactical Rule:</h3>  | |
| System Health:      | Citations:                               | | Sandboxed IFrame Content | |
| [DB: OK] [RAG: OK]  | [[1] Shreyas Doshi - High Agency (04:12)]| +--------------------------+ |
|                     |                                          |                              |
|                     | [Prompt Input Box..................] [Send| Actions: [Raw Code | Render] |
+---------------------+------------------------------------------+------------------------------+
```

#### Dual-Pane Interaction Rules:
1. **Auto-Trigger**: When the agent generates structured code blocks (HTML, SVG, or marked Markdown essays), the Artifact pane automatically slides open into view.
2. **Tabbed Controls**: The Artifact pane offers a toggle between **"Live Preview"** (sandboxed view) and **"Code / Markdown"** (raw source with syntax highlighting and instant 1-click copy).
3. **Collapsibility**: Users on smaller viewports or users focused strictly on conversation can collapse or expand the Artifact pane with a single click or shortcut (`Cmd/Ctrl + B`).

---

### 3. Interaction States & Transitions

#### A. Empty / Onboarding State
- When no session is active or a new session is initialized, the chat pane renders curated prompt starter cards:
  - *"Draft a Ship 30 for 30 essay on Shreyas Doshi's High Agency framework"*
  - *"Explain Brian Balfour's Four Growth Fits (Market-Product, Product-Channel, Channel-Model, Model-Market)"*
  - *"What are Elena Verna's rules for hiring a Head of Growth vs Product-Led Sales?"*
- Clicking a card instantly populates and executes the query with relevant context tags.

#### B. Streaming & Inference State
- Pulsing indicator displays the active provider (e.g., `⚡ Generating with Ollama (local)...` or `🧠 Claude 3.5 Sonnet`).
- Progressive text streaming with smooth auto-scroll.
- Stop generation button to abort in-flight LLM token streaming.

#### C. Citations & Source Inspection
- Inline superscript badges (e.g., `[Shreyas Doshi - Ep. 42]`) rendered as interactive pills.
- Hovering or clicking reveals a grounded popover detailing:
  - Guest Name and Episode Title
  - Approximate timestamp or section header
  - Exact snippet verbatim retrieved from the vector index
  - Relevance confidence score

#### D. Model Selector & Fallback Warnings
- Floating dropdown in the navigation header allows dynamic switching between:
  - `Ollama (Local Default - llama3)`
  - `Claude 3.5 Sonnet (Anthropic)`
  - `GPT-4o (OpenAI)`
- If a cloud key is not present in `.env`, the UI displays a subtle indicator: *"API Key not detected; defaulting to Ollama local daemon"*, without blocking the user.

---

### 4. Accessibility & Inclusive Design (a11y)

The application adheres to **WCAG 2.1 AA** standards:
1. **Contrast Compliance**: All text elements maintain a minimum contrast ratio of 4.5:1 against their surface backgrounds; badges and primary buttons exceed 7:1.
2. **Keyboard Navigation**:
   - `Tab` and `Shift+Tab` provide logical navigation across sessions, message input, citation pills, and artifact action buttons.
   - `Enter` submits prompts; `Shift+Enter` inserts newlines.
   - `Esc` closes popovers, citation drawers, or modals.
3. **ARIA Semantic Attributes**:
   - `role="log"` and `aria-live="polite"` on the message stream container.
   - Clear `aria-label` tags on icon-only buttons (e.g., Send, Copy Code, Collapse Artifact Pane).
   - `role="region"` with `aria-label="Interactive Artifact Preview"` on the sandboxed iframe container.
