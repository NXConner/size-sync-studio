import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { openapiSpec } from '../server/openapi.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const outDir = path.resolve(__dirname, '..', 'public')
const outFile = path.join(outDir, 'swagger.json')

await fs.promises.mkdir(outDir, { recursive: true })
await fs.promises.writeFile(outFile, JSON.stringify(openapiSpec, null, 2))
console.log(`[openapi] wrote ${outFile}`)
