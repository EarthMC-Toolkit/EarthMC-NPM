/* eslint-disable camelcase */
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

// We do it this way so that the `playerStats` method will return the order
// exactly as seen below instead of the jumbled mess from the original response.
//
// It can't solely be a type because it wouldn't preserve the order at runtime.
export type RawPlayerStatsV3 = typeof rawPlayerStatsTemplate
export const rawPlayerStatsTemplate = {
    // PVP / PVE
    player_kills: 0,
    mob_kills: 0,
    deaths: 0,
    // Damage
    damage_taken: 0,
    damage_dealt: 0,
    damage_resisted: 0,
    damage_absorbed: 0,
    damage_dealt_resisted: 0,
    damage_dealt_absorbed: 0,
    damage_blocked_by_shield: 0,
    // Interact
    interact_with_crafting_table: 0,
    interact_with_smithing_table: 0,
    interact_with_cartography_table: 0,
    interact_with_furnace: 0,
    interact_with_blast_furnace: 0,
    interact_with_smoker: 0,
    interact_with_stonecutter: 0,
    interact_with_grindstone: 0,
    interact_with_anvil: 0,
    interact_with_loom: 0,
    interact_with_lectern: 0,
    interact_with_beacon: 0,
    interact_with_campfire: 0,
    interact_with_brewingstand: 0,
    // Inspect
    inspect_dispenser: 0,
    inspect_dropper: 0,
    inspect_hopper: 0,
    // Open
    open_enderchest: 0,
    open_chest: 0,
    open_barrel: 0,
    open_shulker_box: 0,
    // Villager
    traded_with_villager: 0,
    talked_to_villager: 0,
    // Times
    total_world_time: 0,
    play_time: 0,
    sneak_time: 0,
    time_since_rest: 0,
    time_since_death: 0,
    // Raid
    raid_win: 0,
    raid_trigger: 0,
    // Movement
    walk_one_cm: 0,
    sprint_one_cm: 0,
    boat_one_cm: 0,
    swim_one_cm: 0,
    fall_one_cm: 0,
    walk_on_water_one_cm: 0,
    walk_under_water_one_cm: 0,
    horse_one_cm: 0,
    minecart_one_cm: 0,
    aviate_one_cm: 0,
    crouch_one_cm: 0,
    climb_one_cm: 0,
    pig_one_cm: 0,
    fly_one_cm: 0,
    strider_one_cm: 0,
    // Clean
    clean_banner: 0,
    clean_shulker_box: 0,
    clean_armor: 0,
    // Mobs
    animals_bred: 0,
    fish_caught: 0,
    // Music/Play
    play_record: 0,
    play_noteblock: 0,
    tune_noteblock: 0,
    // Misc
    jump: 0,
    bell_ring: 0,
    eat_cake_slice: 0,
    sleep_in_bed: 0,
    trigger_trapped_chest: 0,
    fill_cauldron: 0,
    use_cauldron: 0,
    target_hit: 0,
    drop_count: 0,
    pot_flower: 0,
    leave_game: 0,
    enchant_item: 0
} as const

export interface RawQuarterResponseV3 {
    name: string
    uuid: string
    type: "APARTMENT" | "INN" | "STATION"
    creator: string // UUID
    owner?: Partial<RawEntityV3>
    town: RawEntityV3
    nation: RawEntityV3
    timestamps: {
        registered: number
        claimedAt?: number
    }
    status: {
        isEmbassy: boolean
        isForSale: boolean
    }
    stats: {
        price?: number
        volume: number
        numCuboids: number
        particleSize?: number
    }
    color: ArrNums<4> // RGBA
    trusted: RawEntityV3[]
    cuboids: QuarterCuboidV3[]
}

export interface QuarterCuboidV3 {
    cornerOne: ArrNums<3>
    cornerTwo: ArrNums<3>
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
    location: Partial<StrictPoint2D>
    isWilderness: boolean
    town?: Partial<RawEntityV3>
    nation?: Partial<RawEntityV3>
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
        flags: RawFlagPerms
    }
    ranks?: {
        townRanks: string[]
        nationRanks: string[]
    }
    friends: RawEntityV3[]
}

export interface RawTownV3 extends RawEntityV3 {
    board: string
    founder: string
    wiki?: string // The URL to this town's wiki page.
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
        build: ArrBools<4>
        destroy: ArrBools<4>
        switch: ArrBools<4>
        itemUse: ArrBools<4>
        flags: RawFlagPerms
    }
    coordinates: {
        spawn: RawEntitySpawn
        homeBlock: ArrNums<2> // First num is X, second is Z.
        townBlocks: ArrNums<2>[] // Array of blocks. Multiply by 16 to get actual coordinate.
    }
    residents: RawEntityV3[]
    trusted: RawEntityV3[]
    outlaws: RawEntityV3[]
    quarters: RawEntityV3[]
    ranks: {
        Councillor: RawEntityV3[]
        Builder: RawEntityV3[]
        Recruiter: RawEntityV3[]
        Police: RawEntityV3[]
        'Tax-exempt': RawEntityV3[]
        Treasurer: RawEntityV3[]
        Realtor: RawEntityV3[]
        Settler: RawEntityV3[]
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
        Chancellor: RawEntityV3[]
        Colonist: RawEntityV3[]
        Diplomat: RawEntityV3[]
    }
}
//#endregion