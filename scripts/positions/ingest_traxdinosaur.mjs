#!/usr/bin/env node
/*
  Ingest positions from TraxDinosaur/SexPositions exported JSON.
  Usage: node scripts/positions/ingest_traxdinosaur.mjs --input exported.json --out src/data/positions.json
*/
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { input: null, out: null };
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--input') out.input = args[++i];
    else if (a === '--out') out.out = args[++i];
  }
  if (!out.input || !out.out) {
    console.error('Usage: node scripts/positions/ingest_traxdinosaur.mjs --input exported.json --out src/data/positions.json');
    process.exit(1);
  }
  return out;
}

function mapRecord(r) {
  // Map a generic record into our SexPosition structure
  return {
    id: r.id ?? crypto.randomUUID?.() ?? String(Math.random()),
    name: r.name ?? r.title ?? 'Unknown',
    category: 'missionary',
    difficulty: 'beginner',
    description: r.description ?? '',
    instructions: Array.isArray(r.instructions) ? r.instructions : [],
    tips: Array.isArray(r.tips) ? r.tips : [],
    benefits: Array.isArray(r.benefits) ? r.benefits : [],
    requirements: Array.isArray(r.requirements) ? r.requirements : [],
    duration: { min: 60, max: 600 },
    tags: Array.isArray(r.tags) ? r.tags : [],
    imageUrl: r.image ?? r.imageUrl,
    media: [],
    rating: r.rating ?? undefined,
    views: undefined,
    likes: undefined,
    isPublic: true,
    createdBy: 'importer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function main() {
  const { input, out } = parseArgs();
  const raw = await fs.readFile(path.resolve(input), 'utf8');
  const data = JSON.parse(raw);
  const list = Array.isArray(data) ? data : (Array.isArray(data.positions) ? data.positions : []);
  const mapped = list.map(mapRecord);
  const sorted = mapped.sort((a, b) => a.name.localeCompare(b.name));
  await fs.mkdir(path.dirname(path.resolve(out)), { recursive: true });
  await fs.writeFile(path.resolve(out), JSON.stringify(sorted, null, 2), 'utf8');
  console.log(`Wrote ${sorted.length} positions → ${out}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
