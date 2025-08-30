import { Measurement, Session, Goal } from '@/types';

const STORAGE_KEYS = {
  MEASUREMENTS: 'size-seeker-measurements',
  SESSIONS: 'size-seeker-sessions',
  GOALS: 'size-seeker-goals',
  PHOTOS: 'size-seeker-photos'
};

// Measurements Storage
export const getMeasurements = (): Measurement[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
  return stored ? JSON.parse(stored) : [];
};

export const saveMeasurement = (measurement: Measurement): void => {
  const measurements = getMeasurements();
  const existingIndex = measurements.findIndex(m => m.id === measurement.id);
  
  if (existingIndex >= 0) {
    measurements[existingIndex] = measurement;
  } else {
    measurements.push(measurement);
  }
  
  localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
};

export const deleteMeasurement = (id: string): void => {
  const measurements = getMeasurements().filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
};

// Sessions Storage
export const getSessions = (): Session[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  return stored ? JSON.parse(stored) : [];
};

export const saveSession = (session: Session): void => {
  const sessions = getSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }
  
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
};

export const deleteSession = (id: string): void => {
  const sessions = getSessions().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
};

// Goals Storage
export const getGoals = (): Goal[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
  return stored ? JSON.parse(stored) : [];
};

export const saveGoal = (goal: Goal): void => {
  const goals = getGoals();
  const existingIndex = goals.findIndex(g => g.id === goal.id);
  
  if (existingIndex >= 0) {
    goals[existingIndex] = goal;
  } else {
    goals.push(goal);
  }
  
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
};

export const deleteGoal = (id: string): void => {
  const goals = getGoals().filter(g => g.id !== id);
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
};

// Photo Storage (using IndexedDB for larger files)
export const savePhoto = async (id: string, blob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SizeSeekerPhotos', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['photos'], 'readwrite');
      const store = transaction.objectStore('photos');
      
      store.put({ id, blob, timestamp: Date.now() });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id' });
      }
    };
  });
};

export const getPhoto = async (id: string): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SizeSeekerPhotos', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['photos'], 'readonly');
      const store = transaction.objectStore('photos');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result?.blob || null);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };
  });
};