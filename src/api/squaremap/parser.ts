/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import striptags from 'striptags'
import { asBool, calcArea, fastMergeUnique, formatString, range, roundToNearest16 } from 'utils/functions.js'

import type {
    Nation,
    Player,
    Resident,
    SquaremapMarkerset,
    SquaremapRawPlayer,
    SquaremapTown,
    StrictPoint2D
} from 'types'

/**
 * Parses the tooltip on a marker - removing white space, new lines and HTML tags.
 * 
 * Returns an array of one or two string elements. 0 = town, 1 = nation
 * @param tooltip Input string
 */
export const parseTooltip = (tooltip: string) => {
    const cleaned = striptags(tooltip.replaceAll('\n', '')).trim().split(" ")

    // If we have a nation, remove its brackets.
    if (cleaned[1]) {
        cleaned[1] = cleaned[1].replace(/[()]/g, "") 
    }

    return cleaned
}

export const parseInfoString = (str: string) => str.slice(str.indexOf(":") + 1).trim()

interface TownCoords {
    townX: number[]
    townZ: number[]
}

export const parseTowns = async(res: SquaremapMarkerset, removeAccents = false) => {
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

        const points: StrictPoint2D[] = curMarker.points.flat(2)
        const { townX, townZ } = points.reduce((acc: TownCoords, p) => {
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
            bounds: {
                x: townX,
                z: townZ
            },
            points,
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

export const parseNations = async(towns: SquaremapTown[]) => {
    const raw: Record<string, Nation> = {}
    const nations: Nation[] = []
    const len = towns.length

    for (let i = 0; i < len; i++) {
        const town = towns[i]
        
        const nationName = town.nation
        if (nationName == "No Nation") continue

        // Doesn't already exist, create new.
        if (!raw[nationName]) {          
            raw[nationName] = { 
                name: nationName,
                residents: town.residents,
                towns: [],
                area: 0,
                king: undefined,
                capital: undefined
            }

            nations.push(raw[nationName])
        }

        //#region Add extra stuff
        const resNames = raw[nationName].residents

        raw[nationName].residents = fastMergeUnique(resNames, town.residents) 
        raw[nationName].area += town.area

        // Current town is in existing nation
        if (raw[nationName].name == nationName) 
            raw[nationName].towns?.push(town.name)

        if (town.flags.capital) {
            //if (town.wiki) raw[nationName].wiki = town.wiki

            raw[nationName].king = town.mayor
            raw[nationName].capital = {
                name: town.name,
                x: town.x,
                z: town.z
            }
        }
        //#endregion
    }

    return nations
}

// ~ 70-80ms
// export const parseResidents = (towns: SquaremapTown[]) => towns.reduce((acc: Resident[], town: SquaremapTown) => [
//     ...acc,
//     ...town.residents.map(res => {
//         const r: Resident = {
//             name: res,
//             town: town.name,
//             nation: town.nation,
//             rank: town.mayor == res ? (town.flags.capital ? "Nation Leader" : "Mayor") : "Resident"
//         }

//         return r
//     })
// ], [])

// ~ 1-2ms
export const parseResidents = (towns: SquaremapTown[]) => towns.reduce((acc: Resident[], town: SquaremapTown) => {
    acc.push.apply(acc, town.residents.map(res => ({
        name: res,
        town: town.name,
        nation: town.nation,
        rank: town.mayor == res ? (town.flags.capital ? "Nation Leader" : "Mayor") : "Resident"
    })))

    return acc
}, [])

const editPlayerProps = (player: SquaremapRawPlayer): Player => ({
    name: player.name,
    nickname: striptags(formatString(player.display_name)),
    x: player.x,
    z: player.z,
    y: player.yaw,
    underground: player.world != 'earth',
    world: player.world,
    online: true
})

export const parsePlayers = (players: SquaremapRawPlayer[]) => {
    if (!players) throw new Error("Error parsing players: Input was null or undefined!")
    if (!(players instanceof Array)) throw new TypeError("Error parsing players: Input type must be `Object` or `Array`.")

    return players.length > 0 ? players.map(p => editPlayerProps(p)) : []
}