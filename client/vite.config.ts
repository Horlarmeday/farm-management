import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html in dist folder
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    ...(process.env.NODE_ENV !== 'production' && process.env.REPL_ID !== undefined
      ? [await import('@replit/vite-plugin-cartographer').then((m) => m.cartographer())]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../shared/dist'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],

          // Router and navigation
          router: ['react-router-dom'],

          // UI component libraries
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-progress',
          ],

          // Chart libraries (split into smaller chunks)
          charts: ['recharts'],

          // Form handling
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],

          // Data fetching and state management
          query: ['@tanstack/react-query'],

          // Date and utility libraries
          utils: ['date-fns', 'clsx', 'tailwind-merge'],

          // Icons
          icons: ['lucide-react'],

          // Notifications and toast
          notifications: ['sonner'],
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ['**/.*'],
      allow: ['..'],
    },
  },
});
