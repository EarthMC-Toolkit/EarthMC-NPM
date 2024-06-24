import type { 
    Location, 
    NestedOmit,
    Prettify 
} from 'types'

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
    name: string
    uuid: string
    title?: string
    surname?: string
    town?: string
    nation?: string
    balance: number
    timestamps: Timestamps
    townRanks?: string[]
    nationRanks?: string[]
    perms?: {
        build: RawResidentPerms
        destroy: RawResidentPerms
        switch: RawResidentPerms
        itemUse: RawResidentPerms
        flags: RawFlagPerms
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

export type RawResidentPerms = Prettify<{
    friend: boolean
    town: boolean
    ally: boolean
    outsider: boolean
}>

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
    perms: RawEntityPerms<RawResidentPerms>
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
        target: number,
        numRemaining: number
    }
}
//#endregion