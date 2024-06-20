import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 8000,
    globals: true,
    watch: false,
    threads: false,
    setupFiles: ["./tests/setup.ts"],
    reporters: ['verbose'],
  }
})