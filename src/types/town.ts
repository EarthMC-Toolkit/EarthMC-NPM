import type { StrictPoint2D } from "./index.js"
import type { HexString, Opacity, Prettify } from "./util.js"

export interface BaseTown {
    name: string
    nation: string | "No Nation"
    mayor: string
    residents: string[]
    area: number
    x: number
    z: number
    bounds: TownBounds
    colours: {
        fill: HexString
        outline: HexString
    },
    opacities?: {
        fill: Opacity
        outline: Opacity
    }
}

export type SquaremapTown = Prettify<BaseTown & {
    board?: string
    foundedTimestamp: number,
    councillors: string[]
    wikis?: {
        town?: string
        nation?: string
    },
    flags: {
        pvp: boolean
        public: boolean
        capital: boolean
    }
    points: StrictPoint2D[]
}>

export type Town = Prettify<BaseTown & {
    wiki?: string,
    flags: TownFlags
}>

export type TownBounds = {
    x: number[]
    z: number[]
}

export type TownFlags = Prettify<{
    pvp: boolean
    mobs: boolean
    public: boolean
    explosion: boolean
    fire: boolean
    capital: boolean
}>

// export type TownStatus = {
//     open: boolean
//     neutral: boolean
//     overclaimed: boolean
//     ruined: boolean
// }

// export type TownRanks = {
//     [key: string]: string 
// }