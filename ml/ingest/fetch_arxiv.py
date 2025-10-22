#!/usr/bin/env python3
from __future__ import annotations
import os
import sys
import pathlib
from pydantic import BaseModel
import yaml
import arxiv


class ArxivQuery(BaseModel):
    query: str
    max_results: int = 25


class ArxivConfig(BaseModel):
    queries: list[ArxivQuery] = []


class Config(BaseModel):
    sources: dict
    output_dir: str = "ml/ingest/out"


def main(argv: list[str]) -> int:
    cfg_path = os.environ.get("INGEST_CONFIG", "ml/ingest/config.yaml")
    with open(cfg_path, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)
    cfg = Config(**raw)
    a_cfg = ArxivConfig(**cfg.sources.get("arxiv", {}))

    base = pathlib.Path(cfg.output_dir)
    base.mkdir(parents=True, exist_ok=True)
    out = base / "arxiv"
    out.mkdir(parents=True, exist_ok=True)

    total = 0
    for q in a_cfg.queries:
        client = arxiv.Search(query=q.query, max_results=q.max_results, sort_by=arxiv.SortCriterion.Relevance)
        for result in client.results():
            fn = f"{result.entry_id.split('/')[-1]}.md"
            p = out / fn
            meta = [
                f"Title: {result.title}",
                f"Authors: {', '.join(a.name for a in result.authors)}",
                f"Published: {result.published}",
                f"Updated: {result.updated}",
                f"Primary Category: {result.primary_category}",
                f"Categories: {', '.join(result.categories)}",
                f"Summary:\n{result.summary}",
                f"PDF: {result.pdf_url}",
                f"Entry: {result.entry_id}",
            ]
            p.write_text("\n\n".join(meta), encoding="utf-8", errors="ignore")
            total += 1
        print(f"arxiv: query '{q.query}' processed")
    print(f"arxiv: total docs {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
