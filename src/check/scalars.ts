import type { Check, ErrorCode } from "./codes"
import { isValidDate } from "./date"
import { checkShape, isRecord, req } from "./shape"

export const str: Check = (value, path, emit) => {
	if (typeof value !== "string") emit("WRONG_TYPE", path)
	else if (value === "") emit("EMPTY_STRING", path)
}

export const bool: Check = (value, path, emit) => {
	if (typeof value !== "boolean") emit("WRONG_TYPE", path)
}

/** Any safe integer (negative allowed): basis-point rates. */
export const safeInt: Check = (value, path, emit) => {
	if (!Number.isSafeInteger(value)) emit("NOT_SAFE_INTEGER", path)
}

/** Non-negative safe integer minor units. */
export const amount: Check = (value, path, emit) => {
	if (!Number.isSafeInteger(value)) emit("NOT_SAFE_INTEGER", path)
	else if ((value as number) < 0) emit("NEGATIVE_AMOUNT", path)
}

export const date: Check = (value, path, emit) => {
	if (!isValidDate(value)) emit("INVALID_DATE", path)
}

export function oneOf(allowed: readonly string[], code: ErrorCode): Check {
	return (value, path, emit) => {
		if (typeof value !== "string" || !allowed.includes(value)) emit(code, path)
	}
}

export const growth: Check = (value, path, emit) => {
	if (value === "inflation") return
	if (!isRecord(value)) return emit("INVALID_GROWTH", path)
	checkShape(value, path, { bps: req(safeInt) }, emit)
}
