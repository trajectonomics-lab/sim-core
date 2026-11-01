import { RESOLUTIONS } from "../vocab"
import type { Emit, Path } from "./codes"
import { isValidDate } from "./date"
import { date, oneOf } from "./scalars"
import { checkShape, req } from "./shape"

const shape = {
	start: req(date),
	horizon: req(date),
	resolution: req(oneOf(RESOLUTIONS, "INVALID_RESOLUTION")),
}

export function checkTimeline(value: unknown, path: Path, emit: Emit): void {
	const timeline = checkShape(value, path, shape, emit)
	const { start, horizon } = timeline ?? {}
	if (isValidDate(start) && isValidDate(horizon) && horizon < start) {
		emit("HORIZON_BEFORE_START", [...path, "horizon"])
	}
}
