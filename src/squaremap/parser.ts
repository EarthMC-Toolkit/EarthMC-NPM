/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import striptags from 'striptags'

import { mapData } from '../utils/endpoint.js'
import { calcArea, formatString, roundToNearest16 } from '../utils/functions.js'

import {
    Point2D,
    SquaremapMapResponse,
    SquaremapMarkerset,
    Town
} from '../types.js'

// TESTING
const run = async() => {
    const markerset = await fetchMarkerset()

    const t0 = performance.now()
    const out = await parseTowns(markerset)//.then(console.log)
    
    console.log("Took: " + (performance.now() - t0))

    return out
}

const fetchMarkerset = async() => {
    const res: SquaremapMapResponse = await mapData('Aurora')
    return res.find(x => x.id == "towny")
}

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

const parseInfoString = (str: string) => {
    return str.slice(str.indexOf(":") + 1).trim()
}

interface TownCoords {
    townX: number[]
    townZ: number[]
}

const parseTowns = async(res: SquaremapMarkerset, removeAccents = false) => {
    if (res.id == "chunky") throw new Error("Error parsing towns: Chunky markerset detected, pass a towny markerset instead.")
    if (!res?.markers) throw new ReferenceError('Error parsing towns: Missing or invalid markers!')

    // const capitals = new Map<string, SquaremapArea>(res.markers.reduce((acc: any[], x) => {
    //     if (x.type == "icon" && x.icon.includes("capital")) {
    //         acc.push([parseTooltip(x.tooltip)[0], x])
    //     }

    //     return acc
    // }, []))

    const towns: Town[] = []

    const len = res.markers.length
    for (let i = 0; i < len; i++) {
        const curMarker = res.markers[i]
        if (curMarker.type == "icon") continue

        const rawInfo = curMarker.popup.replaceAll('\n', '')
        const info = striptags(rawInfo, ['a']).split("        ")

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

        const town = {
            name: formatString(parsedTooltip[0], removeAccents),
            nation: parsedTooltip[1] ? formatString(parsedTooltip[1], removeAccents) : "No Nation",
            mayor: parseInfoString(info[1]),
            assistants, residents,
            area: calcArea(townX, townZ, townX.length),
            bounds,
            flags: {
                pvp: parseInfoString(info[3])
            },
            colourCodes: {
                fill: curMarker.fillColor,
                outline: curMarker.color
            }
        } as unknown as Town

        towns.push(town)
    }

    return towns
}

// const parseNations = async(towns: Town[]) => {

// }

run()

export {
    parseTowns
}