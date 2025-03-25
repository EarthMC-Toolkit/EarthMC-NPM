import type { Prettify } from './util.js'

export * from './gps.js'
export * from './town.js'
export * from './nation.js'
export * from './resident.js'
export * from './player.js'

export * from './dynmap.js'
export * from './squaremap.js'

export * from './oapi.js'
export * from './util.js'

export const SQUAREMAP_MAPS = ['aurora'] as const
export const DYNMAP_MAPS = ['nova'] as const

export type SquaremapMap = typeof SQUAREMAP_MAPS[number]
export type DynmapMap = typeof DYNMAP_MAPS[number]
export type AnyMap = Prettify<SquaremapMap | DynmapMap>