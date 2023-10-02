export type Nation = {
    name: string
    king: string
    towns: string[]
    residents: string[]
    area: number
    wiki?: string
    capital: NationCapital
    stats: unknown
}

export type NationCapital = {
    name: string
    x: number
    z: number
}