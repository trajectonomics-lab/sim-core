import type { DateString, Resolution } from "./common"

export interface Timeline {
	readonly start: DateString
	readonly horizon: DateString
	readonly resolution: Resolution
}
