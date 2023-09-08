import { 
    Aurora
} from '../src/main'

import { vi, beforeAll } from 'vitest'

beforeAll(async () => {
    await Aurora.Towns.all() // prefill cache before tests
    vi.stubGlobal('Aurora', Aurora)
})