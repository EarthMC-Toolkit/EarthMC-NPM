import { Location } from '../types.js'

export type ApiEntityRaw = {
    status: EntityStatusRaw
    stats: EntityStatsRaw
    ranks?: { [key: string]: string[] }
    spawn?: Location
}

export type EntityStatusRaw = {
    isPublic: boolean
    isOpen: boolean
    isNeutral: boolean
    isCapital?: boolean
    isOverClaimed?: boolean
    isRuined?: boolean
    isOnline?: boolean 
}

export type EntityStatsRaw = {
    maxTownBlocks?: number
    numTownBlocks?: number
    numResidents?: number
    numTowns?: number
    balance: number
}

export type ResidentPermsRaw = {
    friend: boolean
    town: boolean
    ally: boolean
    outsider: boolean
}

export type TownPermsRaw = {
    resident: boolean
    nation: boolean
    ally: boolean
    outsider: boolean
}

export type FlagPermsRaw = {
    pvp: boolean
    explosion: boolean
    fire: boolean
    mobs: boolean
}

export type EntityPermsRaw<PermsType> = {
    flagPerms: FlagPermsRaw
    rnaoPerms: {
        buildPerms: PermsType
        destroyPerms: PermsType
        switchPerms: PermsType
        itemUsePerms: PermsType
    }
}

export type ApiTownRaw = ApiEntityRaw & {
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
    timestamps?: {
        registered?: number
        joinedNationAt?: number
    }
    home: Location
    residents: string[]
    perms: EntityPermsRaw<TownPermsRaw>
}

export type ApiNationRaw = ApiEntityRaw & {
    strings: {
        nation: string
        board: string
        king: string
        capital: string
        mapColorHexCode: string
    }
    timestamps?: {
        registered?: number
    }
    towns: string[]
    residents: string[]
    allies: string[]
    enemies: string[]
}

export type ApiResidentRaw = ApiEntityRaw & {
    strings: {
        title: string
        username: string
        surname: string
    }
    affiliation?: {
        town?: string
        nation?: string
    }
    timestamps?: {
        joinedTownAt?: number
        registered: number
        lastOnline: number
    }
    perms: EntityPermsRaw<ResidentPermsRaw>
    friends: string[]
}

export type ServerInfoRaw = {
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