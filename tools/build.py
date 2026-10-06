#!/usr/bin/env python3
"""Build docs.pnlcs.com: Zensical, then a few touches it does not do itself.

    python3 tools/build.py            # docs/ -> site/

After the build:
  * the block between <!--pn-top--> and <!--/pn-top--> (date, command variables)
    moves below the page's first <h1>, which Zensical renders inside the content;
  * every page gets "Updated <date>" from git: the newest of the date recorded
    when the page was imported from PNLCS (data/upstream.json) and the last
    commit in this repository that changed it after the import.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
SITE = ROOT / "site"
UPSTREAM = ROOT / "data" / "upstream.json"
MARKER = "<!--pn-updated-->"
TOP = re.compile(r"<!--pn-top-->(.*?)<!--/pn-top-->", re.S)
CLOCK = (
    '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
    'stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/>'
    '<polyline points="12 6 12 12 16 14"/></svg>'
)


def zensical() -> str:
    local = ROOT / ".venv" / "bin" / "zensical"
    return str(local) if local.exists() else "zensical"


def own_dates() -> dict[str, str]:
    """Last commit date per docs file in this repository, after the import commit."""
    if not (ROOT / ".git").exists():
        return {}
    since = json.loads(UPSTREAM.read_text())["imported_at"] if UPSTREAM.exists() else None
    args = ["git", "-C", str(ROOT), "log", "--format=@%cs", "--name-only"]
    if since:
        args.append(f"--since={since}T23:59:59")
    args += ["--", "docs"]
    out = subprocess.run(args, capture_output=True, text=True, check=False).stdout
    dates: dict[str, str] = {}
    current = ""
    for line in out.splitlines():
        if line.startswith("@"):
            current = line[1:]
        elif line.strip() and current:
            dates.setdefault(line.removeprefix("docs/"), current)
    return dates


def page_html(md: Path) -> Path:
    rel = md.relative_to(DOCS).with_suffix("")
    if rel.name == "index":
        return SITE / rel.parent / "index.html"
    return SITE / rel / "index.html"


def move_top(text: str) -> str:
    m = TOP.search(text)
    if not m:
        return text
    text = text[: m.start()] + text[m.end():]
    end = text.find("</h1>")
    return text if end < 0 else text[: end + 5] + m.group(1) + text[end + 5:]


def stamp() -> int:
    upstream = json.loads(UPSTREAM.read_text())["files"] if UPSTREAM.exists() else {}
    own = own_dates()
    count = 0
    for md in sorted(DOCS.rglob("*.md")):
        rel = md.relative_to(DOCS).as_posix()
        html = page_html(md)
        if not html.exists():
            continue
        text = move_top(html.read_text())
        candidates = [d for d in (upstream.get(rel), own.get(rel)) if d]
        if candidates and MARKER in text:
            newest = max(candidates)
            label = date.fromisoformat(newest).strftime("%-d %B %Y")
            text = text.replace(MARKER, f'{CLOCK}<span>Updated <time datetime="{newest}">{label}</time></span>', 1)
            count += 1
        html.write_text(text)
    return count


def main() -> int:
    result = subprocess.run([zensical(), "build", "--clean"], cwd=ROOT, check=False)
    if result.returncode:
        return result.returncode
    print(f"dates: {stamp()} pages")
    return 0


if __name__ == "__main__":
    sys.exit(main())
