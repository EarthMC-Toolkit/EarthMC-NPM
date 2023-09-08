import { CardinalDirection, Location } from '../types.js'

export type MapResponse = {
    timestamp: number
    sets: {
        markers: Markerset
        'worldborder.markerset': Markerset
        'townyPlugin.markerset': Markerset
    }
}

export type Markerset = {
    areas: { [key: string]: MapArea }
    label: string
    markers: any
    lines: any
}

type StringContainedWithin<T extends string, U extends string> = `${T}${string}${U}`
type DivString = StringContainedWithin<"<div><div>", "</div></div>">

type HexString = `#${string}`

type Opacity = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1

export type MapArea = {
    label: string
    x: number[]
    z: number[]
    fillcolor: HexString
    color: HexString
    fillopacity: Opacity
    opacity: Opacity
    desc: DivString
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
    worlds: ConfigWorld[]
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

type ConfigWorld = {
    sealevel: boolean
    protected: boolean
    maps: ConfigMap[]
    center: Location
}

type MapTypeName = "flat" | "surface" | "Flat" | "Surface"

type ConfigMap = {
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

const Maps = {
    aurora: "aurora",
    nova: "nova",
    Aurora: "Aurora",
    Nova: "Nova"
} as const

export type ValidMapName = typeof Maps[keyof typeof Maps] | `${string}aurora`