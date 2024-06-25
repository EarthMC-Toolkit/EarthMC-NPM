import striptags from 'striptags'
import { removeDiacritics } from "modern-diacritics"

import type { 
    Point2D,
    RawPlayer, Player, Town,
    BaseTown, BaseNation
} from '../types/index.js'

import { NotFound } from './errors.js'

// Thoroughly tested, faster than both spread and concat w/ high No. of items.
export const fastMerge = <T>(original: T[], args: T[]) => {
    original.push.apply(original, args)
    return original
}

// Fast merge, but convert to set and back to ensure duplicates are removed.
export const fastMergeUnique = <T>(original: T[], args: T[]) => {
    fastMerge(original, args)
    return [...new Set(original)]
}

export const stripInvalidChars = (str: string) => {
    return str.replace(/((&#34)|(&\w[a-z0-9].|&[0-9kmnola-z]));/g, "")
        .replace(/&quot;|&#039;/g, '"')
}

export function formatString(str: string, removeAccents = false) {
    str = stripInvalidChars(str) 
    return removeAccents ? removeDiacritics(str) : str
}

export function editPlayerProps(props: RawPlayer[]) {
    if (!props) throw new ReferenceError("Can't edit player props! The parameter is null or undefined.")

    if (props instanceof Array) return props.length > 0 ? props.map(p => editPlayerProp(p)) : []
    throw new TypeError("Can't edit player props! Type isn't of object or array.")
}

export const editPlayerProp = (player: RawPlayer): Player => ({
    name: player.account,
    nickname: striptags(player.name),
    x: player.x, y: player.y, z: player.z,
    underground: player.world != 'earth',
    world: player.world,
    online: true
})

export const roundToNearest16 = (num: number) => Math.round(num / 16) * 16

export function calcArea(X: number[], Z: number[], numPoints: number, divisor = 256) { 
    let i = 0, j = numPoints - 1, area = 0
    
    for (; i < numPoints; i++) { 
        area += (X[j] + X[i]) * (Z[j] - Z[i]) 
        j = i
    }

    return Math.abs(area / 2) / divisor
}

export function averageNationPos(name: string, towns: Town[]) {
    const nationTowns = towns.filter(t => t.nation?.toLowerCase() == name.toLowerCase())
    return getAveragePos(nationTowns)
}

export function getAveragePos(arr: Point2D[]) {
    if (!arr) return "Error getting average position: 'towns' parameter not defined!"
    
    return {
        x: average(arr, 'x'),
        z: average(arr, 'z')
    } 
}

export const safeParseInt = (num: number | string) => typeof num === "number" ? num : parseInt(num)
export const asBool = (str: string) => str == "true"
export const range = (args: number[]) => Math.round((Math.max(...args) + Math.min(...args)) / 2)

export const sqr = (a: Point2D, b: Point2D, range: number) => Math.hypot(
    safeParseInt(a.x) - safeParseInt(b.x), 
    safeParseInt(a.z) - safeParseInt(b.z)
) <= range

export const average = (nums: Point2D[], key: keyof Point2D) => {
    const sum = nums.map(obj => obj[key]).reduce((a, b) => safeParseInt(a) + safeParseInt(b))
    return safeParseInt(sum) / nums.length
}

// TODO: Ensure this is returning T[] and not a string of names.
export const getExisting = <T>(a1: T[], a2: string[], key: keyof T) => {
    return a2.flat().map(x =>
        a1.find(e => x?.toLowerCase() == String(e[key])?.toLowerCase()
    ) ?? NotFound(x))
}

export const hypot = (num: number, args: [input: number, radius: number]) => {
    const [input, radius] = args
    return num <= (input + radius) && num >= (input - radius)
}

export const manhattan = (x1: number, z1: number, x2: number, z2: number) => 
    Math.abs(x2 - x1) + Math.abs(z2 - z1)

export const euclidean = (x1: number, z1: number, x2: number, z2: number) => 
    Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2))

// Used as alternative to `!` as it considers 0 to be falsy.
export const strictFalsy = (val: any) => val === undefined || val === null

export const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
export function genRandomString(maxAmount = 20) {
    let token = ''
    const len = validChars.length

    for (let i = 0; i < maxAmount; i++) {
        const randomIndex = Math.floor(Math.random() * len)
        token += validChars.charAt(randomIndex)
    }
  
    return token
}

export const isInvitable = (town: BaseTown, nation: BaseNation, range: number, belonging: boolean) => {
    const val = sqr(town, nation.capital, range) && town.nation != nation.name
    return belonging ? val : val && town.nation == "No Nation"
}