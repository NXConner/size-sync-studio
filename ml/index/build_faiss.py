#!/usr/bin/env python3
from __future__ import annotations
import os
import sys
import pathlib
import json
from typing import List

import numpy as np
from sentence_transformers import SentenceTransformer
import faiss


MODEL_DEFAULT = os.environ.get("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")


def iter_text_files(root: pathlib.Path):
    for p in root.rglob("*.txt"):
        if any(part.startswith(".") for part in p.parts):
            continue
        yield p


def load_text(p: pathlib.Path) -> str:
    return p.read_text(encoding="utf-8", errors="ignore")


def main(argv: List[str]) -> int:
    corpus_dir = pathlib.Path(argv[0] if argv else "ml/corpus")
    idx_dir = pathlib.Path(argv[1] if len(argv) > 1 else "ml/index_store")
    idx_dir.mkdir(parents=True, exist_ok=True)

    model = SentenceTransformer(MODEL_DEFAULT)

    texts: list[str] = []
    paths: list[str] = []
    for p in iter_text_files(corpus_dir):
        text = load_text(p).strip()
        if not text:
            continue
        texts.append(text)
        paths.append(str(p))

    if not texts:
        print("index: no texts found; run preprocess first")
        return 1

    print(f"index: encoding {len(texts)} chunks with {MODEL_DEFAULT}")
    embeddings = model.encode(texts, batch_size=64, show_progress_bar=True, normalize_embeddings=True)
    vecs = np.asarray(embeddings, dtype="float32")
    dim = vecs.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(vecs)

    faiss.write_index(index, str(idx_dir / "faiss.index"))
    meta = {"paths": paths, "model": MODEL_DEFAULT}
    (idx_dir / "meta.json").write_text(json.dumps(meta), encoding="utf-8")
    print(f"index: wrote {idx_dir}/faiss.index and meta.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
