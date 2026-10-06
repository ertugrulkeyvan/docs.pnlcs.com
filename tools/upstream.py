#!/usr/bin/env python3
"""Keep these docs in step with the PNLCS source code.

The docs live here, the code lives in Panelica/pnlcs. This tool compares the two
through a local clone of PNLCS (PNLCS_SRC, default ../../../pratix/pnlcs-moduller/kaynak/pnlcs).

    python3 tools/upstream.py status        # what changed in PNLCS since the last check
    python3 tools/upstream.py stale         # pages whose `sources:` changed since they were checked
    python3 tools/upstream.py mark <commit> # record that the docs are checked up to <commit>
    python3 tools/upstream.py import        # first import only: record per-page dates from PNLCS docs/

A page lists the code it describes in its front matter:

    ---
    sources:
      - app/Console/Commands/ApiDocsCommand.php
      - modules/Servers/Proxmox/
    ---
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
STATE = ROOT / "data" / "upstream.json"
SRC = Path(os.environ.get("PNLCS_SRC", ROOT.parent.parent.parent / "pratix" / "pnlcs-moduller" / "kaynak" / "pnlcs")).resolve()
REF = os.environ.get("PNLCS_REF", "origin/main")


def git(*args: str) -> str:
    return subprocess.run(["git", "-C", str(SRC), *args], capture_output=True, text=True, check=True).stdout


def load() -> dict:
    return json.loads(STATE.read_text()) if STATE.exists() else {}


def save(state: dict) -> None:
    STATE.parent.mkdir(exist_ok=True)
    STATE.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n")


def front_matter_sources(md: Path) -> list[str]:
    text = md.read_text()
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if not m:
        return []
    block = re.search(r"^sources:\n((?:\s+- .+\n?)+)", m.group(1) + "\n", re.M)
    if not block:
        return []
    return [line.strip()[2:].strip() for line in block.group(1).splitlines() if line.strip()]


def cmd_import() -> int:
    state = load()
    head = git("rev-parse", "--short", REF).strip()
    files = {}
    for md in DOCS.rglob("*.md"):
        rel = md.relative_to(DOCS).as_posix()
        stamp = git("log", "-1", "--format=%cs", REF, "--", f"docs/{rel}").strip()
        if stamp:
            files[rel] = stamp
    state.update({"commit": head, "checked": head, "imported_at": date.today().isoformat(), "files": files})
    save(state)
    print(f"recorded {len(files)} pages from PNLCS {head}")
    return 0


def cmd_status() -> int:
    state = load()
    base = state.get("checked")
    if not base:
        print("no checked commit; run `import` or `mark` first")
        return 1
    git("fetch", "--quiet", "origin")
    log = git("log", "--format=%h %cs %s", f"{base}..{REF}")
    if not log.strip():
        print(f"PNLCS has no new commits since {base}.")
        return 0
    commits = log.strip().splitlines()
    print(f"{len(commits)} new commits in PNLCS since {base}:\n")
    print(log)
    changed_docs = git("diff", "--name-only", f"{base}..{REF}", "--", "docs").split()
    if changed_docs:
        print("They changed these pages in PNLCS docs/ (port what is still right):")
        for path in changed_docs:
            print("  ", path)
    return 0


def cmd_stale() -> int:
    state = load()
    base = state.get("checked")
    if not base:
        print("no checked commit")
        return 1
    stale = 0
    unmapped = 0
    for md in sorted(DOCS.rglob("*.md")):
        sources = front_matter_sources(md)
        if not sources:
            unmapped += 1
            continue
        changed = git("log", "--format=%h %cs %s", f"{base}..{REF}", "--", *sources).strip()
        if changed:
            stale += 1
            print(f"\n{md.relative_to(DOCS)}")
            for line in changed.splitlines():
                print("   ", line)
    print(f"\n{stale} page(s) may be out of date; {unmapped} page(s) have no `sources:` yet.")
    return 0


def cmd_mark(commit: str) -> int:
    state = load()
    full = git("rev-parse", "--short", commit).strip()
    state["checked"] = full
    save(state)
    print(f"docs checked up to PNLCS {full}")
    return 0


def main(argv: list[str]) -> int:
    if not SRC.exists():
        print(f"PNLCS clone not found at {SRC}; set PNLCS_SRC")
        return 1
    if not argv or argv[0] not in {"status", "stale", "mark", "import"}:
        print(__doc__)
        return 1
    if argv[0] == "mark":
        return cmd_mark(argv[1] if len(argv) > 1 else REF)
    return {"status": cmd_status, "stale": cmd_stale, "import": cmd_import}[argv[0]]()


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
