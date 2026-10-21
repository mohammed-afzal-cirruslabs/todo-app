import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js'],
    // Run in a single worker process. The default worker pool spawns one
    // thread per CPU, which exceeds the pid limit of constrained CI/sandbox
    // containers and aborts before any test runs; a single fork stays within
    // it. On a full-size runner this only costs a little parallelism.
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
  },
})
