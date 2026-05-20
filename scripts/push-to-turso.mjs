import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN')
  process.exit(1)
}

const client = createClient({ url, authToken })

const raw = readFileSync(
  join(__dirname, '../prisma/migrations/20260519185803_init/migration.sql'),
  'utf-8'
)

// Split on semicolons, strip comment lines, skip empty
const statements = raw
  .split(';')
  .map((chunk) =>
    chunk
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .trim()
  )
  .filter((s) => s.length > 0)

console.log(`\nPushing ${statements.length} statements to Turso...\n`)

for (const stmt of statements) {
  const preview = stmt.replace(/\s+/g, ' ').slice(0, 80)
  try {
    await client.execute(stmt)
    console.log('✓', preview)
  } catch (e) {
    const msg = e?.message ?? String(e)
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      console.log('⚠ skip:', preview)
    } else {
      console.error('✗ ERROR:', preview)
      console.error('  ', msg)
    }
  }
}

console.log('\n✅ Done!\n')
