export type NestedOmit<T, K extends PropertyKey> = {
    [P in keyof T as P extends K ? never : P]:
    NestedOmit<T[P], K extends `${Exclude<P, symbol>}.${infer R}` ? R : never>
} extends infer O ? { [P in keyof O]: O[P] } : never;

export type ValidateShape<T, Shape> = T extends Shape ? Exclude<keyof T, keyof Shape> extends never ? T : never : never;

export type Prettify<T> = {
    [K in keyof T]: T[K]
} & unknown

export type ValuesOf<T> = T[keyof T]

export type AssertPositive<N extends number> = number extends N ? N : `${N}` extends `-${string}` ? never : N;

export type StringStartsWith<T extends string> = `${T}${string}`
export type StringEndsWith<T extends string> = `${string}${T}`
export type StringContainedWithin<TStart extends string, TEnd extends string> = `${TStart}${string}${TEnd}`

export type HexString = `#${string}`

export type Opacity = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1

export type ArrNums<N extends number, R extends number[] = []> = 
  R['length'] extends N ? R : ArrNums<N, [...R, number]>

export type ArrBools<N extends number, R extends boolean[] = []> = 
  R['length'] extends N ? R : ArrBools<N, [...R, boolean]>

export type ArrStrings<N extends number, R extends string[] = []> = 
  R['length'] extends N ? R : ArrStrings<N, [...R, string]>
