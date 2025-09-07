export type SegRequest = { width: number; height: number; imageData: Uint8ClampedArray }
export type SegResponse = { width: number; height: number; mask: Uint8ClampedArray }

export class SegWorkerClient {
  private worker: Worker | null = null
  private pending = new Map<string, { resolve: (v: any) => void; reject: (e: any) => void }>()

  constructor() {
    if (typeof window !== 'undefined' && 'Worker' in window) {
      try {
        this.worker = new Worker('/seg-worker.js')
        this.worker.onmessage = (ev: MessageEvent<any>) => {
          const msg = ev.data
          const p = this.pending.get(msg?.id)
          if (!p) return
          this.pending.delete(msg.id)
          if (msg.ok) p.resolve(msg.data)
          else p.reject(new Error(msg.error || 'Seg worker error'))
        }
      } catch {
        this.worker = null
      }
    }
  }

  private call<T = any>(type: string, payload?: any, transfers?: Transferable[]): Promise<T> {
    if (!this.worker) return Promise.reject(new Error('Seg worker unavailable'))
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      const msg: any = { id, type, payload }
      if (transfers && transfers.length) (this.worker as Worker).postMessage(msg, transfers)
      else (this.worker as Worker).postMessage(msg)
    })
  }

  async warm(): Promise<{ ready: boolean }> {
    return this.call('warm')
  }

  async segment(input: SegRequest): Promise<SegResponse> {
    return this.call('segment', { width: input.width, height: input.height, imageData: input.imageData.buffer }, [input.imageData.buffer])
  }
}

export const segWorker = new SegWorkerClient()

