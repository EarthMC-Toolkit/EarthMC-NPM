import type { 
    Prettify, Resident,
    Location, SquaremapLocation
} from '../types/index.js'

export type ParsedPlayer = {
    name: string
    nickname?: string
    underground?: boolean
    world?: string
}

export type OnlinePlayer = Prettify<ParsedPlayer & Location>
export type Player = Prettify<Resident & Partial<OnlinePlayer> & {
    online: boolean
}>

export type SquaremapOnlinePlayer = Prettify<ParsedPlayer & SquaremapLocation>
export type SquaremapPlayer = Prettify<Resident & Partial<SquaremapOnlinePlayer> & {
    online: boolean
}>