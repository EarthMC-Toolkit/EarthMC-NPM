export * from './types/oapi_v1.js'
export * from './types/dynmap.js'
export * from './types/gps.js'

export * from './types/town.js'
export * from './types/nation.js'
export * from './types/resident.js'
export * from './types/player.js'

export interface Base {
    all(): void
    get(...list: any[]): void
}