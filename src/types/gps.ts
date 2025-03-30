import type { Prettify } from "./util.js"

const createRoute = (
    avoidPvp: boolean, 
    avoidPrivate: boolean
) => ({ avoidPvp, avoidPrivate }) as const

export const Routes = {
    SAFEST: createRoute(true, true),
    FASTEST: createRoute(false, false),
    AVOID_PRIVATE: createRoute(false, true),
    AVOID_PVP: createRoute(true, false)
} as const

export type RouteType = typeof Routes
export type RouteKey = keyof RouteType

export type Route = RouteType[RouteKey]

export type Location = Prettify<Point2D & {
    y?: number | string
}>

export type SquaremapLocation = Prettify<Point2D & {
    yaw?: number | string
}>

export type Point2D = {
    x: number | string
    z: number | string
}

export type StrictPoint2D = {
    x: number
    z: number
}

//#region Direction
export type CardinalDirectionShort = "N" | "E" | "W" | "S" | "NE" | "NW" | "SE" | "SW"

// Order of arrays matter, do not change.
export const BASE_DIRECTIONS = [
    'North', 'East', 'South', 'West'
] as const

export const DIRECTIONS = [
    'North', 'North-East', 'East', 'South-East', 
    'South', 'South-West', 'West', 'North-West'
] as const

export type BaseCardinalDirection = typeof BASE_DIRECTIONS[number]
export type CardinalDirection = typeof DIRECTIONS[number]
//#endregion

export type TravelTimes = {
    sneaking: number
    walking: number
    sprinting: number
    boat: number
}

export type RouteInfoNation = {
    name: string
    capital: {
        name: string
        x: number
        z: number
    }
}

export type RouteInfo = {
    distance: number
    direction: CardinalDirection
    travelTimes: TravelTimes
    nation?: RouteInfoNation
}