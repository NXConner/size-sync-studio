#!/usr/bin/env python3
from __future__ import annotations
import os
import sys
import pathlib
import typing as t
from dataclasses import dataclass

from huggingface_hub import HfApi, list_repo_files, hf_hub_download
from pydantic import BaseModel
import yaml


class HFConfig(BaseModel):
    repos: list[str] = []


class Config(BaseModel):
    sources: dict
    output_dir: str = "ml/ingest/out"


TEXT_LIKE = {"README.md", "README.rst", "modelcard.md", "modelcard.yaml"}


def save_text(base: pathlib.Path, repo_id: str, path: str, text: str) -> None:
    out_path = base / "huggingface" / repo_id / path
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(text, encoding="utf-8", errors="ignore")


def maybe_read_text(path: pathlib.Path) -> str | None:
    try:
        data = path.read_text(encoding="utf-8", errors="ignore")
        return data
    except Exception:
        return None


def fetch_repo(repo_id: str, base: pathlib.Path) -> int:
    count = 0
    try:
        files = list_repo_files(repo_id)
    except Exception as e:
        print(f"hf: failed to list {repo_id}: {e}")
        return 0
    for f in files:
        name = f.split("/")[-1]
        if name in TEXT_LIKE or name.lower().endswith((".md", ".txt", ".rst")):
            try:
                local = hf_hub_download(repo_id, f)
                text = maybe_read_text(pathlib.Path(local))
                if text is not None:
                    save_text(base, repo_id, f, text)
                    count += 1
            except Exception:
                continue
    return count


def main(argv: list[str]) -> int:
    cfg_path = os.environ.get("INGEST_CONFIG", "ml/ingest/config.yaml")
    with open(cfg_path, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)
    cfg = Config(**raw)
    hf_cfg = HFConfig(**cfg.sources.get("huggingface", {}))
    base = pathlib.Path(cfg.output_dir)
    base.mkdir(parents=True, exist_ok=True)

    total = 0
    for repo_id in hf_cfg.repos:
        fetched = fetch_repo(repo_id, base)
        print(f"hf: fetched {fetched} files from {repo_id}")
        total += fetched
    print(f"hf: total files {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
