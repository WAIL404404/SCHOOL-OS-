import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const ignoredDirs = new Set(['.git', '.nuxt', '.output', 'node_modules', 'dist', 'scripts'])
const allowedAnyFiles = new Set([
  path.join(root, 'server', 'utils', 'db.ts')
])
const findings = []
const explicitAnyPattern = /(:\s*any\b|<any>|as\s+any\b|\bany\[\])/u

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) {
      continue
    }

    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(fullPath)
      continue
    }

    if (!/\.(ts|vue|mjs)$/u.test(entry.name)) {
      continue
    }

    const content = await readFile(fullPath, 'utf8')

    if (content.includes('console.log(')) {
      findings.push(`${path.relative(root, fullPath)} contains console.log`)
    }

    if (!allowedAnyFiles.has(fullPath) && explicitAnyPattern.test(content)) {
      findings.push(`${path.relative(root, fullPath)} contains an explicit any type`)
    }

    if (/TODO/u.test(content)) {
      findings.push(`${path.relative(root, fullPath)} still contains TODO markers`)
    }
  }
}

await walk(root)

if (findings.length > 0) {
  console.error(findings.join('\n'))
  process.exit(1)
}

console.log('Custom lint checks passed.')

