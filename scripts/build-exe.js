const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const STANDALONE = path.join(ROOT, '.next', 'standalone')
const STAGING = path.join(ROOT, '.next', 'standalone-staging')
const DIST = path.join(ROOT, 'dist')
const OUT = path.join(DIST, 'session-killer.exe')
const SEED_DB = path.join(ROOT, '.next', 'seed-build.db')

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts })
}

// 1. Build Next.js standalone
run('npx next build')

// 2. Copy static assets (not included automatically in standalone)
fs.cpSync(path.join(ROOT, '.next', 'static'), path.join(STANDALONE, '.next', 'static'), { recursive: true })
fs.cpSync(path.join(ROOT, 'public'), path.join(STANDALONE, 'public'), { recursive: true })
console.log('Copied static assets.')

// 3. Create a fresh seeded DB — don't copy the dev DB (WAL may have uncommitted data)
for (const ext of ['', '-shm', '-wal']) {
  try { fs.unlinkSync(SEED_DB + ext) } catch {}
}
const seedDbUrl = `file:${SEED_DB.replace(/\\/g, '/')}`
const seedEnv = { ...process.env, DATABASE_URL: seedDbUrl }
console.log('Creating fresh seed database...')
run('npx prisma db push --force-reset --skip-generate', { env: seedEnv })
run('npx tsx prisma/seed.ts', { env: seedEnv })

// Checkpoint WAL so the .db file is fully self-contained before we copy it
const cpScript = path.join(ROOT, '.next', 'checkpoint.mjs')
fs.writeFileSync(cpScript,
  `import { DatabaseSync } from 'node:sqlite';\n` +
  `const db = new DatabaseSync(${JSON.stringify(SEED_DB)});\n` +
  `db.exec('PRAGMA wal_checkpoint(TRUNCATE)');\n` +
  `db.close();\n`
)
run(`node "${cpScript}"`)
fs.unlinkSync(cpScript)

fs.copyFileSync(SEED_DB, path.join(STANDALONE, 'seed.db'))
console.log('Bundled fresh seed database.')

// 4. Remove the .env that Next.js copied into standalone — we set DATABASE_URL in start.js
const standaloneEnv = path.join(STANDALONE, '.env')
if (fs.existsSync(standaloneEnv)) {
  fs.unlinkSync(standaloneEnv)
  console.log('Removed standalone .env (DATABASE_URL set at runtime by start.js).')
}

// 5. Bundle the current Node.js binary so the exe is self-contained
fs.copyFileSync(process.execPath, path.join(STANDALONE, 'node.exe'))
console.log(`Bundled Node.js from ${process.execPath}`)

// 6. Copy launcher
fs.copyFileSync(path.join(ROOT, 'start.js'), path.join(STANDALONE, 'start.js'))
console.log('Copied start.js launcher.')

// 7. Dereference symlinks into staging dir (Windows blocks caxa from recreating symlinks)
console.log('Resolving symlinks into staging directory...')
if (fs.existsSync(STAGING)) fs.rmSync(STAGING, { recursive: true })
fs.cpSync(STANDALONE, STAGING, { recursive: true, dereference: true })

// 8. Package with caxa
fs.mkdirSync(DIST, { recursive: true })
run(`npx caxa --input "${STAGING}" --output "${OUT}" -- "{{caxa}}/node.exe" "{{caxa}}/start.js"`)

console.log(`\nDone!  →  dist/session-killer.exe`)
console.log('Double-click the exe, then open http://localhost:3000')
