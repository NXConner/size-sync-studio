import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_APP_BASENAME || './',
  server: {
    host: "::",
    port: 8080,
    proxy: (() => {
      const apiBase = (process.env.VITE_API_BASE || '/api').replace(/\/$/, '');
      return {
        [apiBase]: {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
      } as Record<string, any>;
    })(),
  },
  plugins: [
    react(),
    ...(mode === "development" ? [componentTagger()] : []),
    ...(process.env.VITE_SENTRY_DSN ? [sentryVitePlugin({
      org: process.env.SENTRY_ORG || '',
      project: process.env.SENTRY_PROJECT || '',
      // authToken is read from SENTRY_AUTH_TOKEN env in CI if you later enable uploads
      telemetry: false,
      sourcemaps: { assets: './dist/**' },
      disable: !process.env.SENTRY_AUTH_TOKEN,
      release: {
        name: process.env.GITHUB_SHA || undefined,
      },
    })] : []),
    ...(mode === "analyze" ? [visualizer({
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
      template: "treemap",
    })] : []),
  ],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@mediax": path.resolve(__dirname, "./src/features/mediax"),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    css: true,
    globals: true,
  },
}));
