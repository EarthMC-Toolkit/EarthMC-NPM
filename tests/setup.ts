import { 
    Nova, Aurora
} from '../src/main'

import { vi, beforeAll } from 'vitest'

beforeAll(async () => {
    await Nova.Towns.all() // prefill cache before tests
    vi.stubGlobal('Nova', Nova)

    await Aurora.Towns.all() // prefill cache before tests
    vi.stubGlobal('Aurora', Aurora)
})