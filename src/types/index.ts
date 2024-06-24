import type { Prettify, ValuesOf } from './util.js'

export * from './gps.js'
export * from './town.js'
export * from './nation.js'
export * from './resident.js'
export * from './player.js'

export * from './dynmap.js'
export * from './squaremap.js'

export * from './oapi.js'
export * from './util.js'

export const Maps = {
    Squaremap: {
        AURORA: 'aurora'
    },
    Dynmap: {
        NOVA: 'nova'
    }
} as const

export type SquaremapMap = ValuesOf<typeof Maps.Squaremap>
export type DynmapMap = ValuesOf<typeof Maps.Dynmap>
export type AnyMap = Prettify<SquaremapMap | DynmapMap>