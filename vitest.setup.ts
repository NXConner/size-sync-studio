import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Polyfill ResizeObserver for Radix UI in JSDOM
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ResizeObserverPolyfill {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(_cb: ResizeObserverCallback) {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  observe() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unobserve() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect() {}
}
// @ts-ignore
if (typeof globalThis.ResizeObserver === 'undefined') {
  // @ts-ignore
  globalThis.ResizeObserver = ResizeObserverPolyfill as unknown as typeof ResizeObserver;
}

vi.setConfig({ testTimeout: 20000 });