import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('[seed] Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY env')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

async function ensureRole(name, description = '') {
  const { data, error } = await supabase.rpc('create_role_if_not_exists', { r_name: name, r_desc: description })
  if (error) console.warn('[seed] role ensure error', name, error.message)
  return data
}

async function findUserByEmail(email) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) throw error
  return data.users.find(u => (u.email || '').toLowerCase() === email.toLowerCase()) || null
}

async function assignUserRole(userId, roleName) {
  const { error } = await supabase.from('app.user_roles').upsert({ user_id: userId, role: roleName }, { onConflict: 'user_id,role' })
  if (error) throw error
}

async function main() {
  await ensureRole('super_admin', 'Full admin capabilities')
  await ensureRole('user', 'Default user role')

  const adminEmail = process.env.ADMIN_EMAIL || 'n8ter8@gmail.com'
  const user = await findUserByEmail(adminEmail)
  if (!user) {
    console.log(`[seed] Create user ${adminEmail} in Supabase Dashboard first. Then re-run.`)
    return
  }
  await assignUserRole(user.id, 'super_admin')
  console.log('[seed] Roles ensured and admin assigned')
}

main().catch((e) => { console.error(e); process.exit(1) })
