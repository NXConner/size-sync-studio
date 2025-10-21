#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = resolve(__dirname, '..')
const subRoot = resolve(root, 'external', 'size-sync-studio')

function run(cmd, args, options = {}) {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: true, ...options })
  child.on('exit', (code) => {
    if (code !== 0) console.error(`[studio-dev] ${cmd} exited with code ${code}`)
  })
  return child
}

console.log('[studio-dev] Starting host app on :8080 ...')
const host = run('npm', ['run', 'dev'], { cwd: root, env: { ...process.env, PORT: '8080' } })

let api = null
let web = null
if (existsSync(subRoot)) {
  console.log('[studio-dev] Detected external/size-sync-studio')
  api = run('npm', ['run', 'server'], { cwd: subRoot, env: { ...process.env, PORT: '3001' } })
  web = run('npm', ['run', 'dev'], { cwd: subRoot, env: { ...process.env, PORT: '8081' } })
  console.log('[studio-dev] Studio API :3001, Studio Web :8081')
} else {
  console.warn('[studio-dev] external/size-sync-studio not found. Run: git submodule update --init --recursive')
  console.warn('[studio-dev] You can still open /studio which will iframe http://localhost:8081 if you start it manually.')
}

const shutdown = () => {
  try { host && host.kill('SIGINT') } catch {}
  try { api && api.kill('SIGINT') } catch {}
  try { web && web.kill('SIGINT') } catch {}
}
process.on('SIGINT', () => { shutdown(); process.exit(0) })
process.on('SIGTERM', () => { shutdown(); process.exit(0) })
