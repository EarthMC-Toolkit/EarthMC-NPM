import { Point2D } from '../types.js'

export interface SquaremapPlayersResponse {
    max: number
    players: SquaremapRawPlayer[]
}

export type SquaremapRawPlayer = Point2D & {
    uuid: string
    name: string
    display_name: string
    world: string
    yaw: string | number
}