import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    testTimeout: 6000,
    globals: true,
    watch: false,
    setupFiles: ["./tests/setup.ts"]
  },
  resolve: {
    alias: {
      'classes': resolve(__dirname, './src/classes'),
      'oapi': resolve(__dirname, "./src/classes/OAPI"),
      'types': resolve(__dirname, './src/types/index'),
      'fn': resolve(__dirname, './src/utils/functions'),
      'endpoint': resolve(__dirname, './src/utils/endpoint'),
      'errors': resolve(__dirname, './src/utils/errors')
    },
  }
})