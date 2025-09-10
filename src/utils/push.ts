import { withApiBase } from '@/lib/config'

export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return { ok: false, reason: 'unsupported' }
  const reg = await navigator.serviceWorker.ready
  const keyRes = await fetch(withApiBase('/push/public-key'))
  if (!keyRes.ok) return { ok: false, reason: 'server-key' }
  const { publicKey } = await keyRes.json()
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) })
  const resp = await fetch(withApiBase('/push/subscribe'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) })
  if (!resp.ok) return { ok: false }
  return { ok: true }
}

export async function sendTestPush() {
  const res = await fetch(withApiBase('/push/test'), { method: 'POST' })
  return res.ok
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

