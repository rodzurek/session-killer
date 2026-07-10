import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SERVICES: {
  name: string
  category: string
  sortOrder: number
  tasks: { label: string; description: string; url: string | null }[]
}[] = [
  {
    name: 'Gmail / Google', category: 'email', sortOrder: 1,
    tasks: [
      { label: 'Sign out all other sessions', description: 'myaccount.google.com → Security → Your devices', url: 'https://myaccount.google.com/device-activity' },
      { label: 'Change password', description: 'myaccount.google.com → Security → Password', url: 'https://myaccount.google.com/signinoptions/password' },
      { label: 'Enable 2-Step Verification', description: 'Use an authenticator app — avoid SMS if possible', url: 'https://myaccount.google.com/signinoptions/two-step-verification' },
      { label: 'Check email forwarding rules', description: 'Gmail Settings → See all settings → Forwarding — remove unknown addresses', url: 'https://mail.google.com/mail/u/0/#settings/fwdandpop' },
      { label: 'Review App Passwords', description: 'myaccount.google.com → Security → App Passwords — revoke all', url: 'https://myaccount.google.com/apppasswords' },
      { label: 'Audit connected apps', description: 'myaccount.google.com → Security → Third-party apps with account access', url: 'https://myaccount.google.com/permissions' },
    ],
  },
  {
    name: 'Outlook / Microsoft', category: 'email', sortOrder: 2,
    tasks: [
      { label: 'Sign out all sessions', description: 'account.microsoft.com → Security → Sign-in activity', url: 'https://account.microsoft.com/security' },
      { label: 'Change password', description: 'account.microsoft.com → Security → Change my password', url: 'https://account.microsoft.com/password/change' },
      { label: 'Enable 2FA', description: 'account.microsoft.com → Security → Advanced security options', url: 'https://account.live.com/proofs/manage/additional' },
      { label: 'Check email forwarding & rules', description: 'Outlook → Settings → Mail → Rules — remove unknown ones', url: 'https://outlook.live.com/mail/0/options/mail/rules' },
      { label: 'Audit connected apps', description: 'account.microsoft.com → Privacy → Apps and services', url: 'https://account.microsoft.com/privacy/app-access' },
    ],
  },
  {
    name: 'Facebook', category: 'social', sortOrder: 1,
    tasks: [
      { label: 'Log out all active sessions', description: "Settings → Security and Login → Where You're Logged In → Log Out All", url: 'https://www.facebook.com/settings?tab=security&section=sessions' },
      { label: 'Change password', description: 'Settings → Security and Login → Change Password', url: 'https://www.facebook.com/settings?tab=security&section=password' },
      { label: 'Enable 2FA', description: 'Settings → Security and Login → Two-Factor Authentication', url: 'https://www.facebook.com/settings?tab=security&section=two_factor' },
      { label: 'Revoke suspicious apps', description: 'Settings → Apps and Websites — remove unknown ones', url: 'https://www.facebook.com/settings?tab=applications' },
      { label: 'Verify account email & phone', description: 'Settings → General — confirm recovery contacts are yours', url: 'https://www.facebook.com/settings?tab=account' },
      { label: 'Review messages & archived chats for scams sent', description: 'Check Messenger for scam messages sent from your account — also check Archived chats', url: 'https://web.facebook.com/messages' },
    ],
  },
  {
    name: 'Twitter / X', category: 'social', sortOrder: 2,
    tasks: [
      { label: 'Revoke all sessions', description: 'Settings → Security and account access → Apps and sessions → Sessions', url: 'https://x.com/settings/sessions' },
      { label: 'Change password', description: 'Settings → Your account → Change your password', url: 'https://x.com/settings/password' },
      { label: 'Enable 2FA', description: 'Settings → Security and account access → Security → Two-factor authentication', url: 'https://x.com/settings/account/login_verification' },
      { label: 'Revoke third-party apps', description: 'Settings → Security and account access → Connected apps', url: 'https://x.com/settings/connected_apps' },
    ],
  },
  {
    name: 'Instagram', category: 'social', sortOrder: 3,
    tasks: [
      { label: 'Log out all sessions', description: 'Settings → Security → Login Activity — log out all unknown sessions', url: 'https://www.instagram.com/accounts/login_activity/' },
      { label: 'Change password', description: 'Settings → Security → Password', url: 'https://www.instagram.com/accounts/password/change/' },
      { label: 'Enable 2FA', description: 'Settings → Security → Two-Factor Authentication', url: 'https://www.instagram.com/accounts/two_factor_authentication/' },
      { label: 'Audit authorized apps', description: 'Settings → Security → Apps and Websites', url: 'https://www.instagram.com/accounts/manage_access/' },
      { label: 'Review DMs for scams sent', description: 'Check Direct inbox for scam messages sent from your account — delete any found', url: 'https://www.instagram.com/direct/inbox/' },
    ],
  },
  {
    name: 'Discord', category: 'social', sortOrder: 4,
    tasks: [
      { label: 'Log out all other sessions', description: 'User Settings → Devices — end all unknown sessions', url: 'https://discord.com/settings/sessions' },
      { label: 'Change password', description: 'User Settings → My Account → Change Password', url: 'https://discord.com/settings/account' },
      { label: 'Enable 2FA', description: 'User Settings → My Account → Two-Factor Authentication', url: 'https://discord.com/settings/security' },
      { label: 'Revoke authorized apps', description: 'User Settings → Authorized Apps — remove unknown ones', url: 'https://discord.com/settings/authorized-apps' },
      { label: 'Review DMs for scam messages sent', description: 'Check Direct Messages for phishing or scam links sent from your account while compromised — notify affected users', url: 'https://discord.com/channels/@me' },
    ],
  },
  {
    name: 'WhatsApp', category: 'social', sortOrder: 5,
    tasks: [
      { label: 'Log out all linked devices', description: 'Open WhatsApp → tap ⋮ → Linked Devices → Log out of all devices', url: null },
      { label: 'Enable 2-step verification', description: 'Open WhatsApp → Settings → Account → Two-step verification', url: null },
      { label: 'Check privacy settings', description: 'Open WhatsApp → Settings → Privacy — restrict who can see your info', url: null },
      { label: 'Change registered phone if compromised', description: 'Open WhatsApp → Settings → Account → Change number', url: null },
      { label: 'Review chats for scam messages sent', description: 'Scroll through recent chats and groups for scam or phishing messages sent while compromised — warn affected contacts', url: null },
    ],
  },
  {
    name: 'Slack', category: 'social', sortOrder: 6,
    tasks: [
      { label: 'Sign out all sessions', description: 'Account settings → Security → Devices — sign out all known sessions', url: 'https://app.slack.com/account/settings' },
      { label: 'Change password', description: 'Use the forgot-password flow to reset', url: 'https://slack.com/forgot-password' },
      { label: 'Enable 2FA', description: 'Account settings → Two-Factor Authentication', url: 'https://app.slack.com/account/settings#two_factor' },
      { label: 'Revoke app permissions', description: 'Workspace admin → Manage apps — remove unknown apps', url: 'https://slack.com/apps/manage' },
      { label: 'Review DMs and channels for unauthorized messages', description: 'Check Direct Messages and channels for messages sent while compromised — notify teammates and delete if possible', url: 'https://app.slack.com/' },
    ],
  },
  {
    name: 'Steam', category: 'social', sortOrder: 7,
    tasks: [
      { label: 'Deauthorize all other devices', description: 'Steam Guard management → Deauthorize all other devices', url: 'https://store.steampowered.com/twofactor/manage' },
      { label: 'Change password', description: 'Use the account recovery flow to change your password', url: 'https://help.steampowered.com/en/wizard/HelpChangePassword' },
      { label: 'Enable Steam Guard (2FA)', description: 'Steam Guard management — enable authenticator app', url: 'https://store.steampowered.com/twofactor/manage' },
      { label: 'Revoke unknown Web API keys', description: 'Steam Community Developer → revoke any unrecognized keys', url: 'https://steamcommunity.com/dev/apikey' },
      { label: 'Review account purchase history', description: 'Check for unauthorized purchases', url: 'https://store.steampowered.com/account/history/' },
      { label: 'Review Steam Chat for scam messages sent', description: 'Check Friends list chats for phishing links or scam messages sent while compromised — warn affected friends', url: 'https://steamcommunity.com/chat' },
    ],
  },
  {
    name: 'Telegram', category: 'social', sortOrder: 8,
    tasks: [
      { label: 'Terminate all other sessions', description: 'Settings → Privacy and Security → Active Sessions → Terminate All Other Sessions', url: 'https://web.telegram.org/' },
      { label: 'Enable Two-Step Verification', description: 'Settings → Privacy and Security → Two-Step Verification — set a strong password', url: 'https://web.telegram.org/' },
      { label: 'Review active sessions', description: 'Settings → Privacy and Security → Active Sessions — check for unknown devices or locations', url: 'https://web.telegram.org/' },
      { label: 'Review chats and groups for scam messages sent', description: 'Check recent chats and group channels for scam or phishing messages sent while compromised — warn contacts', url: 'https://web.telegram.org/' },
      { label: 'Check Privacy settings', description: 'Settings → Privacy and Security — restrict who can see your phone number, profile photo, and last seen', url: 'https://web.telegram.org/' },
      { label: 'Revoke bot tokens if you own bots', description: 'Open @BotFather → /mybots → select bot → API Token → Revoke current token', url: 'https://t.me/BotFather' },
    ],
  },
  {
    name: 'GitHub', category: 'dev', sortOrder: 1,
    tasks: [
      { label: 'Revoke all active sessions', description: 'Settings → Security → Sessions — revoke all unknown sessions', url: 'https://github.com/settings/security' },
      { label: 'Change password', description: 'Settings → Password and authentication → Change password', url: 'https://github.com/settings/password' },
      { label: 'Enable 2FA', description: 'Settings → Password and authentication → Two-factor authentication', url: 'https://github.com/settings/two_factor_authentication/setup/intro' },
      { label: 'Audit SSH keys', description: 'Settings → SSH and GPG keys — delete unrecognized keys', url: 'https://github.com/settings/keys' },
      { label: 'Revoke unknown Personal Access Tokens', description: 'Settings → Developer settings → Personal access tokens', url: 'https://github.com/settings/tokens' },
      { label: 'Revoke unknown OAuth Apps', description: 'Settings → Applications → Authorized OAuth Apps', url: 'https://github.com/settings/applications' },
      { label: 'Check repo webhooks', description: 'Each repo → Settings → Webhooks — remove unknown ones', url: 'https://github.com/settings/hooks' },
    ],
  },
  {
    name: 'Salesforce Org', category: 'dev', sortOrder: 2,
    tasks: [
      { label: 'Terminate all active sessions', description: 'Setup → Security → Session Management → Remove All Active Sessions', url: null },
      { label: 'Change password', description: 'Avatar → My Settings → Personal → Change My Password', url: null },
      { label: 'Enable MFA', description: 'Setup → Identity → Identity Verification — enforce MFA on your user', url: null },
      { label: 'Revoke OAuth connected apps', description: 'Setup → Connected Apps → OAuth Usage by User — revoke unknown apps', url: null },
      { label: 'Review login history', description: 'Setup → Users → Login History — check for unexpected logins', url: null },
      { label: 'Audit Profile & Permission Sets', description: 'Setup → Users → [your user] — verify no new profiles/perms were added', url: null },
    ],
  },
  {
    name: 'PayPal', category: 'financial', sortOrder: 1,
    tasks: [
      { label: 'Log out all devices', description: 'Settings → Security → Log Out of All Devices', url: 'https://www.paypal.com/myaccount/security/login/sessions' },
      { label: 'Change password', description: 'Settings → Security → Password', url: 'https://www.paypal.com/myaccount/security/password' },
      { label: 'Enable 2FA', description: 'Settings → Security → 2-step verification', url: 'https://www.paypal.com/myaccount/security/2fa' },
      { label: 'Review recent transactions', description: 'Look for unauthorized charges — dispute if found', url: 'https://www.paypal.com/myaccount/activities/' },
      { label: 'Verify linked accounts & cards', description: 'Settings → Payments → Manage payments — remove unknown ones', url: 'https://www.paypal.com/myaccount/money/wallets/cards' },
    ],
  },
  {
    name: 'Bank / Credit Card', category: 'financial', sortOrder: 2,
    tasks: [
      { label: 'Change online banking password', description: 'Use a unique, strong password not used anywhere else', url: null },
      { label: 'Enable 2FA / transaction alerts', description: 'Set up SMS or email alerts for all transactions', url: null },
      { label: 'Review recent transactions', description: 'Check for unauthorized charges or withdrawals', url: null },
      { label: 'Contact bank fraud dept if suspicious', description: 'Report any unauthorized activity immediately', url: null },
      { label: 'Lock or freeze card if compromised', description: 'Most banking apps allow instant card freeze', url: null },
    ],
  },
  {
    name: 'Amazon', category: 'financial', sortOrder: 3,
    tasks: [
      { label: 'Sign out of all devices', description: 'Account & Lists → Manage Your Content and Devices → Devices — deregister unknown devices', url: 'https://www.amazon.com/hz/mycd/myx#/home/devices/1' },
      { label: 'Change password', description: 'Account & Lists → Login & security → Edit password', url: 'https://www.amazon.com/ap/cnep' },
      { label: 'Enable 2-Step Verification', description: 'Login & Security → Two-Step Verification (2SV) Settings', url: 'https://www.amazon.com/a/settings/approval' },
      { label: 'Review recent orders for fraud', description: 'Check for unauthorized orders — report via Returns & Orders', url: 'https://www.amazon.com/gp/css/order-history' },
      { label: 'Verify saved payment methods', description: 'Account → Wallet → remove unknown cards or bank accounts', url: 'https://www.amazon.com/cpe/managepaymentmethods' },
    ],
  },
  {
    name: 'Dropbox', category: 'custom', sortOrder: 1,
    tasks: [
      { label: 'Sign out all linked devices', description: 'Security → Devices — click "X" next to each unknown device', url: 'https://www.dropbox.com/account/security#devices' },
      { label: 'Change password', description: 'Personal → Password — set a new strong password', url: 'https://www.dropbox.com/account/personal#password' },
      { label: 'Enable 2-step verification', description: 'Security → Two-step verification — use authenticator app', url: 'https://www.dropbox.com/account/security#two-step-verification' },
      { label: 'Revoke third-party app access', description: 'Connected apps → revoke any unrecognized apps', url: 'https://www.dropbox.com/account/connected_apps' },
    ],
  },
  {
    name: 'ChatGPT / OpenAI', category: 'custom', sortOrder: 2,
    tasks: [
      { label: 'Review account & log out other sessions', description: 'Settings → General — check active devices and log out', url: 'https://chatgpt.com/settings' },
      { label: 'Change password (email login)', description: 'Use the forgot password flow to reset', url: 'https://auth.openai.com/u/forgot-password' },
      { label: 'If using SSO, secure source account', description: 'Secure your Google or Microsoft account first (see Email section above)', url: null },
      { label: 'Revoke API keys', description: 'Platform → API keys — delete all keys and generate new ones', url: 'https://platform.openai.com/api-keys' },
      { label: 'Audit platform usage & billing', description: 'Platform → Usage — look for unexpected API usage', url: 'https://platform.openai.com/usage' },
    ],
  },
  {
    name: 'Anthropic / Claude', category: 'custom', sortOrder: 3,
    tasks: [
      { label: 'Review account settings', description: 'Claude.ai → Settings — check linked accounts and security', url: 'https://claude.ai/settings' },
      { label: 'If using SSO, secure source account', description: 'Secure your Google or Microsoft account first (see Email section above)', url: null },
      { label: 'Revoke API keys', description: 'Anthropic Console → API Keys — delete all keys and issue new ones', url: 'https://console.anthropic.com/settings/keys' },
      { label: 'Audit API usage for unexpected calls', description: 'Anthropic Console → Usage — verify no unauthorized API activity', url: 'https://console.anthropic.com/settings/usage' },
      { label: 'Review organization members', description: 'Console → Organization → Members — remove unknown members', url: 'https://console.anthropic.com/settings/organization' },
    ],
  },
]

async function main() {
  console.log('Seeding...')
  await prisma.completion.deleteMany()
  await prisma.task.deleteMany()
  await prisma.service.deleteMany()

  for (const [i, s] of SERVICES.entries()) {
    await prisma.service.create({
      data: {
        name: s.name,
        category: s.category,
        sortOrder: s.sortOrder,
        isBuiltin: true,
        tasks: {
          create: s.tasks.map((t, j) => ({
            label: t.label,
            description: t.description,
            url: t.url,
            sortOrder: j,
          })),
        },
      },
    })
    process.stdout.write(`  ${i + 1}/${SERVICES.length} ${s.name}\n`)
  }
  console.log('Done.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
