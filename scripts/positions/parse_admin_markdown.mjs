#!/usr/bin/env node
/*
  Parse adminlove520/Sex-Positions markdown into a structured JSON list for enrichment.
  Usage: node scripts/positions/parse_admin_markdown.mjs --input repo/Best.md --out tmp/enrichment.json
  Note: Source has no explicit license; use for internal enrichment only.
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
    console.error('Usage: node scripts/positions/parse_admin_markdown.mjs --input file.md --out enrichment.json');
    process.exit(1);
  }
  return out;
}

function extractLines(md) {
  return md.split(/\r?\n/).map((s) => s.trim());
}

function parseMarkdown(md) {
  const lines = extractLines(md);
  const results = [];
  let current = null;
  for (const line of lines) {
    if (!line) continue;
    // Headings as position names
    if (/^#{1,6}\s+/.test(line)) {
      const name = line.replace(/^#{1,6}\s+/, '').trim();
      if (current) results.push(current);
      current = { name, aliases: [], tags: [], difficulty: undefined, notes: [] };
      continue;
    }
    // Bulleted attributes
    const m = /^[-*]\s+(.*)/.exec(line);
    if (m) {
      const body = m[1];
      // try to detect tags like Difficulty: X, Also known as: Y, Tags: a, b
      const colon = body.indexOf(':');
      if (colon > 0) {
        const key = body.slice(0, colon).toLowerCase();
        const value = body.slice(colon + 1).trim();
        if (key.includes('difficulty')) current.difficulty = value.toLowerCase();
        else if (key.includes('also known') || key.includes('alias')) current.aliases.push(...value.split(/,|\/|;/).map(s => s.trim()).filter(Boolean));
        else if (key.includes('tag')) current.tags.push(...value.split(/,|\/|;/).map(s => s.trim()).filter(Boolean));
        else current.notes.push(body);
      } else {
        current?.notes.push(body);
      }
      continue;
    }
    // Plain paragraphs appended as notes
    current?.notes.push(line);
  }
  if (current) results.push(current);
  return results;
}

async function main() {
  const { input, out } = parseArgs();
  const md = await fs.readFile(path.resolve(input), 'utf8');
  const parsed = parseMarkdown(md);
  await fs.mkdir(path.dirname(path.resolve(out)), { recursive: true });
  await fs.writeFile(path.resolve(out), JSON.stringify(parsed, null, 2), 'utf8');
  console.log(`Extracted ${parsed.length} entries → ${out}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
