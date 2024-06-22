import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    testTimeout: 6000,
    globals: true,
    watch: false,
    setupFiles: ["./tests/setup.ts"],
    reporters: 'verbose',
    threads: false
  }
})