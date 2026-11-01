import type { FREQUENCIES, RESOLUTIONS } from "../vocab"

/** Calendar date, `YYYY-MM-DD`. */
export type DateString = string

/** Integer minor units (cents, satang). Always a safe integer. */
export type MinorUnits = number

/** Integer basis points (1 bps = 0.01%). Always a safe integer. */
export type BasisPoints = number

/** Opaque account identifier. */
export type AccountId = string

export type Frequency = (typeof FREQUENCIES)[number]
export type Resolution = (typeof RESOLUTIONS)[number]

/** `inflation` follows `economy.inflation`; `{ bps }` is a fixed yearly step. */
export type Growth = "inflation" | { readonly bps: BasisPoints }
