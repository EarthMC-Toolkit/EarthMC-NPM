const createRoute = (
    avoidPvp: boolean, 
    avoidPublic: boolean
) => ({ avoidPvp, avoidPublic }) as const

export const Routes = {
    SAFEST: createRoute(true, true),
    FASTEST: createRoute(false, false),
    AVOID_PUBLIC: createRoute(false, true),
    AVOID_PVP: createRoute(true, false)
} as const

export type RouteType = typeof Routes
export type RouteKey = keyof RouteType

export type Route = RouteType[RouteKey]

export type Location = Point2D & {
    y?: number | string
}

export type Point2D = {
    x: number | string
    z: number | string
}

export type StrictPoint2D = {
    x: number
    z: number
}

export type RouteInfo = {
    distance: number
    direction: "north" | "east" | "south" | "west"
    nation?: {
        name: string
        capital: {
            name: string
            x: number
            z: number
        }
    }
}

export type CardinalDirection = "N" | "E" | "W" | "S" | "NE" | "NW" | "SE" | "SW"