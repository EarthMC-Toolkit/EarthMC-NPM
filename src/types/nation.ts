import type { 
    Point2D,
    RawEntitySpawn, 
    RawEntityStats, 
    RawEntityStatus
} from "../types/index.js"

import type { Prettify } from "./util.js"

export type BaseNation = {
    name: string
    king: string
    towns: string[]
    residents: string[]
    area: number
    capital: NationCapital
}

export type Nation = Prettify<BaseNation & Partial<APINationInfo>>
export type SquaremapNation = Prettify<Nation & {
    councillors: string[]
    //wealth?: number
}>

export type APINationInfo = {
    uuid: string
    wiki: string
    status: RawEntityStatus
    stats: RawEntityStats & { numTowns?: number }
    spawn: RawEntitySpawn
    ranks: { [key: string]: string[] }
    allies: string[]
    enemies: string[]
    mapColorHexCode: string
}

export type NationCapital = Prettify<Point2D & {
    name: string
}>