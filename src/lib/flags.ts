export type FeatureFlagKey =
  | 'ADVANCED_ML'
  | 'EXPERIMENT_MEASURE';

const defaults: Record<FeatureFlagKey, boolean> = {
  ADVANCED_ML: false,
  EXPERIMENT_MEASURE: false,
};

export const flags = {
  get(k: FeatureFlagKey): boolean {
    const envKey = `VITE_FLAG_${k}` as const;
    const raw = (import.meta as any).env?.[envKey];
    if (raw !== undefined) return raw === '1' || raw === true || raw === 'true';
    try {
      const stored = localStorage.getItem(`flag:${k}`);
      if (stored != null) return stored === '1' || stored === 'true';
    } catch {}
    return defaults[k];
  },
  set(k: FeatureFlagKey, value: boolean) {
    try { localStorage.setItem(`flag:${k}`, value ? '1' : '0'); } catch {}
  }
};
