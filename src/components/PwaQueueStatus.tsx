import { useEffect, useState } from 'react'

type QueueItem = { id: number; queueName: string }

async function readWorkboxQueueCount(queueName: string): Promise<number> {
  try {
    const db = await (window as any).indexedDB.open('workbox-background-sync')
    return await new Promise<number>((resolve) => {
      db.onerror = () => resolve(0)
      db.onsuccess = () => {
        try {
          const database: IDBDatabase = (db as any).result
          const tx = database.transaction(['requests'], 'readonly')
          const store = tx.objectStore('requests')
          const req = store.getAll()
          req.onsuccess = () => {
            const items = (req.result || []) as any[]
            resolve(items.filter((it) => it.queueName === queueName).length)
          }
          req.onerror = () => resolve(0)
        } catch {
          resolve(0)
        }
      }
      db.onupgradeneeded = () => {
        // No-op
      }
    })
  } catch {
    return 0
  }
}

export function PwaQueueStatus() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let mounted = true
    const refresh = async () => {
      const c = await readWorkboxQueueCount('api-queue')
      if (mounted) setCount(c)
    }
    refresh()
    const id = window.setInterval(refresh, 5000)
    return () => { mounted = false; window.clearInterval(id) }
  }, [])

  const clearQueue = async () => {
    try {
      const dbReq = indexedDB.open('workbox-background-sync', 1)
      dbReq.onsuccess = () => {
        try {
          const db = dbReq.result
          const tx = db.transaction(['requests'], 'readwrite')
          const store = tx.objectStore('requests')
          const getAll = store.getAll()
          getAll.onsuccess = () => {
            (getAll.result || []).forEach((item: any) => store.delete(item.id))
          }
        } catch {}
      }
    } catch {}
  }

  const retryNow = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready
        reg.sync?.register?.('workbox-background-sync:api-queue')
      }
    } catch {}
  }

  return (
    <div className="text-xs text-muted-foreground flex items-center gap-3">
      <span>Offline queue: <span className="font-semibold">{count}</span> pending</span>
      <button className="underline" onClick={retryNow}>Retry</button>
      <button className="underline" onClick={clearQueue}>Clear</button>
    </div>
  )
}

