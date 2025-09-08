import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from 'vite-plugin-compression'

const isMobile = Boolean(process.env.CAPACITOR_PLATFORM) || process.env.VITE_MOBILE === '1'

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
    // Precompress assets only for web builds; skip on mobile to avoid Android duplicates
    ...(!isMobile ? [
      viteCompression({ algorithm: 'brotliCompress' }),
      viteCompression({ algorithm: 'gzip' }),
    ] : []),
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
          radix: [
            "@radix-ui/react-accordion","@radix-ui/react-alert-dialog","@radix-ui/react-aspect-ratio","@radix-ui/react-avatar",
            "@radix-ui/react-checkbox","@radix-ui/react-collapsible","@radix-ui/react-context-menu","@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu","@radix-ui/react-hover-card","@radix-ui/react-label","@radix-ui/react-menubar",
            "@radix-ui/react-navigation-menu","@radix-ui/react-popover","@radix-ui/react-progress","@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area","@radix-ui/react-select","@radix-ui/react-separator","@radix-ui/react-slider",
            "@radix-ui/react-slot","@radix-ui/react-switch","@radix-ui/react-tabs","@radix-ui/react-toast","@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group","@radix-ui/react-tooltip"
          ],
          tanstack: ["@tanstack/react-query","@tanstack/react-query-persist-client"],
          opencv: ["/public/opencv/opencv.js"],
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
    exclude: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'tests/e2e/**',
      'e2e/**',
    ],
  },
}));
