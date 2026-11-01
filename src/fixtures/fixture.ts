import type { Baseline, Scenario, Timeline } from "../types"

export interface Fixture {
	readonly baseline: Baseline
	readonly scenario: Scenario
	readonly timeline: Timeline
}
