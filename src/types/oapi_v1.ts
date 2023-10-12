import { Location } from '../types.js'
import { NestedOmit } from './util.js'

//#region Parsed
export type OAPITown = NestedOmit<RawTown, 
    "strings.town" | 
    "strings.founder" |
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
    "strings.nation" |
    "timestamps"
> & {
    name: string
    created: number
}

export type OAPIResident = NestedOmit<RawResident, 
    "strings" |
    "affiliation" |
    "ranks" |
    "perms" |
    "status" |
    "stats"
> & {
    name: string
    title?: string
    surname?: string
    town?: string
    nation?: string
    townRanks: string[]
    nationRanks: string[]
    timestamps: Timestamps
    perms?: {
        build: RawResidentPerms
        destroy: RawResidentPerms
        switch: RawResidentPerms
        itemUse: RawResidentPerms
        flags: RawFlagPerms
    }
    online: boolean
    balance: number
}
//#endregion

//#region Raw, unparsed types
export type RawEntity = {
    status: RawEntityStatus
    stats: RawEntityStats
    ranks?: { [key: string]: string[] }
    spawn?: Location
}

export type RawEntityStatus = {
    isPublic: boolean
    isOpen: boolean
    isNeutral: boolean
    isCapital?: boolean
    isOverClaimed?: boolean
    isRuined?: boolean
    isOnline?: boolean 
}

export type RawEntityStats = {
    maxTownBlocks?: number
    numTownBlocks?: number
    numResidents?: number
    numTowns?: number
    balance: number
}

export type RawResidentPerms = {
    friend: boolean
    town: boolean
    ally: boolean
    outsider: boolean
}

export type RawTownPerms = {
    resident: boolean
    nation: boolean
    ally: boolean
    outsider: boolean
}

export type RawFlagPerms = {
    pvp: boolean
    explosion: boolean
    fire: boolean
    mobs: boolean
}

export type RawEntityPerms<PermsType> = {
    flagPerms: RawFlagPerms
    rnaoPerms: {
        buildPerms: PermsType
        destroyPerms: PermsType
        switchPerms: PermsType
        itemUsePerms: PermsType
    }
}

export type RawTown = RawEntity & {
    strings: {
        town: string
        board: string
        mayor: string
        founder: string
        mapColorHexCode: string
    }
    affiliation?: {
        nation?: string
    }
    timestamps?: Timestamps
    home: Location
    residents: string[]
    perms: RawEntityPerms<RawTownPerms>
}

export type RawNation = RawEntity & {
    strings: {
        nation: string
        board: string
        king: string
        capital: string
        mapColorHexCode: string
    }
    timestamps?: Timestamps
    towns: string[]
    residents: string[]
    allies: string[]
    enemies: string[]
}

export type Timestamps = {
    joinedTownAt?: number
    registered: number
    lastOnline?: number
}

export type RawResident = RawEntity & {
    strings: {
        title: string
        username: string
        surname: string
    }
    affiliation?: Partial<{
        town: string
        nation: string
    }>
    timestamps?: Timestamps
    perms: RawEntityPerms<RawResidentPerms>
    friends: string[]
}

export type RawServerInfo = {
    world: {
        hasStorm: boolean
        isThundering: boolean
        time: number
        fullTime: number
    }
    players: {
        maxPlayers: number
        numOnlinePlayers: number
    }
}
//#endregion