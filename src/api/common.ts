import type { StrictPoint2D, Point2D } from "types"
import { hypot, safeParseInt } from "utils/functions.js"

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