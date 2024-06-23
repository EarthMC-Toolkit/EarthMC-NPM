import type { IMap } from "src/api/squaremap/Squaremap.js"

export interface EntityApi<T> {
    all(): Promise<T[]>
    get(...list: string[]): Promise<T[] | T>
    map: IMap
}