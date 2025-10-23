// Minimal shim for canvg: only export named APIs used by jspdf ecosystem when present
// This prevents importing 'canvg/lib/index.es.js' which side-effect imports core-js modules.
// If a module actually tries to import from 'canvg', provide no-op fallbacks to avoid runtime errors.

export type CanvgOptions = Record<string, unknown>;

export async function from(): Promise<never> {
  throw new Error("canvg is not available in this build");
}

export default {} as unknown as {
  from: typeof from;
};
