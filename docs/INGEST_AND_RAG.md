# Internet Ingestion and RAG Index

This pipeline fetches relevant knowledge from GitHub, Hugging Face, Wikipedia, arXiv, and the broader web (DuckDuckGo), cleans and chunks it, then builds a FAISS index using sentence-transformers for retrieval-augmented generation and search.

## 1) Install Dependencies (Python)

```bash
npm run ingest:install
```

This installs Python libs from `ml/requirements.txt`.

## 2) Configure Sources

Edit `ml/ingest/config.yaml` (a default is provided). Example topics already include asphalt, pavement, sealcoating, line‑striping.

## 3) Fetch Content

```bash
# Run all fetchers
npm run ingest:all

# Or run individually
npm run ingest:github
npm run ingest:hf
npm run ingest:wikipedia
npm run ingest:arxiv
npm run ingest:web
```

Outputs are written under `ml/ingest/out/**` as Markdown.

Optional: Set `GITHUB_TOKEN` for higher GitHub API rate limits, and `INGEST_CONFIG` to use a non-default config file.

## 4) Preprocess and Chunk

```bash
npm run preprocess
```

This cleans and splits documents into overlapping chunks under `ml/corpus/**`.

## 5) Build FAISS Index

```bash
npm run index:build
```

Environment variables:
- `EMBED_MODEL` (default `sentence-transformers/all-MiniLM-L6-v2`)

Outputs under `ml/index_store/`:
- `faiss.index`
- `meta.json` (paths and model name)

## 6) Query the Index

```bash
npm run index:query -- "best practices for sealcoating temperature"
```

Example output lists top‑5 chunks with scores and file paths.

## Notes
- All scripts are idempotent and safe to re-run. They overwrite existing outputs.
- Be mindful of upstream websites' robots and fair use when expanding sources.
- Extend source lists in `config.yaml` to broaden the knowledge base for the Pavement Performance Suite.
