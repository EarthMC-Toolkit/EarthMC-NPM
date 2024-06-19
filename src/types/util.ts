export type NestedOmit<T, K extends PropertyKey> = {
    [P in keyof T as P extends K ? never : P]:
    NestedOmit<T[P], K extends `${Exclude<P, symbol>}.${infer R}` ? R : never>
} extends infer O ? { [P in keyof O]: O[P] } : never;

export type ValidateShape<T, Shape> = T extends Shape ? Exclude<keyof T, keyof Shape> extends never ? T : never : never;

export type Prettify<T> = {
    [K in keyof T]: T[K]
} & unknown

export type AssertPositive<N extends number> = number extends N ? N : `${N}` extends `-${string}` ? never : N;