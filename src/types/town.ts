export type Town = {
    name: string
    nation: string | "No Nation"
    founder?: string
    mayor: string
    area: number
    bounds: TownBounds
    x: number
    z: number
    residents: string[]
    onlineResidents?: string[]
    flags: TownFlags
    balance?: number
    timestamps?: {
        joinedNation: number
        founded: number
    }
    trusted?: string[]
    outlaws?: string[]
    colourCodes: {
        fill: string
        outline: string
    }
    wiki?: string
}

export type TownStatus = {
    open: boolean
    neutral: boolean
    overclaimed: boolean
    ruined: boolean
}

export type TownFlags = {
    pvp: boolean
    mobs: boolean
    public: boolean
    explosion: boolean
    fire: boolean
    capital: boolean
}

export type TownBounds = {
    x: number[]
    z: number[]
}

export type TownRanks = {
    [key: string]: string 
}