/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import striptags from 'striptags'
import { asBool, calcArea, formatString, range, roundToNearest16 } from 'utils/functions.js'

import type {
    Point2D,
    Resident,
    SquaremapMarkerset,
    SquaremapRawPlayer,
    SquaremapTown
} from 'types'

/**
 * Parses the tooltip on a marker - removing white space, new lines and HTML tags.
 * 
 * Returns an array of one or two string elements. 0 = town, 1 = nation
 * @param tooltip Input string
 */
const parseTooltip = (tooltip: string) => {
    const cleaned = striptags(tooltip.replaceAll('\n', '')).trim().split(" ")

    // If we have a nation, remove its brackets.
    if (cleaned[1]) {
        cleaned[1] = cleaned[1].replace(/[()]/g, "") 
    }

    return cleaned
}

const parseInfoString = (str: string) => str.slice(str.indexOf(":") + 1).trim()

interface TownCoords {
    townX: number[]
    townZ: number[]
}

const parseTowns = async(res: SquaremapMarkerset, removeAccents = false) => {
    if (res.id == "chunky") throw new Error("Error parsing towns: Chunky markerset detected, pass a towny markerset instead.")
    if (!res?.markers) throw new ReferenceError('Error parsing towns: Missing or invalid markers!')

    // Using a set is faster and does not allow duplicate keys.
    const capitals = res.markers.reduce((acc, x) => {
        if (x.type == "icon" && x.icon.includes("capital")) {
            acc.add(parseTooltip(x.tooltip)[0])
        }

        return acc
    }, new Set<string>())

    const len = res.markers.length
    const towns: SquaremapTown[] = []

    for (let i = 0; i < len; i++) {
        const curMarker = res.markers[i]
        if (curMarker.type == "icon") continue

        const rawInfo = curMarker.popup.replaceAll('\n', '')
        const info = striptags(rawInfo, ['a']).split("        ") // TODO: Probably not reliable, replace with trim ?

        const parsedTooltip = parseTooltip(curMarker.tooltip)

        const bounds: Point2D[] = curMarker.points.flat(2)
        const { townX, townZ } = bounds.reduce((acc: TownCoords, p) => {
            acc.townX.push(roundToNearest16(p.x as number))
            acc.townZ.push(roundToNearest16(p.z as number))

            return acc
        }, { townX: [], townZ: [] })

        const residents = parseInfoString(info[4]).split(", ")
        const assistants = parseInfoString(info[2]).split(", ")
        if (assistants[0].toLowerCase() == 'none') {
            assistants.shift()
        }

        const townName = parsedTooltip[0]

        const town: SquaremapTown = {
            name: formatString(townName, removeAccents),
            nation: parsedTooltip[1] ? formatString(parsedTooltip[1], removeAccents) : "No Nation",
            mayor: parseInfoString(info[1]),
            assistants, 
            residents,
            area: calcArea(townX, townZ, townX.length),
            bounds: bounds as any,
            x: range(townX),
            z: range(townZ),
            flags: {
                pvp: asBool(parseInfoString(info[3])),
                capital: capitals.has(townName)
            } as any,
            colours: {
                fill: curMarker.fillColor,
                outline: curMarker.color
            },
            opacities: {
                fill: curMarker.fillOpacity,
                outline: curMarker.opacity
            }
        }

        towns.push(town)
    }

    return towns
}

// const parseNations = async(towns: Town[]) => {

// }

const parseResidents = (towns: SquaremapTown[]) => towns.reduce((acc: Resident[], town: SquaremapTown) => [
    ...acc,
    ...town.residents.map(res => {
        const r: Resident = {
            name: res,
            town: town.name,
            nation: town.nation,
            rank: town.mayor == res ? (town.flags.capital ? "Nation Leader" : "Mayor") : "Resident"
        }

        return r
    })
], [])

const parsePlayers = async(res: SquaremapRawPlayer[]) => {
    
}

export {
    parseTowns,
    parsePlayers,
    parseResidents
}