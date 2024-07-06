import type { Location, Resident, SquaremapLocation } from '../types/index.js'

export type ParsedPlayer = {
    name: string
    nickname?: string
    underground?: boolean
    world?: string
    online: boolean
}

export type OnlinePlayer = ParsedPlayer & Location
export type Player = (Resident & OnlinePlayer) | OnlinePlayer

export type SquaremapOnlinePlayer = ParsedPlayer & SquaremapLocation
export type SquaremapPlayer = (Resident & SquaremapOnlinePlayer) | SquaremapOnlinePlayer