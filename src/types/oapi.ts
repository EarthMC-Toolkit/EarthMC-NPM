import type { 
    Location,
    Prettify,
    StrictPoint2D,
    ArrNums,
    ArrBools,
    HexString
} from '../types/index.js'

//#region Base/shared types used by all versions.
export type BaseEntityStatus = Prettify<{
    isPublic: boolean
    isOpen: boolean
    isNeutral: boolean
}>
//#endregion

//#region V2

//#region Parsed
// export type OAPITown = NestedOmit<RawTown, 
//     "timestamps" |
//     "perms.rnaoPerms" |
//     "perms.flagPerms"
// > & {
//     name: string
//     nation: string
//     founder: string
//     created: number
//     joinedNation: number
//     perms: {
//         build: RawTownPerms
//         destroy: RawTownPerms
//         switch: RawTownPerms
//         itemUse: RawTownPerms
//         flags: RawFlagPerms
//     }
// }

// export type OAPINation = NestedOmit<RawNation,
//     "timestamps"
// > & {
//     created: number
// }

// export type OAPIResident = NestedOmit<RawResident, 
//     "ranks" |
//     "perms" |
//     "stats"
// > & {
//     title?: string
//     surname?: string
//     town?: string
//     nation?: string
//     balance: number
//     timestamps: Timestamps
//     townRanks?: string[]
//     nationRanks?: string[]
//     perms?: {
//         build: boolean[] //RawResidentPerms
//         destroy: boolean[] //RawResidentPerms
//         switch: boolean[] //RawResidentPerms
//         itemUse: boolean[] //RawResidentPerms
//         flags: RawFlagPerms //RawResidentPerms
//     }
// }
//#endregion

//#region Raw/Unparsed
// TODO: See which can be shared with V3 and postfix V2 only ones.

export type RawEntity = Prettify<{
    uuid: string
    status: RawEntityStatus
    stats: RawEntityStats
    ranks?: { [key: string]: string[] }
}>

export type RawEntityStatus = Partial<BaseEntityStatus & {
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

export type RawFlagPerms = Prettify<{
    pvp: boolean
    explosion: boolean
    fire: boolean
    mobs: boolean
}>

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
export type RequestBodyV3<T> = {
    query: T
    template?: any
    [key: string]: any
}

export interface RawEntityV3 {
    name: string
    uuid: string
}

export type MoonPhaseV3 = 'FIRST_QUARTER' | 'FULL_MOON' | 'LAST_QUARTER' | 'NEW_MOON' | 'WANING_CRESCENT' | 'WANING_GIBBOUS' | 'WAXING_CRESCENT' | 'WAXING_GIBBOUS'

export interface RawServerInfoV3 {
    version: string
    moonPhase: MoonPhaseV3
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
        numOnlineNomads: number
        numResidents: number
        numNomads: number
        numTowns: number
        numTownBlocks: number
        numNations: number
        numQuarters: number
        numCuboids: number
    }
    voteParty: {
        target: number
        numRemaining: number
    }
}

export interface RawQuarterResponseV3 {
    uuid: string
    type: "APARTMENT" | "INN" | "STATION"
    owner?: Partial<RawEntityV3>
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
    color: ArrNums<3>
    trusted: RawEntityV3[]
    cuboids: { [key: string]: ArrNums<3> }[]
}

export interface DiscordReqObjectV3 {
    type: 'minecraft' | 'discord'
    target: string
}

export interface DiscordResObjectV3 {
    id: string
    uuid: string
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
    about?: string
    town?: Partial<RawEntityV3>
    nation?: Partial<RawEntityV3>
    timestamps: {
        registered: number
        joinedTownAt?: number
        lastOnline?: number
    }
    status: {
        isOnline: boolean
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
        build: ArrBools<4>
        destroy: ArrBools<4>
        switch: ArrBools<4>
        itemUse: ArrBools<4>
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

export interface RawTownV3 extends RawEntityV3 {
    board: string
    wiki?: string // The URL to this town's wiki page.
    founder: string
    mayor: RawEntityV3
    nation?: Partial<RawEntityV3>
    timestamps: {
        registered: number
        joinedNationAt?: number
        ruinedAt?: number
    }
    status: BaseEntityStatus & {
        isCapital: boolean
        isOverClaimed: boolean
        isRuined: boolean
        isForSale: boolean
        hasNation: boolean
        hasOverclaimShield: boolean
        canOutsidersSpawn: boolean
    }
    stats: {
        numTownBlocks: number
        maxTownBlocks: number
        bonusBlocks: number
        numResidents: number
        numTrusted: number
        numOutlaws: number
        balance: number
        forSalePrice?: number
    }
    perms: {
        build: RawTownPerms
        destroy: RawTownPerms
        switch: RawTownPerms
        itemUse: RawTownPerms
        flags: RawFlagPerms
    }
    coordinates: {
        spawn: RawEntitySpawn
        homeBlock: ArrNums<2> // First num is X, second is Z.
        townBlocks: ArrNums<2>[] // Array of blocks. Multiply by 16 to get actual coordinate.
    }
    quarters: string[] // Includes UUID of every quarter in the town.
    residents: RawEntityV3[]
    trusted: RawEntityV3[]
    outlaws: RawEntityV3[]
    ranks: {
        Councillor: string[]
        Builder: string[]
        Recruiter: string[]
        Police: string[]
        'Tax-exempt': string[]
        Treasurer: string[]
        Realtor: string[]
        Settler: string[]
    }
}

export interface RawNationV3 extends RawEntityV3 {
    board?: string
    dynmapColor: HexString
    dynmapOutline: HexString
    wiki?: string
    king: RawEntityV3
    capital: RawEntityV3
    timestamps: {
        registered: number
    }
    status: BaseEntityStatus
    stats: {
        numTownBlocks: number
        numResidents: number
        numTowns: number
        numAllies: number
        numEnemies: number
        balance: number
    }
    coordinates: {
        spawn: RawEntitySpawn
    }
    residents: RawEntityV3[]
    towns: RawEntityV3[]
    allies: RawEntityV3[]
    enemies: RawEntityV3[]
    sanctioned: RawEntityV3[]
    ranks: {
        Chancellor: string[]
        Colonist: string[]
        Diplomat: string[]
    }
}
//#endregion