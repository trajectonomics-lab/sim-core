import type { DateString } from "../types"
import { addDays, addMonthsClamped } from "./arith"

/** `start`, every monthly anniversary of it (clamped), and `horizon`. */
export function monthlyRowDates(start: DateString, horizon: DateString): readonly DateString[] {
	if (horizon <= start) return [start]
	const dates: DateString[] = [start]
	let index = 1
	while (true) {
		const date = addMonthsClamped(start, index)
		if (date >= horizon) break
		dates.push(date)
		index++
	}
	dates.push(horizon)
	return dates
}

/** Every date in `[start, horizon]`. */
export function dailyRowDates(start: DateString, horizon: DateString): readonly DateString[] {
	const dates: DateString[] = []
	for (let date = start; date <= horizon; date = addDays(date, 1)) dates.push(date)
	return dates
}
