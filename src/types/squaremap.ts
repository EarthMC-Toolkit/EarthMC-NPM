import type { 
    Point2D,
    HexString,
    Opacity,
    Prettify,
    StrictPoint2D
} from '../types/index.js'

export interface SquaremapPlayersResponse {
    max: number
    players: SquaremapRawPlayer[]
}

export type SquaremapRawPlayer = Prettify<Point2D & {
    uuid: string
    name: string
    display_name: string
    world: string
    yaw: string | number
}>

export type SquaremapMapResponse = SquaremapMarkerset[]

export type SquaremapMarkerset = Prettify<{
    id: "towny" | "chunky"
    name: string
    markers: SquaremapArea[]
    z_index: number
    order: number
    timestamp: number
    hide: boolean
    control: boolean
}>

export type SquaremapAreaType = "polygon" | "icon" | "rectangle" | "polyline" | "circle" | "ellipse"

export interface SquaremapPolygon {
    points: Point2D[][][] // This is fucking horrible.
}

export interface SquaremapPolyline {
    fill: boolean
    points: Point2D[]
}

export type SquaremapIcon = Prettify<{
    icon: string
    point: Point2D
    size: Point2D
    anchor: Point2D
    tooltip_anchor: Point2D
}>

export type SquaremapMarker = Prettify<{
    popup: string
    tooltip: string
    type: SquaremapAreaType
    color?: HexString
    opacity?: Opacity
    fillColor?: HexString
    fillOpacity?: Opacity
}>

type CommonFields = Prettify<
    Omit<Partial<SquaremapPolygon>, 'points'> & 
    Omit<Partial<SquaremapPolyline>, 'points'> &
    Partial<SquaremapIcon>
>
    
type SquaremapPoints = {
    points?: StrictPoint2D[][][] | StrictPoint2D[]
}

export type SquaremapArea = Prettify<SquaremapMarker & CommonFields & SquaremapPoints>