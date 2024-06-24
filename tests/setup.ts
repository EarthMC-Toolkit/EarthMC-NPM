import { 
    Nova, Aurora
} from '../src/main'

export default async function setup() {
    await Nova.Towns.all() // prefill cache before tests
    await Aurora.Towns.all() // prefill cache before tests
}