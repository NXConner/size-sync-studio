#!/usr/bin/env python3
from __future__ import annotations
import os
import sys
import pathlib
import wikipediaapi
from pydantic import BaseModel
import yaml


class WikiConfig(BaseModel):
    pages: list[str] = []


class Config(BaseModel):
    sources: dict
    output_dir: str = "ml/ingest/out"


def main(argv: list[str]) -> int:
    cfg_path = os.environ.get("INGEST_CONFIG", "ml/ingest/config.yaml")
    with open(cfg_path, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)
    cfg = Config(**raw)
    w_cfg = WikiConfig(**cfg.sources.get("wikipedia", {}))

    base = pathlib.Path(cfg.output_dir)
    base.mkdir(parents=True, exist_ok=True)
    out_dir = base / "wikipedia"
    out_dir.mkdir(parents=True, exist_ok=True)

    wiki = wikipediaapi.Wikipedia("en")
    total = 0
    for title in w_cfg.pages:
        page = wiki.page(title)
        if not page.exists():
            print(f"wikipedia: page not found {title}")
            continue
        path = out_dir / f"{title.replace(' ', '_')}.md"
        path.write_text(page.text, encoding="utf-8", errors="ignore")
        total += 1
        print(f"wikipedia: saved {title}")
    print(f"wikipedia: total pages {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
