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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.8;
      color: #27272a;
      background-color: #ffffff;
      margin: 0;
      padding: 40px 32px;
      max-width: 740px;
      margin-left: auto;
      margin-right: auto;
    }}
    h1, h2, h3, h4 {{
      font-family: "Newsreader", Charter, "Bitstream Charter", Georgia, Cambria, serif;
      color: #18181b;
      font-weight: 600;
      letter-spacing: -0.015em;
      margin-top: 1.8em;
      margin-bottom: 0.5em;
    }}
    h1 {{ 
      font-size: 2.15rem; 
      line-height: 1.25; 
      border-bottom: 1px solid #e7e5e4; 
      padding-bottom: 16px; 
      margin-top: 0.5em;
    }}
    h2 {{ font-size: 1.45rem; color: #1c1917; }}
    h3 {{ font-size: 1.2rem; color: #292524; }}
    p {{ margin-bottom: 1.3em; color: #27272a; font-size: 1.05rem; }}
    strong {{ color: #18181b; font-weight: 600; }}
    ul, ol {{ padding-left: 24px; margin-bottom: 1.3em; color: #27272a; }}
    li {{ margin-bottom: 0.5em; line-height: 1.7; }}
    blockquote {{
      border-left: 3px solid #292524;
      margin: 1.8em 0;
      padding: 14px 22px;
      background: #fafaf9;
      color: #292524;
      border-radius: 0 6px 6px 0;
      font-family: "Newsreader", Georgia, serif;
      font-style: italic;
      font-size: 1.08rem;
    }}
    .takeaway-card {{
      background: #fafaf9;
      border: 1px solid #e7e5e4;
      border-left: 4px solid #1c1917;
      padding: 22px 24px;
      border-radius: 8px;
      margin-top: 36px;
    }}
  </style>
</head>
<body>
  {sanitized_body}
</body>
</html>"""
