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
    },
    wiki?: string
    balance?: number
    timestamps?: {
        joinedNation?: number
        founded: number
    }
    founder?: string
    trusted?: string[]
    outlaws?: string[]
}

export type SquaremapTown = Prettify<BaseTown & {
    board: string
    wealth: number
    councillors: string[]
    flags: {
        //pvp: boolean
        capital: boolean
    }
    points: {
        x: number
        z: number
    }[]
}>

export type Town = Prettify<BaseTown & {
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