export type Nation = {
    name: string
    king: string
    towns: string[]
    residents: string[]
    area: number
    wiki?: string
    capital: {
        name: string
        x: number
        z: number
    }
    stats: unknown
}