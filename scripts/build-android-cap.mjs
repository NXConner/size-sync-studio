#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { platform } from 'node:os'
import path from 'node:path'
import fs from 'node:fs/promises'

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    })
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`))
    })
  })
}

async function removeGzAssets(rootDir) {
  const assetsRoot = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets')
  try {
    await fs.access(assetsRoot)
  } catch {
    return
  }

  async function walkAndDeleteGz(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    await Promise.all(entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walkAndDeleteGz(fullPath)
        return
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.gz')) {
        await fs.rm(fullPath, { force: true })
      }
    }))
  }

  await walkAndDeleteGz(assetsRoot)
}

async function main() {
  const rootDir = process.cwd()

  // 1) Build web with mobile env (disables precompression if your config checks VITE_MOBILE)
  const buildEnv = { ...process.env, VITE_MOBILE: '1' }
  await run('npm', ['run', 'build'], { env: buildEnv })

  // 2) Capacitor sync (copies web assets to android assets)
  await run('npx', ['cap', 'sync', 'android'])

  // 3) Remove any precompressed assets that cause Android duplicate asset names
  await removeGzAssets(rootDir)

  // 4) Build Android app
  const isWindows = platform().startsWith('win')
  const androidDir = path.join(rootDir, 'android')
  const gradlew = isWindows ? 'gradlew.bat' : './gradlew'

  await run(gradlew, ['clean'], { cwd: androidDir })
  await run(gradlew, ['assembleDebug'], { cwd: androidDir })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

