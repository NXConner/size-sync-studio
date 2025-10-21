#!/usr/bin/env python3
from __future__ import annotations
import os
import sys
import pathlib
from duckduckgo_search import DDGS
from trafilatura import fetch_url, extract
import yaml
from pydantic import BaseModel


class WebConfig(BaseModel):
    queries: list[str] = []


class Config(BaseModel):
    sources: dict
    output_dir: str = "ml/ingest/out"


def sanitize_filename(s: str) -> str:
    s = s.replace("http://", "").replace("https://", "").replace("/", "_")
    return "".join(c for c in s if c.isalnum() or c in ("-", "_", "."))[:180]


def main(argv: list[str]) -> int:
    cfg_path = os.environ.get("INGEST_CONFIG", "ml/ingest/config.yaml")
    with open(cfg_path, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)
    cfg = Config(**raw)
    w_cfg = WebConfig(**cfg.sources.get("web_search", {}))

    base = pathlib.Path(cfg.output_dir)
    base.mkdir(parents=True, exist_ok=True)
    out = base / "web"
    out.mkdir(parents=True, exist_ok=True)

    total = 0
    with DDGS() as ddgs:
        for query in w_cfg.queries:
            for r in ddgs.text(query, max_results=25, safesearch="moderate"):  # type: ignore
                url = r.get("href") or r.get("url")
                if not url:
                    continue
                try:
                    html = fetch_url(url)
                    if not html:
                        continue
                    txt = extract(html, include_comments=False, include_formatting=False, output_format="markdown")
                    if not txt or len(txt.strip()) < 200:
                        continue
                    fn = sanitize_filename(url) + ".md"
                    (out / fn).write_text(txt, encoding="utf-8", errors="ignore")
                    total += 1
                except Exception:
                    continue
            print(f"web: query '{query}' processed")
    print(f"web: total docs {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
