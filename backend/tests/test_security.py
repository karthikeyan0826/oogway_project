import pytest
from backend.app.core.security import (
    sanitize_html,
    get_iframe_sandbox_policy,
    wrap_sandboxed_document,
)

def test_sanitize_html_removes_script_tags():
    raw_payload = "<div><h1>Framework</h1><script>alert('XSS');</script><p>Clean content</p></div>"
    sanitized = sanitize_html(raw_payload)
    assert "<script>" not in sanitized
    assert "alert('XSS')" not in sanitized
    assert "Clean content" in sanitized

def test_sanitize_html_removes_inline_event_handlers():
    raw_payload = '<button onclick="exploit()" onmouseover="steal()" id="btn">Click me</button><img src="x" onerror="alert(1)"/>'
    sanitized = sanitize_html(raw_payload)
    assert "onclick" not in sanitized
    assert "onmouseover" not in sanitized
    assert "onerror" not in sanitized
    assert "Click me" in sanitized

def test_sanitize_html_removes_javascript_protocols():
    raw_payload = '<a href="javascript:alert(document.cookie)">Malicious Link</a><iframe src="javascript:alert(1)"></iframe>'
    sanitized = sanitize_html(raw_payload)
    assert "javascript:" not in sanitized
    assert "<iframe>" not in sanitized
    assert "Malicious Link" in sanitized

def test_iframe_sandbox_policy_guarantees_origin_isolation():
    policy = get_iframe_sandbox_policy()
    assert "allow-scripts" in policy
    # Crucial security assertion: allow-same-origin must NEVER be present
    assert "allow-same-origin" not in policy
    assert "allow-top-navigation" not in policy

def test_wrap_sandboxed_document_contains_strict_csp():
    doc = wrap_sandboxed_document("Growth Framework", "<p>Test body</p>")
    assert "Content-Security-Policy" in doc
    assert "default-src 'none'" in doc
    assert "Test body" in doc
    assert "<title>Growth Framework</title>" in doc
