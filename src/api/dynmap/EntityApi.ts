import { Map } from "../../Map.js"

export interface EntityApi<T> {
    map: Map
    all(): Promise<T[]>
    get(...list: string[]): Promise<T[] | T>
}