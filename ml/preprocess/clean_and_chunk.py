#!/usr/bin/env python3
from __future__ import annotations
import os
import sys
import pathlib
import re
from typing import Iterable
import yaml
from pydantic import BaseModel
from unidecode import unidecode


class Config(BaseModel):
    output_dir: str = "ml/ingest/out"


def read_all_markdown(root: pathlib.Path) -> Iterable[pathlib.Path]:
    for p in root.rglob("*.md"):
        if any(part.startswith(".") for part in p.parts):
            continue
        yield p


def basic_clean(text: str) -> str:
    text = unidecode(text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def chunk_text(text: str, max_tokens: int = 800, overlap: int = 120) -> list[str]:
    # naive token approx: 1 token ~ 4 chars in English
    max_chars = max_tokens * 4
    overlap_chars = overlap * 4
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        chunk = text[start:end]
        # try to end at paragraph boundary
        last_break = chunk.rfind("\n\n")
        if last_break > 0 and end < len(text):
            end = start + last_break + 2
            chunk = text[start:end]
        chunks.append(chunk.strip())
        if end == len(text):
            break
        start = max(0, end - overlap_chars)
    return [c for c in chunks if len(c) > 0]


def main(argv: list[str]) -> int:
    cfg_path = os.environ.get("INGEST_CONFIG", "ml/ingest/config.yaml")
    cfg = {}
    if pathlib.Path(cfg_path).exists():
        cfg = yaml.safe_load(open(cfg_path, "r", encoding="utf-8"))
    conf = Config(**cfg)

    in_root = pathlib.Path(conf.output_dir)
    out_root = pathlib.Path("ml/corpus")
    out_root.mkdir(parents=True, exist_ok=True)

    idx = 0
    for p in read_all_markdown(in_root):
        raw = p.read_text(encoding="utf-8", errors="ignore")
        cleaned = basic_clean(raw)
        chunks = chunk_text(cleaned)
        base = out_root / p.relative_to(in_root)
        base = base.with_suffix("")
        base.parent.mkdir(parents=True, exist_ok=True)
        for i, ch in enumerate(chunks):
            fp = base.parent / f"{base.name}__chunk_{i:04d}.txt"
            fp.write_text(ch, encoding="utf-8", errors="ignore")
            idx += 1
    print(f"preprocess: wrote {idx} chunks under {out_root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
