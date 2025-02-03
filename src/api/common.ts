import type { StrictPoint2D, Point2D, TownBounds } from ".././types/index.js"
import { hypot, safeParseInt, strictFalsy } from ".././utils/functions.js"

type LocOrNation = Partial<Point2D & {
    capital: Point2D
}>

export const getNearest = async<T extends LocOrNation>(
    location: StrictPoint2D, radius: StrictPoint2D,
    arr?: T[], fallback?: () => Promise<T[]>, disallowCenter = false
) => {
    if (!arr) {
        arr = await fallback()
        if (!arr) return null
    }

    if (disallowCenter) return arr.filter(el => {
        if (el.x == 0 && el.z == 0) return
        return hypot(safeParseInt(el.x ?? el.capital.x), [location.x, radius.x]) && 
               hypot(safeParseInt(el.z ?? el.capital.z), [location.z, radius.z])
    })
    
    return arr.filter(el => 
        hypot(safeParseInt(el.x ?? el.capital.x), [location.x, radius.x]) && 
        hypot(safeParseInt(el.z ?? el.capital.z), [location.z, radius.z])
    )
}

export const checkWithinBounds = (location: Point2D, bounds: TownBounds) => {
    if (strictFalsy(location.x) || strictFalsy(location.z)) {
        const obj = JSON.stringify(location)
        throw new ReferenceError(`(withinBounds) - Invalid location:\n${obj}`)
    }

    const locX = safeParseInt(location.x)
    const locZ = safeParseInt(location.z)

    // Check if the given coordinates are within the bounds or on the bounds
    const withinX = locX >= Math.min(...bounds.x) && locX <= Math.max(...bounds.x)
    const withinZ = locZ >= Math.min(...bounds.z) && locZ <= Math.max(...bounds.z)

    return withinX && withinZ
}

export const checkWithinTown = async<T extends { bounds: TownBounds }>(location: Point2D, towns: T[]) => {
    const len = towns.length
    
    let inBounds = false
    for (let i = 0; i < len; i++) {
        const cur = towns[i]

        if (checkWithinBounds(location, cur.bounds)) {
            inBounds = true
            break
        }
    }

    return inBounds
}