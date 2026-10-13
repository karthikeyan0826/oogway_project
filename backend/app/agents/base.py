import re
from typing import Dict, Any, List, Optional
from backend.app.rag.retriever import retriever, RetrievalResult
from backend.app.providers.cloud_provider import get_provider
from backend.app.agents.prompts import SYSTEM_GROWTH_PROMPT, SHIP30_SYSTEM_PROMPT
from backend.app.agents.skills.ship30_writer import ship30_writer
from backend.app.core.security import wrap_sandboxed_document, sanitize_html
from backend.app.core.logger import logger

class AgentRunResult:
    def __init__(
        self,
        content: str,
        citations: List[Dict[str, Any]],
        artifact: Optional[Dict[str, Any]],
        model_used: str,
        provider_used: str,
    ):
        self.content = content
        self.citations = citations
        self.artifact = artifact
        self.model_used = model_used
        self.provider_used = provider_used

    def to_dict(self) -> Dict[str, Any]:
        return {
            "content": self.content,
            "citations": self.citations,
            "artifact": self.artifact,
            "model_used": self.model_used,
            "provider_used": self.provider_used,
        }

class GrowthAgent:
    """
    Core agent loop orchestrating retrieval grounding, anti-hallucination guardrails,
    LLM provider dispatch, and artifact generation.
    """
    def __init__(self):
        self.retriever = retriever

    def _extract_html_artifact(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Detects HTML/CSS artifacts in markdown output and extracts them into a sandboxed payload.
        """
        html_match = re.search(r"```html\s*(.*?)\s*```", text, re.DOTALL | re.IGNORECASE)
        if html_match:
            raw_html = html_match.group(1).strip()
            # Extract possible title
            title_match = re.search(r"<h[12][^>]*>(.*?)</h[12]>", raw_html, re.IGNORECASE)
            title = title_match.group(1).strip() if title_match else "Growth Framework Artifact"
            
            wrapped = wrap_sandboxed_document(title, raw_html)
            return {
                "title": title,
                "type": "html",
                "content": wrapped,
                "raw_code": raw_html,
            }
        return None

    async def execute(
        self,
        query: str,
        session_id: Optional[str] = None,
        provider_name: Optional[str] = None,
        model_name: Optional[str] = None,
        skill: Optional[str] = None,
    ) -> AgentRunResult:
        logger.info(f"Executing agent with query: '{query}' | Provider: {provider_name} | Skill: {skill}")

        # 1. RAG Grounding Retrieval Step
        retrieval: RetrievalResult = await self.retriever.retrieve(query=query)

        # 2. Strict Anti-Hallucination & Out-Of-Domain Guardrail Check
        if not retrieval.is_grounded:
            return AgentRunResult(
                content=retrieval.refusal_message or "I cannot find information about this in the podcast transcripts.",
                citations=[],
                artifact=None,
                model_used=model_name or "grounding-guardrail",
                provider_used=provider_name or "local-guardrail",
            )

        # 3. Check for Ship 30 for 30 Skill Trigger
        q_lower = query.lower()
        is_ship30_request = (
            skill == "ship30"
            or "ship 30" in q_lower
            or "atomic essay" in q_lower
            or "write an essay" in q_lower
        )

        if is_ship30_request:
            logger.info("Triggered Ship 30 for 30 atomic essay generation skill.")
            essay = ship30_writer.generate_grounded_essay(
                topic=query,
                citations=retrieval.citations,
                context_text=retrieval.context_text,
            )
            markdown_content = essay.to_markdown()
            html_artifact = {
                "title": essay.title,
                "type": "html",
                "content": essay.to_html(),
                "raw_code": markdown_content,
            }
            return AgentRunResult(
                content=markdown_content,
                citations=retrieval.citations,
                artifact=html_artifact,
                model_used=model_name or "ship30-engine",
                provider_used=provider_name or "ship30-skill",
            )

        # 4. Standard LLM Provider Inference
        provider = get_provider(provider_name)
        prompt = (
            f"TRANSCRIPT CONTEXT:\n{retrieval.context_text}\n\n"
            f"USER QUESTION: {query}\n\n"
            f"Remember: Answer strictly using facts from the transcript context above. "
            f"Include exact citations like [{retrieval.citations[0]['guest']} - {retrieval.citations[0]['episode_title']}]."
        )

        llm_response = await provider.generate(
            prompt=prompt,
            system_prompt=SYSTEM_GROWTH_PROMPT,
            model=model_name,
        )

        # Detect any embedded HTML/CSS artifacts
        artifact = self._extract_html_artifact(llm_response.content)

        return AgentRunResult(
            content=llm_response.content,
            citations=retrieval.citations,
            artifact=artifact,
            model_used=llm_response.model,
            provider_used=llm_response.provider,
        )

growth_agent = GrowthAgent()
