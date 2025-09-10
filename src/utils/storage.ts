import { Measurement, Session, Goal } from "@/types";
import { deriveKeyFromPin, encryptBlob, decryptToBlob } from "@/features/mediax/lib/crypto";

const STORAGE_KEYS = {
  MEASUREMENTS: "size-seeker-measurements",
  SESSIONS: "size-seeker-sessions",
  GOALS: "size-seeker-goals",
  PHOTOS: "size-seeker-photos",
};

// Helper: safely parse JSON from localStorage
function safeReadArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [] as T[];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    // Data may be corrupted or from an older version; reset to empty
    try { localStorage.removeItem(key); } catch {}
    return [] as T[];
  }
}

// Measurements Storage
export const getMeasurements = (): Measurement[] => {
  return safeReadArray<Measurement>(STORAGE_KEYS.MEASUREMENTS);
};

export const saveMeasurement = (measurement: Measurement): void => {
  const measurements = getMeasurements();
  const existingIndex = measurements.findIndex((m) => m.id === measurement.id);

  if (existingIndex >= 0) {
    measurements[existingIndex] = measurement;
  } else {
    measurements.push(measurement);
  }

  localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
};

export const deleteMeasurement = (id: string): void => {
  const measurements = getMeasurements().filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
};

// Sessions Storage
export const getSessions = (): Session[] => {
  return safeReadArray<Session>(STORAGE_KEYS.SESSIONS);
};

export const saveSession = (session: Session): void => {
  const sessions = getSessions();
  const existingIndex = sessions.findIndex((s) => s.id === session.id);

  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }

  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
};

export const deleteSession = (id: string): void => {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
};

// Goals Storage
export const getGoals = (): Goal[] => {
  return safeReadArray<Goal>(STORAGE_KEYS.GOALS);
};

export const saveGoal = (goal: Goal): void => {
  const goals = getGoals();
  const existingIndex = goals.findIndex((g) => g.id === goal.id);

  if (existingIndex >= 0) {
    goals[existingIndex] = goal;
  } else {
    goals.push(goal);
  }

  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
};

export const deleteGoal = (id: string): void => {
  const goals = getGoals().filter((g) => g.id !== id);
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
};

// Photo Storage (using IndexedDB for larger files)
export const savePhoto = async (id: string, blob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SizeSeekerPhotos", 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["photos"], "readwrite");
      const store = transaction.objectStore("photos");

      store.put({ id, blob, timestamp: Date.now() });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("photos")) {
        db.createObjectStore("photos", { keyPath: "id" });
      }
    };
  });
};

// Encrypted photo helpers (optional) using app PIN if set in mediax
export const saveEncryptedPhoto = async (id: string, blob: Blob, pin: string): Promise<void> => {
  const { key } = await deriveKeyFromPin(pin)
  const { ivHex, data, mimeType } = await encryptBlob(blob, key)
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SizeSeekerPhotos", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["photos"], "readwrite");
      const store = transaction.objectStore("photos");
      store.put({ id, encIvHex: ivHex, encData: data, encMimeType: mimeType, timestamp: Date.now() });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("photos")) {
        db.createObjectStore("photos", { keyPath: "id" });
      }
    };
  });
}

// Export/Import utilities
export type ExportBundle = {
  measurements: Measurement[];
  sessions: Session[];
  goals: Goal[];
  photos: Array<{ id: string; blob: Blob }>;
  exportedAt: string;
  version: number;
};

export async function exportAll(): Promise<Blob> {
  const measurements = getMeasurements();
  const sessions = getSessions();
  const goals = getGoals();
  const photos: Array<{ id: string; blob: Blob }> = [];
  for (const m of measurements) {
    if (m.photoUrl) {
      try {
        const b = await getPhoto(m.id);
        if (b) photos.push({ id: m.id, blob: b });
      } catch {}
    }
  }
  const bundle: ExportBundle = {
    measurements,
    sessions,
    goals,
    photos,
    exportedAt: new Date().toISOString(),
    version: 1,
  };
  // Serialize photos as base64 for portability
  const photoEntries: any[] = [];
  for (const p of photos) {
    const b64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(p.blob);
    });
    photoEntries.push({ id: p.id, dataUrl: b64 });
  }
  const json = JSON.stringify({ ...bundle, photos: photoEntries });
  return new Blob([json], { type: 'application/json' });
}

export async function importAll(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text || '{}');
  const measurements: Measurement[] = Array.isArray(data.measurements) ? data.measurements : [];
  const sessions: Session[] = Array.isArray(data.sessions) ? data.sessions : [];
  const goals: Goal[] = Array.isArray(data.goals) ? data.goals : [];
  localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  const photos: Array<{ id: string; dataUrl: string }> = Array.isArray(data.photos) ? data.photos : [];
  for (const p of photos) {
    try {
      const res = await fetch(p.dataUrl);
      const blob = await res.blob();
      await savePhoto(p.id, blob);
    } catch {}
  }
}

export const getPhoto = async (id: string): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SizeSeekerPhotos", 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["photos"], "readonly");
      const store = transaction.objectStore("photos");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const rec = getRequest.result
        if (!rec) return resolve(null)
        if (rec.blob) return resolve(rec.blob)
        // attempt decrypt if encrypted
        if (rec.encIvHex && rec.encData && rec.encMimeType) {
          try {
            const pin = localStorage.getItem('mediax-pin') || ''
            if (!pin) return resolve(null)
            deriveKeyFromPin(pin).then(({ key }) =>
              decryptToBlob(rec.encIvHex, rec.encData, key, rec.encMimeType).then(resolve).catch(() => resolve(null))
            )
            return
          } catch {
            return resolve(null)
          }
        }
        resolve(null);
      };

      getRequest.onerror = () => reject(getRequest.error);
    };
  });
};

export const deletePhoto = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SizeSeekerPhotos", 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["photos"], "readwrite");
      const store = transaction.objectStore("photos");
      const delRequest = store.delete(id);

      delRequest.onsuccess = () => resolve();
      delRequest.onerror = () => reject(delRequest.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("photos")) {
        db.createObjectStore("photos", { keyPath: "id" });
      }
    };
  });
};
