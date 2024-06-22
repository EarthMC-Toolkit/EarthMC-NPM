import type { 
    CardinalDirection, Location,
    StringContainedWithin,
    HexString, 
    Opacity
} from 'types'

export type MapResponse = {
    timestamp: number
    sets: {
        markers: Markerset
        'chunky.markerset': Markerset
        'townyPlugin.markerset': Markerset
    }
}

export type Markerset = {
    areas: { [key: string]: MapArea }
    label: string
    markers: any
    lines: any
}

export type MapArea = {
    label: string
    x: number[]
    z: number[]
    fillcolor: HexString
    color: HexString
    fillopacity: Opacity
    opacity: Opacity
    desc: StringContainedWithin<"<div><div>", "</div></div>">
}

export type TownHome = Omit<MapArea, 
    'fillopacity' | 'opacity' | 
    'color' | 'fillcolor'
> & {
    dim: `${string}x${string}`
    icon: string
}

export type PlayersResponse = {
    hasStorm: boolean
    isThundering: boolean
    currentcount: number
    players: RawPlayer[]
    updates: UpdatedTile[]
    confighash: number
    servertime: number
    timestamp: number
}

export type RawPlayer = Location & {
    world: string
    account: string
    name: string
}

export type UpdatedTile = {
    name: string
    timestamp: number
}

export type ConfigResponse = {
    updaterate: number
    components: Array<ConfigComponent>
    worlds: WorldConfig[]
    confighash: number
    defaultmap: MapTypeName
    title: string
    grayplayerswhenhidden: boolean
    defaultzoom: number
    allowwebchat: boolean
    allowchat: boolean
    sidebaropened: boolean
    'webchat-interval': number
    coreversion: string
    joinmessage: string
    quitmessage: string
    'webchat-requires-login': boolean
    showlayercontrol: "true" | "false" | boolean
    'login-enabled': boolean
    loginrequired: boolean
    maxcount: number
    dynmapversion: string
    cyrillic: boolean
    jsonfile: boolean
    webprefix: string
    showplayerfacesinmenu: boolean
    defaultworld: "earth" | "some-other-bogus-world" | "nether" | "overworld"
}

type SpawnComponent = BaseComponent & {
    spawnlabel?: string
    spawnbedhidebydefault?: boolean
    spawnbedformat?: string
    showworldborder?: boolean
    sendbutton?: boolean
    showlabel?: boolean
    offlineicon?: string
    showspawnbeds?: boolean
    showofflineplayers?: boolean
    spawnbedicon?: string
    offlinehidebydefault?: boolean
    offlinelabel?: string
    enablesigns?: boolean
    'default-sign-set'?: string
    spawnicon?: string
    offlineminzoom?: number
    spawnbedminzoom?: number
    showspawn?: boolean
    spawnbedlabel?: string
    maxofflinetime?: number
}

type ClockComponent = BaseComponent & {
    showdigitalslock: boolean
    showweather: boolean
}

type LocationComponent = BaseComponent & {
    'show-mcr': boolean
    'show-chunk': boolean
    hidey: boolean
}

type ConfigComponent = BaseComponent | ClockComponent | SpawnComponent | LocationComponent | PlayersComponent

type PlayersComponent = BaseComponent & {
    hidebydefault: boolean
    showplayerhealth: boolean
    showplayerbody: boolean
    showplayerfaces: boolean
    smallplayerfaces: boolean
    layerprio: number
}

type BaseComponent = {
    label?: string
    type: string
}

type WorldConfig = {
    sealevel: boolean
    protected: boolean
    maps: MapConfig[]
    center: Location
}

type MapTypeName = "flat" | "surface" | "Flat" | "Surface"

type MapConfig = {
    name: MapTypeName
    scale: number
    icon?: string
    azimuth: number
    nightandday: boolean
    shader: string
    compassview: CardinalDirection
    prefix: MapTypeName
    tilescale: number
    type: "HDMapType"
    title: MapTypeName
    background: string | boolean
    backgroundday?: string | boolean
    backgroundnight: string | boolean
    protected: boolean
    perspective: string
    maptoworld: number[] 
    worldtomap: number[]
    inclination: number
    'image-format': "webp" | "png" | "jpg" | "jpeg"
    lighting: string
    bigmap: boolean
    mapzoomin: number
    mapzoomout: number
    boostzoom: number
}