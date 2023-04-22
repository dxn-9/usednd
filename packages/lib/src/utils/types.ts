
/** Gets a keyof T and makes it non nullable */
export type Defined<T, K extends keyof T> = T & Required<{
    [P in K]: NonNullable<T[P]>
}>
