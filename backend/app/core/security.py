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
      color-scheme: light;
    }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.7;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 32px;
      max-width: 720px;
      margin-left: auto;
      margin-right: auto;
    }}
    h1, h2, h3, h4 {{
      font-family: Georgia, Cambria, "Times New Roman", Times, serif;
      color: #0f172a;
      font-weight: 700;
      margin-top: 1.6em;
      margin-bottom: 0.5em;
    }}
    h1 {{ font-size: 2rem; border-bottom: 2px solid #ea580c; padding-bottom: 12px; }}
    h2 {{ font-size: 1.5rem; color: #c2410c; }}
    h3 {{ font-size: 1.25rem; color: #1e293b; }}
    p {{ margin-bottom: 1.2em; color: #334155; font-size: 1.05rem; }}
    strong {{ color: #0f172a; }}
    ul, ol {{ padding-left: 24px; margin-bottom: 1.2em; color: #334155; }}
    li {{ margin-bottom: 0.5em; }}
    blockquote {{
      border-left: 3px solid #ea580c;
      margin: 1.5em 0;
      padding: 12px 20px;
      background: #fff7ed;
      color: #7c2d12;
      border-radius: 0 6px 6px 0;
      font-style: italic;
    }}
    .takeaway-card {{
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-left: 4px solid #ea580c;
      padding: 20px;
      border-radius: 8px;
      margin-top: 32px;
    }}
  </style>
</head>
<body>
  {sanitized_body}
</body>
</html>"""
