import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    testTimeout: 6000,
    globals: true,
    watch: false,
    globalSetup: "./tests/setup.ts",
    reporters: 'verbose'
  }
})