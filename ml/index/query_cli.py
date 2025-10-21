#!/usr/bin/env python3
from __future__ import annotations
import sys
import pathlib
import json
from typing import List

import numpy as np
from sentence_transformers import SentenceTransformer
import faiss


def main(argv: List[str]) -> int:
    if len(argv) < 1:
        print("usage: query_cli.py <query> [index_dir]", file=sys.stderr)
        return 2
    query = argv[0]
    idx_dir = pathlib.Path(argv[1] if len(argv) > 1 else "ml/index_store")
    index_path = idx_dir / "faiss.index"
    meta_path = idx_dir / "meta.json"

    if not index_path.exists() or not meta_path.exists():
        print("index not found; build with build_faiss.py first", file=sys.stderr)
        return 1
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    paths: list[str] = meta["paths"]
    model_name: str = meta.get("model", "sentence-transformers/all-MiniLM-L6-v2")

    model = SentenceTransformer(model_name)
    index = faiss.read_index(str(index_path))

    emb = model.encode([query], normalize_embeddings=True)
    emb = np.asarray(emb, dtype="float32")
    D, I = index.search(emb, 5)

    for rank, (score, idx) in enumerate(zip(D[0], I[0]), start=1):
        p = paths[int(idx)]
        snippet = pathlib.Path(p).read_text(encoding="utf-8", errors="ignore")[:400].replace("\n", " ")
        print(f"#{rank} score={float(score):.4f} path={p}\n{snippet}\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
