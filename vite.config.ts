// @ts-nocheck
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from 'url'
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from 'vite-plugin-compression'

// __dirname for ESM
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const isMobile = Boolean(process.env.CAPACITOR_PLATFORM) || process.env.VITE_MOBILE === '1'

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: string }) => ({
  base: process.env.VITE_APP_BASENAME || './',
  server: {
    host: "::",
    port: 8080,
    fs: {
      deny: ['android/**', '**/android/**', '**/android/**/**']
    },
    watch: {
      ignored: ['android/**', '**/android/**', '**/android/**/**']
    },
    sourcemapIgnoreList: (sourcePath) => {
      return sourcePath.includes('node_modules/lucide-react');
    },
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
    // Custom plugin to ignore Android directory
    {
      name: 'ignore-android',
      resolveId(id) {
        if (id.includes('android/') || id.includes('core-js/modules')) {
          return { id: 'virtual:empty', external: true };
        }
        return null;
      },
      load(id) {
        if (id === 'virtual:empty') {
          return 'export default {}';
        }
        return null;
      }
    },
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
    sourcemap: process.env.VITE_SENTRY_DSN ? true : false,
    /**
     * On mobile (Capacitor), avoid inlining assets to reduce memory spikes
     * during WebView load and keep files cacheable by Android WebView.
     */
    assetsInlineLimit: isMobile ? 0 : 4096,
    sourcemapIgnoreList: (sourcePath) => {
      return sourcePath.includes('node_modules/lucide-react');
    },
    // Optimize chunk sizes
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB for large apps
    target: 'es2020',
    /**
     * Strip dev-only code paths in production builds.
     */
    minify: 'esbuild',
    esbuild: {
      drop: isMobile ? ['console', 'debugger'] : [],
    },
    /**
     * Define globals to allow dead-code elimination of debug branches.
     */
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: (id) => {
        // Ignore Android build files and problematic modules
        if (id.includes('android/app/build') || 
            id.includes('core-js/') ||
            id.includes('date-fns/')) {
          return true;
        }
        return false;
      },
      output: {
        manualChunks: (id) => {
          // Computer Vision & Media - separate chunks for large libraries
          if (id.includes('opencv') || id.includes('node_modules/opencv')) return 'opencv';
          if (id.includes('node_modules/canvg')) return 'canvg';
          if (id.includes('node_modules/ffmpeg')) return 'ffmpeg';
          
          // Utilities - separate chunk for date utilities
          if (id.includes('node_modules/date-fns')) return 'date-fns';
          
          // Application code chunks - bundle React-dependent code with React
          if (id.includes('src/pages/') || id.includes('src/components/')) return 'react';
          if (id.includes('src/features/mediax')) return 'mediax';
          if (id.includes('src/features/insights')) return 'insights';
          if (id.includes('src/utils/')) return 'utils';
          
          // ALL node_modules that are NOT computer vision/media go to React chunk
          // This ensures any React-dependent library is bundled with React
          if (id.includes('node_modules/')) {
            // Only exclude specific non-React libraries
            if (id.includes('node_modules/opencv') || 
                id.includes('node_modules/canvg') || 
                id.includes('node_modules/ffmpeg') ||
                id.includes('node_modules/date-fns') ||
                id.includes('node_modules/core-js') ||
                id.includes('node_modules/regenerator-runtime')) {
              return 'vendor';
            }
            // Everything else goes to React chunk
            return 'react';
          }
          
          return null;
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@mediax": path.resolve(__dirname, "./src/features/mediax"),
      // Avoid pulling canvg's ESM build which imports core-js side-effects.
      // We do not use canvg directly; alias to a tiny stub to prevent bare core-js imports in dist.
      "canvg": path.resolve(__dirname, "./src/shims/canvg.ts"),
    },
    dedupe: ['date-fns', 'core-js'],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    conditions: ['import', 'module', 'browser', 'default'],
  },
  // Completely ignore Android directory
  publicDir: 'public',
  root: '.',
  esbuild: {
    target: 'es2020',
    format: 'esm',
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'scheduler',
      'scheduler/unstable_mock',
      '@radix-ui/react-dialog', 
      '@radix-ui/react-switch',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-toast',
      '@radix-ui/react-slot',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-sheet',
      '@radix-ui/react-slider',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      'lucide-react',
      'sonner',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      '@tanstack/react-query',
      '@tanstack/react-query-devtools',
      'zustand',
      'react-router-dom'
    ],
    exclude: [
      'core-js',
      'date-fns',
      '@tanstack/query-sync-storage-persister',
      '@tanstack/react-query-devtools',
      'react-router-dom',
      'opencv',
      'canvg',
      'ffmpeg'
    ],
    force: true,
    // Resolve dynamic import conflicts
    esbuildOptions: {
      target: 'es2020',
    }
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
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
