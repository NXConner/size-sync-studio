#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'
import { spawn } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = resolve(__dirname, '..')
const subRoot = resolve(root, 'external', 'size-sync-studio')
const dest = resolve(root, 'public', 'ssstudio')

function run(cmd, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true, ...options })
    child.on('exit', (code) => code === 0 ? resolvePromise(undefined) : reject(new Error(`${cmd} exited ${code}`)))
  })
}

async function rimraf(path) {
  try { await fs.rm(path, { recursive: true, force: true }) } catch {}
}

async function ensureDir(path) {
  await fs.mkdir(path, { recursive: true })
}

async function copyDir(src, dst) {
  await ensureDir(dst)
  const entries = await fs.readdir(src, { withFileTypes: true })
  for (const e of entries) {
    const s = join(src, e.name)
    const d = join(dst, e.name)
    if (e.isDirectory()) await copyDir(s, d)
    else if (e.isFile()) await fs.copyFile(s, d)
  }
}

async function main() {
  if (!existsSync(subRoot)) {
    console.error('[studio-build] external/size-sync-studio not found. Run: git submodule update --init --recursive')
    process.exit(1)
  }

  console.log('[studio-build] Installing and building submodule...')
  await run('npm', ['ci'], { cwd: subRoot })
  await run('npm', ['run', 'build'], { cwd: subRoot, env: { ...process.env } })

  const candidates = [
    resolve(subRoot, 'dist'),
    resolve(subRoot, 'build'),
    resolve(subRoot, 'web', 'dist'),
  ]
  const src = candidates.find((p) => existsSync(p))
  if (!src) {
    console.error('[studio-build] Could not find build output in submodule (dist/ or build/)')
    process.exit(1)
  }

  console.log(`[studio-build] Copying assets from ${src} -> ${dest}`)
  await rimraf(dest)
  await copyDir(src, dest)
  console.log('[studio-build] Done. Built assets available at public/ssstudio')
}

main().catch((e) => { console.error(e); process.exit(1) })
