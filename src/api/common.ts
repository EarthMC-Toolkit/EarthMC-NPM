import type { StrictPoint2D, Point2D } from "types"
import { hypot, safeParseInt } from "utils/functions.js"

type TownOrNation = Partial<Point2D & {
    capital: Point2D
}>

export const getNearest = async<T extends TownOrNation>(
    location: StrictPoint2D, radius: StrictPoint2D,
    arr?: T[], fallback?: () => Promise<T[]>
) => {
    if (!arr) {
        arr = await fallback()
        if (!arr) return null
    }

    return arr.filter(t => 
        hypot(safeParseInt(t.x ?? t.capital.x), [location.x, radius.x]) && 
        hypot(safeParseInt(t.z ?? t.capital.z), [location.z, radius.z])
    )
}