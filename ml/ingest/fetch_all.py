#!/usr/bin/env python3
from __future__ import annotations
import subprocess
import sys


def run(cmd: list[str]) -> int:
    print("+", " ".join(cmd), flush=True)
    return subprocess.call(cmd)


def main(argv: list[str]) -> int:
    rc = 0
    rc |= run([sys.executable, "ml/ingest/fetch_github.py"])  # type: ignore
    rc |= run([sys.executable, "ml/ingest/fetch_hf.py"])      # type: ignore
    rc |= run([sys.executable, "ml/ingest/fetch_wikipedia.py"])  # type: ignore
    rc |= run([sys.executable, "ml/ingest/fetch_arxiv.py"])   # type: ignore
    rc |= run([sys.executable, "ml/ingest/fetch_web.py"])     # type: ignore
    return rc


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
