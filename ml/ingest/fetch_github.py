#!/usr/bin/env python3
from __future__ import annotations
import os
import sys
import time
import pathlib
import typing as t
from dataclasses import dataclass

from github import Github
from github.ContentFile import ContentFile
from pydantic import BaseModel
import yaml


class GithubConfig(BaseModel):
    repos: list[str] = []
    include: list[str] = ["**/*"]
    exclude: list[str] = []


class Config(BaseModel):
    sources: dict
    output_dir: str = "ml/ingest/out"


@dataclass
class RepoSpec:
    owner: str
    name: str


try:
    import fnmatch
except Exception:
    fnmatch = None


def parse_repo(repo: str) -> RepoSpec:
    owner, name = repo.split("/", 1)
    return RepoSpec(owner=owner, name=name)


def should_include(path: str, include: list[str], exclude: list[str]) -> bool:
    p = path.strip("/")
    for ex in exclude:
        if pathlib.PurePosixPath(p).match(ex):
            return False
    if not include:
        return True
    return any(pathlib.PurePosixPath(p).match(inc) for inc in include)


def save_text(base: pathlib.Path, repo_full: str, path: str, text: str) -> None:
    out_path = base / "github" / repo_full / path
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(text, encoding="utf-8", errors="ignore")


def fetch_repo(g: Github, base: pathlib.Path, spec: RepoSpec, inc: list[str], exc: list[str]) -> int:
    full = f"{spec.owner}/{spec.name}"
    repo = g.get_repo(full)
    count = 0

    def walk_dir(path: str = ""):
        nonlocal count
        contents = repo.get_contents(path or "/")
        for item in contents:
            if item.type == "dir":
                walk_dir(item.path)
            else:
                if should_include(item.path, inc, exc):
                    try:
                        file: ContentFile = repo.get_contents(item.path)
                        text = file.decoded_content.decode("utf-8", errors="ignore")
                        save_text(base, full, item.path, text)
                        count += 1
                    except Exception:
                        # skip binaries or large files
                        continue

    walk_dir("")
    return count


def main(argv: list[str]) -> int:
    cfg_path = os.environ.get("INGEST_CONFIG", "ml/ingest/config.yaml")
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("warning: GITHUB_TOKEN not set, GitHub API rate limits will be low", file=sys.stderr)
    with open(cfg_path, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)
    cfg = Config(**raw)
    g_cfg = GithubConfig(**cfg.sources.get("github", {}))

    base = pathlib.Path(cfg.output_dir)
    base.mkdir(parents=True, exist_ok=True)

    gh = Github(login_or_token=token) if token else Github()

    total = 0
    for repo in g_cfg.repos:
        spec = parse_repo(repo)
        fetched = fetch_repo(gh, base, spec, g_cfg.include, g_cfg.exclude)
        print(f"github: fetched {fetched} files from {repo}")
        total += fetched
        time.sleep(1)

    print(f"github: total files {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
