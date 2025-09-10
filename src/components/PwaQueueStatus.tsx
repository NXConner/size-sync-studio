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

  return (
    <div className="text-xs text-muted-foreground">
      Offline queue: <span className="font-semibold">{count}</span> pending
    </div>
  )
}

