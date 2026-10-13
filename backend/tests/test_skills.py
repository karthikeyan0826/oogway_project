import pytest
from backend.app.agents.skills.ship30_writer import Ship30Writer

def test_ship30_essay_structure_and_components():
    writer = Ship30Writer()
    topic = "Draft an atomic essay on High Agency and LNO framework from Shreyas Doshi"
    citations = [
        {
            "guest": "Shreyas Doshi",
            "episode_title": "High Agency, Good vs Great Product Managers, and The LNO Framework",
            "section": "The LNO Framework",
            "snippet": "LNO stands for Leverage, Neutral, and Overhead...",
            "score": 0.92,
        }
    ]
    context = "High agency is the refusal to accept that the world is fixed... LNO stands for Leverage, Neutral, Overhead."

    essay = writer.generate_grounded_essay(
        topic=topic,
        citations=citations,
        context_text=context
    )

    # 1. Validate Essential Ship 30 Components
    assert essay.title is not None and len(essay.title) > 0
    assert essay.hook is not None and len(essay.hook) > 20
    assert essay.tactical_takeaway is not None and len(essay.tactical_takeaway) > 20
    assert essay.guest == "Shreyas Doshi"
    assert "Shreyas Doshi" in essay.episode_title or "High Agency" in essay.episode_title

    # 2. Validate Markdown Formatting & Skimmability
    md = essay.to_markdown()
    assert "# " in md
    assert "### The Hook" in md
    assert "### The Single Tactical Takeaway" in md
    assert "Shreyas Doshi" in md
    assert "[Shreyas Doshi - " in md

    # 3. Validate HTML Artifact Generation
    html = essay.to_html()
    assert "<!DOCTYPE html>" in html
    assert "Content-Security-Policy" in html
    assert "ship30-essay" in html
    assert "The Single Tactical Takeaway" in html
    assert "<script>" not in html  # Must be clean from unescaped malicious scripts

def test_ship30_balfour_loops_essay():
    writer = Ship30Writer()
    topic = "Explain why growth loops beat traditional funnels from Brian Balfour"
    citations = [
        {
            "guest": "Brian Balfour",
            "episode_title": "Growth Loops vs Funnels",
            "section": "Why Funnels Are Obsolete",
            "snippet": "Funnels are linear while technology companies are built on compounding loops.",
            "score": 0.88,
        }
    ]
    essay = writer.generate_grounded_essay(topic=topic, citations=citations, context_text="...")
    assert "Growth Loops" in essay.title or "Funnel" in essay.title
    assert "Brian Balfour" in essay.to_markdown()
    assert essay.tactical_takeaway != ""
