#!/usr/bin/env bash
set -euo pipefail

# Idempotent dependency installer

if command -v npm >/dev/null 2>&1; then
  echo "[install] Installing JS deps"
  npm ci || npm install
fi

if command -v python3 >/dev/null 2>&1 && [ -f ml/requirements.txt ]; then
  echo "[install] Installing Python deps for ML"
  python3 -m pip install --upgrade pip
  python3 -m pip install -r ml/requirements.txt || true
fi

if command -v deno >/dev/null 2>&1 && [ -f supabase/functions/compliance-evaluator/index.ts ]; then
  echo "[install] Deno present for Supabase functions"
fi

echo "[install] Done"
