"""Check local HTML and stylesheet references in the Remember Me site."""

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import List, Optional, Tuple
from urllib.parse import unquote, urlsplit


URL_PATTERN = re.compile(
    r"""url\(\s*(?:"(?P<double>[^"]*)"|'(?P<single>[^']*)'|(?P<bare>[^)]*))\s*\)""",
    re.IGNORECASE,
)
SKIPPED_SCHEMES = {"data", "http", "https", "mailto", "tel", "javascript"}


class ReferenceCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: List[str] = []

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]) -> None:
        for name, value in attrs:
            if name in {"href", "src"} and value:
                self.references.append(value)


def local_target(root: Path, base: Path, reference: str) -> Optional[Path]:
    parsed = urlsplit(reference.strip())
    if parsed.scheme.lower() in SKIPPED_SCHEMES or parsed.netloc or not parsed.path:
        return None

    path = Path(unquote(parsed.path))
    if path.is_absolute():
        return root / str(path).lstrip("\\/")
    return base / path


def check_html(root: Path) -> List[str]:
    errors: List[str] = []
    pages = sorted(root.rglob("*.html"))

    for page in pages:
        parser = ReferenceCollector()
        parser.feed(page.read_text(encoding="utf-8"))
        for reference in parser.references:
            target = local_target(root, page.parent, reference)
            if target is not None and not target.exists():
                errors.append(f"{page.relative_to(root)} -> {reference}")

    return errors


def css_urls(stylesheet: Path) -> List[str]:
    text = stylesheet.read_text(encoding="utf-8")
    urls: List[str] = []
    for match in URL_PATTERN.finditer(text):
        reference = match.group("double") or match.group("single") or match.group("bare")
        if reference:
            urls.append(reference.strip())
    return urls


def check_css(root: Path) -> List[str]:
    errors: List[str] = []
    stylesheets = sorted(root.rglob("*.css"))

    if not stylesheets:
        return ["No CSS stylesheet was found."]

    for stylesheet in stylesheets:
        for reference in css_urls(stylesheet):
            target = local_target(root, stylesheet.parent, reference)
            if target is not None and not target.exists():
                errors.append(f"{stylesheet.relative_to(root)} -> {reference}")

    return errors


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    errors = check_html(root) + check_css(root)

    if errors:
        for error in errors:
            print(f"Broken local reference: {error}")
        return 1

    print("All local HTML and CSS references are valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
 