import type { 
    Location, 
    NestedOmit,
    Prettify, 
    StrictPoint2D
} from '../types/index.js'

//#region V2
//#region Parsed
export type OAPITown = NestedOmit<RawTown, 
    "timestamps" |
    "perms.rnaoPerms" |
    "perms.flagPerms"
> & {
    name: string
    nation: string
    founder: string
    created: number
    joinedNation: number
    perms: {
        build: RawTownPerms
        destroy: RawTownPerms
        switch: RawTownPerms
        itemUse: RawTownPerms
        flags: RawFlagPerms
    }
}

export type OAPINation = NestedOmit<RawNation,
    "timestamps"
> & {
    created: number
}

export type OAPIResident = NestedOmit<RawResident, 
    "ranks" |
    "perms" |
    "stats"
> & {
    title?: string
    surname?: string
    town?: string
    nation?: string
    balance: number
    timestamps: Timestamps
    townRanks?: string[]
    nationRanks?: string[]
    perms?: {
        build: boolean[] //RawResidentPerms
        destroy: boolean[] //RawResidentPerms
        switch: boolean[] //RawResidentPerms
        itemUse: boolean[] //RawResidentPerms
        flags: RawFlagPerms //RawResidentPerms
    }
}
//#endregion

//#region Raw, unparsed types
export type RawEntity = Prettify<{
    uuid: string
    status: RawEntityStatus
    stats: RawEntityStats
    ranks?: { [key: string]: string[] }
}>

export type RawEntityStatus = Partial<{
    isPublic: boolean
    isOpen: boolean
    isNeutral: boolean
    isCapital: boolean
    isOverClaimed: boolean
    isRuined: boolean
    isOnline: boolean
    isNPC: boolean
}>

export type RawEntityStats = Prettify<{
    maxTownBlocks?: number
    numTownBlocks?: number
    numResidents?: number
    numTowns?: number
    balance: number
}>

// export type RawResidentPerms = Prettify<{
//     friend: boolean
//     town: boolean
//     ally: boolean
//     outsider: boolean
// }>

export type RawTownPerms = Prettify<{
    resident: boolean
    nation: boolean
    ally: boolean
    outsider: boolean
}>

export interface RawFlagPerms {
    pvp: boolean
    explosion: boolean
    fire: boolean
    mobs: boolean
}

export interface RawEntityPerms<PermsType> {
    flagPerms: RawFlagPerms
    rnaoPerms: {
        buildPerms: PermsType
        destroyPerms: PermsType
        switchPerms: PermsType
        itemUsePerms: PermsType
    }
}

export type RawEntitySpawn = Prettify<Location & {
    world: string
    pitch?: number
    yaw?: number
}>

export type RawTownCoordinates = Prettify<{
    spawn: RawEntitySpawn 
    home: number[]
    townBlocks: {
        x: number[]
        z: number[]
    }
}>

export type RawTown = Prettify<RawEntity & {
    name: string
    board: string
    mayor: string
    founder: string
    mapColorHexCode: string
    nation?: string
    timestamps?: Timestamps
    perms: Prettify<RawEntityPerms<RawTownPerms>>
    coordinates: RawTownCoordinates
    residents: string[]
    trusted?: string[]
    outlaws?: string[]
}>

export type RawNation = Prettify<RawEntity & {
    name: string
    board?: string
    king: string
    capital: string
    mapColorHexCode: string
    timestamps?: Timestamps
    towns: string[]
    residents: string[]
    allies?: string[]
    enemies?: string[]
}>

export type Timestamps = Prettify<{
    joinedNationAt?: number
    joinedTownAt?: number
    registered: number
    lastOnline?: number
}>

export type RawResident = Prettify<RawEntity & {
    name: string
    title: string
    surname: string
    town?: string
    nation?: string
    timestamps?: Timestamps
    perms: RawEntityPerms<boolean[]>
    friends?: string[]
}>

export interface RawServerInfoV2 {
    world: {
        hasStorm: boolean
        isThundering: boolean
        time: number
        fullTime: number
    }
    players: {
        maxPlayers: number
        numOnlineTownless: number
        numOnlinePlayers: number
    }
    stats: {
        numResidents: number
        numTownless: number
        numTowns: number
        numNations: number
        numTownBlocks: number
    }
}
//#endregion
//#endregion

//#region V3
export interface RawEntityV3 {
    name: string
    uuid: string
}

export interface RawServerInfoV3 {
    version: string
    moonPhase: string
    timestamps: {
        newDayTime: number
        serverTimeOfDay: number
    }
    status: {
        hasStorm: boolean
        isThundering: boolean
    }
    stats: {
        time: number
        fullTime: number
        maxPlayers: number
        numOnlinePlayers: number
        numResidents: number
        numNomads: number
        numTowns: number
        numNations: number
        numTownBlocks: number
        numCuboids: number
        numQuarters: number
    }
    voteParty: {
        target: number
        numRemaining: number
    }
}

export interface RawQuarterResponseV3 {
    uuid: string
    type: "APARTMENT" | "COMMONS" | "PUBLIC" | "SHOP" | "STATION" | "WORKSITE"
    owner: Partial<RawEntityV3>
    town: RawEntityV3
    timestamps: {
        registered: number
        claimedAt?: number
    }
    status: {
        isEmbassy: boolean
    }
    stats: {
        price?: number
        volume: number
        numCuboids: number
    }
    color: [number, number, number]
    trusted: RawEntityV3[]
    cuboids: {
        [key: string]: [number, number, number]
    }[]
}

export interface DiscordReqObject {
    type: 'minecraft' | 'discord'
    target: string
}

export interface DiscordResObject {
    ID: string
    UUID: string
}

export interface RawLocationResponseV3 {
    isWilderness: boolean
    location: Partial<StrictPoint2D>
    town?: RawEntityV3
    nation?: RawEntityV3
}

export interface RawPlayerV3 extends RawEntityV3 {
    title?: string
    surname?: string
    formattedName: string
    about: string
    town?: RawEntityV3
    nation?: RawEntityV3
    timestamps: {
        registered: number
        joinedTownAt?: number
        lastOnline?: number
    }
    status: {
        isOnline: boolean,
        isNPC: boolean
        isMayor: boolean
        isKing: boolean
        hasTown: boolean
        hasNation: boolean
    }
    stats: {
        balance: number
        numFriends: number
    }
    perms: {
        build: [boolean, boolean, boolean, boolean]
        destroy: [boolean, boolean, boolean, boolean]
        switch: [boolean, boolean, boolean, boolean]
        itemUse: [boolean, boolean, boolean, boolean]
        flags: {
            pvp: boolean
            explosion: boolean
            fire: boolean
            mobs: boolean
        }
    }
    ranks?: {
        townRanks: string[]
        nationRanks: string[]
    }
    friends: RawEntityV3[]
}
//#endregion