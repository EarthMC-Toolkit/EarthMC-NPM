import striptags from 'striptags'
import { removeDiacritics } from "modern-diacritics"

import { RawPlayer, Player, Town, Point2D } from '../types.js'
import { NotFound } from './errors.js'

const removeDuplicates = <T>(arr: T[]) => [...new Set(arr)]

const stripInvalidChars = (str: string) => {
    return str.replace(/((&#34)|(&\w[a-z0-9].|&[0-9kmnola-z]));/g, "")
        .replace(/&quot;|&#039;/g, '"')
}

function formatString(str: string, removeAccents = false) {
    str = stripInvalidChars(str) 
    return removeAccents ? removeDiacritics(str) : str
}

function editPlayerProps(props: RawPlayer[]) {
    if (!props) throw new ReferenceError("Can't edit player props! The parameter is null or undefined.")

    if (props instanceof Array) return props.length > 0 ? props.map(p => editPlayerProp(p)) : []
    throw new TypeError("Can't edit player props! Type isn't of object or array.")
}

const editPlayerProp = (player: RawPlayer): Player => ({
    name: player.account,
    nickname: striptags(player.name),
    x: player.x, y: player.y, z: player.z,
    underground: player.world != 'earth',
    world: player.world,
    online: true
})

function calcArea(X: number[], Z: number[], numPoints: number, divisor = 256) { 
    let i = 0, j = numPoints - 1,
        area = 0
    
    for (; i < numPoints; i++) { 
        area += (X[j] + X[i]) * (Z[j] - Z[i]) 
        j = i
    }

    return Math.abs(area / 2) / divisor
}

function averageNationPos(name: string, towns: Town[]) {
    const nationTowns = towns.filter(t => t.nation?.toLowerCase() == name.toLowerCase())
    return getAveragePos(nationTowns)
}

function getAveragePos(arr: Point2D[]) {
    if (!arr) return "Error getting average position: 'towns' parameter not defined!"
    
    return {
        x: average(arr, 'x'),
        z: average(arr, 'z')
    } 
}

const safeParseInt = (num: number | string) => typeof num === "number" ? num : parseInt(num)
const asBool = (str: string) => str == "true"
const range = (args: number[]) => Math.round((Math.max(...args) + Math.min(...args)) / 2)

const sqr = (a: Point2D, b: Point2D, range: number) => Math.hypot(
    safeParseInt(a.x) - safeParseInt(b.x), 
    safeParseInt(a.z) - safeParseInt(b.z)
) <= range

const average = (nums: Point2D[], key: keyof Point2D) => {
    const sum = nums.map(obj => obj[key]).reduce((a, b) => safeParseInt(a) + safeParseInt(b))
    return safeParseInt(sum) / nums.length
}

// TODO: Ensure this is returning T[] and not a string of names.
const getExisting = <T>(a1: T[], a2: string[], key: keyof T) => {
    return a2.flat().map(x =>
        a1.find(e => x?.toLowerCase() == String(e[key])?.toLowerCase()
    ) ?? NotFound(x))
}

const hypot = (num: number, args: [input: number, radius: number]) => {
    const [input, radius] = args
    return num <= (input + radius) && num >= (input - radius)
}

const manhattan = (x1: number, z1: number, x2: number, z2: number) => 
    Math.abs(x2 - x1) + Math.abs(z2 - z1)

const euclidean = (x1: number, z1: number, x2: number, z2: number) => 
    Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2))

// Used as alternative to `!` as it considers 0 to be falsy.
const strictFalsy = (val: any) => val === undefined || val === null

const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
function genRandomString(maxAmount = 20) {
    let token = ''
    const len = validChars.length

    for (let i = 0; i < maxAmount; i++) {
        const randomIndex = Math.floor(Math.random() * len)
        token += validChars.charAt(randomIndex)
    }
  
    return token
}

export {
    sqr,
    range,
    hypot,
    asBool,
    getExisting,
    formatString,
    editPlayerProps,
    calcArea,
    removeDuplicates,
    stripInvalidChars,
    getAveragePos,
    averageNationPos,
    euclidean, 
    manhattan,
    strictFalsy,
    genRandomString,
    safeParseInt
}