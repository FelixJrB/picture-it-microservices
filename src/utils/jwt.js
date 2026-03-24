import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)

export const PUBLIC_KEY = fs.readFileSync(
  path.join(currentDir, '../../keys/public.pem'),
  'utf-8',
)