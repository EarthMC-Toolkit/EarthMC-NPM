import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    testTimeout: 6000,
    globals: true,
    watch: false,
    reporters: 'verbose',
    pool: 'forks',
    poolOptions: {
      forks: {
        //memoryLimit: 0.15, // 15% of sys mem
        minForks: 2, // always use 2 threads
        maxForks: 6 // 6 threads is enough
      }
    },
    typecheck: {
      include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)']
    },
  }
})