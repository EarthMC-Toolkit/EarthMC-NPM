import { 
    RawEntitySpawn, 
    RawEntityStats, 
    RawEntityStatus 
} from "../types.js"

export type Nation = {
    name: string
    uuid?: string
    board?: string
    wiki?: string
    king: string
    towns: string[]
    residents: string[]
    area: number
    capital: NationCapital
    status?: RawEntityStatus
    stats?: RawEntityStats
    spawn?: RawEntitySpawn
    ranks?: { [key: string]: string[] }
    allies?: string[]
    enemies?: string[]
    mapColorHexCode?: string
}

export type NationCapital = {
    name: string
    x: number
    z: number
}