export type WorkerMessage = { id: string; type: string; payload?: any };
export type WorkerResponse = { id: string; ok: boolean; data?: any; error?: string };

export class OpenCVWorkerClient {
  private worker: Worker | null = null;
  private pending: Map<string, { resolve: (v: any) => void; reject: (e: any) => void }> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'Worker' in window) {
      try {
        this.worker = new Worker('/opencv-worker.js');
        this.worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
          const msg = ev.data;
          const p = this.pending.get(msg.id);
          if (!p) return;
          this.pending.delete(msg.id);
          if (msg.ok) p.resolve(msg.data);
          else p.reject(new Error(msg.error || 'Worker error'));
        };
      } catch {
        this.worker = null;
      }
    }
  }

  private call<T = any>(type: string, payload?: any): Promise<T> {
    if (!this.worker) return Promise.reject(new Error('Worker unavailable'));
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const message: WorkerMessage = { id, type, payload };
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker!.postMessage(message);
    });
  }

  async load(): Promise<{ ready: boolean }> {
    return this.call('load');
  }

  async ping(): Promise<{ pong: boolean }> {
    return this.call('ping');
  }

  async edges(input: { width: number; height: number; imageData: Uint8ClampedArray }): Promise<{ width: number; height: number; imageData: Uint8ClampedArray }> {
    if (!this.worker) throw new Error('Worker unavailable');
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const message = { id, type: 'edges', payload: { width: input.width, height: input.height, imageData: input.imageData.buffer } } as any;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      // Transfer the buffer for zero-copy
      (this.worker as Worker).postMessage(message, [input.imageData.buffer]);
    });
  }
}

export const opencvWorker = new OpenCVWorkerClient();

