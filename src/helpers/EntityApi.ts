export interface EntityApi<T> {
    all(): Promise<T[]>
    get(...list: string[]): Promise<T[] | T>
}