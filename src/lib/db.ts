import path from 'path'
import { DatabaseSync, StatementSync } from 'node:sqlite'
import type { Service } from '@/types'

const DB_PATH = path.join(process.cwd(), 'session-killer.db')

const g = globalThis as typeof globalThis & { _db?: DatabaseSync }

function getDb(): DatabaseSync {
  if (g._db) return g._db

  const db = new DatabaseSync(DB_PATH)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      category   TEXT    NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_builtin INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id  INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      label       TEXT    NOT NULL,
      description TEXT,
      url         TEXT,
      sort_order  INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS completions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id      INTEGER NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
      completed_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)

  seed(db)
  g._db = db
  return db
}

function seed(db: DatabaseSync) {
  const count = (db.prepare('SELECT COUNT(*) as c FROM services').get() as { c: number }).c
  if (count > 0) return

  const addSvc: StatementSync = db.prepare(
    'INSERT INTO services (name, category, sort_order, is_builtin) VALUES (?, ?, ?, 1)'
  )
  const addTask: StatementSync = db.prepare(
    'INSERT INTO tasks (service_id, label, description, url, sort_order) VALUES (?, ?, ?, ?, ?)'
  )

  // [label, description, url]
  const SERVICES: {
    name: string
    category: string
    order: number
    tasks: [string, string, string | null][]
  }[] = [
    {
      name: 'Gmail / Google', category: 'email', order: 1,
      tasks: [
        ['Sign out all other sessions', 'myaccount.google.com → Security → Your devices', 'https://myaccount.google.com/device-activity'],
        ['Change password', 'myaccount.google.com → Security → Password', 'https://myaccount.google.com/signinoptions/password'],
        ['Enable 2-Step Verification', 'Use an authenticator app — avoid SMS if possible', 'https://myaccount.google.com/signinoptions/two-step-verification'],
        ['Check email forwarding rules', 'Gmail Settings → See all settings → Forwarding — remove unknown addresses', 'https://mail.google.com/mail/u/0/#settings/fwdandpop'],
        ['Review App Passwords', 'myaccount.google.com → Security → App Passwords — revoke all', 'https://myaccount.google.com/apppasswords'],
        ['Audit connected apps', 'myaccount.google.com → Security → Third-party apps with account access', 'https://myaccount.google.com/permissions'],
      ],
    },
    {
      name: 'Outlook / Microsoft', category: 'email', order: 2,
      tasks: [
        ['Sign out all sessions', 'account.microsoft.com → Security → Sign-in activity', 'https://account.microsoft.com/security'],
        ['Change password', 'account.microsoft.com → Security → Change my password', 'https://account.microsoft.com/password/change'],
        ['Enable 2FA', 'account.microsoft.com → Security → Advanced security options', 'https://account.microsoft.com/proofs/manage/additional'],
        ['Check email forwarding & rules', 'Outlook → Settings → Mail → Rules — remove unknown ones', 'https://outlook.live.com/mail/0/options/mail/rules'],
        ['Audit connected apps', 'account.microsoft.com → Privacy → Apps and services', 'https://account.microsoft.com/privacy/app-access'],
      ],
    },
    {
      name: 'ProtonMail', category: 'email', order: 3,
      tasks: [
        ['Terminate all sessions', 'Settings → Account → Security → Active sessions', 'https://account.proton.me/u/0/security#sessions'],
        ['Reset password', 'Use a unique, strong password', 'https://account.proton.me/u/0/account-password'],
        ['Enable 2FA', 'Settings → Account → Two-factor authentication', 'https://account.proton.me/u/0/security#two-fa'],
      ],
    },
    {
      name: 'Facebook', category: 'social', order: 1,
      tasks: [
        ['Log out all active sessions', "Settings → Security and Login → Where You're Logged In → Log Out All", 'https://www.facebook.com/settings?tab=security&section=sessions'],
        ['Change password', 'Settings → Security and Login → Change Password', 'https://www.facebook.com/settings?tab=security&section=password'],
        ['Enable 2FA', 'Settings → Security and Login → Two-Factor Authentication', 'https://www.facebook.com/settings?tab=security&section=two_factor'],
        ['Revoke suspicious apps', 'Settings → Apps and Websites — remove unknown ones', 'https://www.facebook.com/settings?tab=applications'],
        ['Verify account email & phone', 'Settings → General — confirm recovery contacts are yours', 'https://www.facebook.com/settings?tab=account'],
      ],
    },
    {
      name: 'Twitter / X', category: 'social', order: 2,
      tasks: [
        ['Revoke all sessions', 'Settings → Security and account access → Apps and sessions → Sessions', 'https://x.com/settings/sessions'],
        ['Change password', 'Settings → Your account → Change your password', 'https://x.com/settings/password'],
        ['Enable 2FA', 'Settings → Security and account access → Security → Two-factor authentication', 'https://x.com/settings/account/login_verification'],
        ['Revoke third-party apps', 'Settings → Security and account access → Connected apps', 'https://x.com/settings/connected_apps'],
      ],
    },
    {
      name: 'Instagram', category: 'social', order: 3,
      tasks: [
        ['Log out all sessions', 'Settings → Security → Login Activity — log out all unknown sessions', 'https://www.instagram.com/accounts/login_activity/'],
        ['Change password', 'Settings → Security → Password', 'https://www.instagram.com/accounts/password/change/'],
        ['Enable 2FA', 'Settings → Security → Two-Factor Authentication', 'https://www.instagram.com/accounts/two_factor_authentication/'],
        ['Audit authorized apps', 'Settings → Security → Apps and Websites', 'https://www.instagram.com/accounts/manage_access/'],
      ],
    },
    {
      name: 'GitHub', category: 'dev', order: 1,
      tasks: [
        ['Revoke all active sessions', 'Settings → Security → Sessions — revoke all unknown sessions', 'https://github.com/settings/security'],
        ['Change password', 'Settings → Password and authentication → Change password', 'https://github.com/settings/password'],
        ['Enable 2FA', 'Settings → Password and authentication → Two-factor authentication', 'https://github.com/settings/two_factor_authentication/setup/intro'],
        ['Audit SSH keys', 'Settings → SSH and GPG keys — delete unrecognized keys', 'https://github.com/settings/keys'],
        ['Revoke unknown Personal Access Tokens', 'Settings → Developer settings → Personal access tokens', 'https://github.com/settings/tokens'],
        ['Revoke unknown OAuth Apps', 'Settings → Applications → Authorized OAuth Apps', 'https://github.com/settings/applications'],
        ['Check repo webhooks', 'Each repo → Settings → Webhooks — remove unknown ones', 'https://github.com/settings/hooks'],
      ],
    },
    {
      name: 'PayPal', category: 'financial', order: 1,
      tasks: [
        ['Log out all devices', 'Settings → Security → Log Out of All Devices', 'https://www.paypal.com/myaccount/security/login/sessions'],
        ['Change password', 'Settings → Security → Password', 'https://www.paypal.com/myaccount/security/password'],
        ['Enable 2FA', 'Settings → Security → 2-step verification', 'https://www.paypal.com/myaccount/security/2fa'],
        ['Review recent transactions', 'Look for unauthorized charges — dispute if found', 'https://www.paypal.com/myaccount/activities/'],
        ['Verify linked accounts & cards', 'Settings → Payments → Manage payments — remove unknown ones', 'https://www.paypal.com/myaccount/money/wallets/cards'],
      ],
    },
    {
      name: 'Bank / Credit Card', category: 'financial', order: 2,
      tasks: [
        ['Change online banking password', 'Use a unique, strong password not used anywhere else', null],
        ['Enable 2FA / transaction alerts', 'Set up SMS or email alerts for all transactions', null],
        ['Review recent transactions', 'Check for unauthorized charges or withdrawals', null],
        ['Contact bank fraud dept if suspicious', 'Report any unauthorized activity immediately', null],
        ['Lock or freeze card if compromised', 'Most banking apps allow instant card freeze', null],
      ],
    },
  ]

  for (const s of SERVICES) {
    const { lastInsertRowid } = addSvc.run(s.name, s.category, s.order)
    const svcId = Number(lastInsertRowid)
    s.tasks.forEach(([label, description, url], i) => {
      addTask.run(svcId, label, description, url, i)
    })
  }
}

