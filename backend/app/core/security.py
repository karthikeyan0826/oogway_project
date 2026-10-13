import re
from bs4 import BeautifulSoup

# Tags strictly stripped to prevent XSS and DOM hijacking
DISALLOWED_TAGS = {
    "script", "base", "meta", "object", "embed", "applet", 
    "iframe", "frame", "frameset"
}

# Attributes strictly stripped (all event handlers and script triggers)
DISALLOWED_ATTR_PATTERN = re.compile(r"^on[a-z]+", re.IGNORECASE)
DANGEROUS_PROTOCOL_PATTERN = re.compile(r"^\s*(javascript|vbscript|data):", re.IGNORECASE)

def sanitize_html(html_content: str) -> str:
    """
    Sanitize HTML string to eliminate XSS vectors, script execution,
    and parent origin manipulation before rendering in Artifact sandbox.
    """
    if not html_content or not isinstance(html_content, str):
        return ""

    soup = BeautifulSoup(html_content, "html.parser")

    # 1. Remove dangerous tags
    for tag in soup.find_all(DISALLOWED_TAGS):
        tag.decompose()

    # 2. Inspect all remaining tags and sanitize attributes
    for tag in soup.find_all(True):
        attrs_to_remove = []
        for attr, value in tag.attrs.items():
            # Check for event handlers (onclick, onerror, onload, etc.)
            if DISALLOWED_ATTR_PATTERN.match(attr):
                attrs_to_remove.append(attr)
                continue
            
            # Check for dangerous protocols in URLs (href, src, formaction, etc.)
            val_str = str(value)
            if attr in {"href", "src", "action", "formaction", "poster"}:
                if DANGEROUS_PROTOCOL_PATTERN.match(val_str):
                    attrs_to_remove.append(attr)
                    continue

            # Check style attribute for javascript/expression injection
            if attr == "style":
                if "expression" in val_str.lower() or "javascript:" in val_str.lower():
                    attrs_to_remove.append(attr)

        for attr in attrs_to_remove:
            del tag[attr]

    return str(soup)

def get_iframe_sandbox_policy() -> str:
    """
    Returns strict iframe sandbox policy string.
    Omitting 'allow-same-origin' guarantees complete isolation from parent window,
    cookies, localStorage, and authentication tokens.
    """
    return "allow-scripts"

def wrap_sandboxed_document(title: str, content_html: str) -> str:
    """
    Wraps sanitized HTML in a modern, secure full HTML template with inline styling
    and strict Content-Security-Policy.
    """
    sanitized_body = sanitize_html(content_html)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src https: data:; font-src https:;">
  <title>{title}</title>
  <style>
    :root {{
      color-scheme: dark;
    }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #e2e8f0;
      background-color: #0f172a;
      margin: 0;
      padding: 24px;
    }}
    h1, h2, h3, h4 {{
      color: #f8fafc;
      font-weight: 700;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }}
    h1 {{ font-size: 1.85rem; border-bottom: 1px solid #334155; padding-bottom: 8px; }}
    h2 {{ font-size: 1.45rem; color: #10b981; }}
    h3 {{ font-size: 1.2rem; color: #38bdf8; }}
    p {{ margin-bottom: 1em; color: #cbd5e1; }}
    strong {{ color: #ffffff; }}
    ul, ol {{ padding-left: 24px; margin-bottom: 1em; }}
    li {{ margin-bottom: 0.4em; }}
    blockquote {{
      border-left: 4px solid #10b981;
      margin: 1em 0;
      padding: 8px 16px;
      background: #1e293b;
      border-radius: 0 4px 4px 0;
    }}
    .takeaway-card {{
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.1));
      border: 1px solid #10b981;
      padding: 16px;
      border-radius: 8px;
      margin-top: 24px;
    }}
  </style>
</head>
<body>
  {sanitized_body}
</body>
</html>"""
