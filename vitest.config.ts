import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 6000,
    globals: true,
    watch: false,
    setupFiles: ["./tests/setup.ts"],
    reporters: 'verbose',
    threads: false
  }
})