// ─── Exported query helpers ───────────────────────────────

export function getServices(): Service[] {
  const db = getDb()

  const services = (db.prepare(
    'SELECT * FROM services ORDER BY category, sort_order, id'
  ).all() as Record<string, unknown>[]).map(r => ({ ...r }) as unknown as Service)

  const tasks = (db.prepare(`
    SELECT t.*, CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END as completed
    FROM tasks t
    LEFT JOIN completions c ON c.task_id = t.id
    ORDER BY t.sort_order, t.id
  `).all() as Record<string, unknown>[]).map(r => ({ ...r }) as unknown as Service['tasks'][number])

  return services.map(s => ({
    ...s,
    tasks: tasks.filter(t => t.service_id === s.id),
  }))
}

export function toggleTask(taskId: number): void {
  const db = getDb()
  const existing = db.prepare('SELECT id FROM completions WHERE task_id = ?').get(taskId)
  if (existing) {
    db.prepare('DELETE FROM completions WHERE task_id = ?').run(taskId)
  } else {
    db.prepare('INSERT INTO completions (task_id) VALUES (?)').run(taskId)
  }
}

export function addService(name: string): number {
  const db = getDb()
  const { lastInsertRowid } = db.prepare(
    "INSERT INTO services (name, category, sort_order, is_builtin) VALUES (?, 'custom', 999, 0)"
  ).run(name)
  const svcId = Number(lastInsertRowid)

  const addTask: StatementSync = db.prepare(
    'INSERT INTO tasks (service_id, label, url, sort_order) VALUES (?, ?, NULL, ?)'
  )
  ;['Sign out all sessions', 'Change password', 'Enable 2FA', 'Review connected apps']
    .forEach((label, i) => addTask.run(svcId, label, i))

  return svcId
}

export function deleteService(id: number): void {
  const db = getDb()
  const svc = db.prepare('SELECT is_builtin FROM services WHERE id = ?').get(id) as { is_builtin: number } | undefined
  if (!svc) throw new Error('Not found')
  if (svc.is_builtin) throw new Error('Cannot delete built-in service')
  db.prepare('DELETE FROM services WHERE id = ?').run(id)
}

export function resetCompletions(): void {
  getDb().prepare('DELETE FROM completions').run()
}
