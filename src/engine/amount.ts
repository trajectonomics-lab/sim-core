import { grow } from "../money/growth"
import type { BasisPoints } from "../types"
import type { DatedEvent } from "./events"

/** Flow amount at an occurrence, grown from the original by whole annual steps. */
export function amountAt(event: DatedEvent, inflation: BasisPoints): bigint {
	const growth = event.flow.growth
	const rate = growth === "inflation" ? inflation : growth.bps
	return grow(BigInt(event.flow.amount), rate, event.years * 365)
}
