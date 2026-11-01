import { ACCOUNT_KINDS } from "../vocab"
import type { AccountIndex, Check, Emit, Path } from "./codes"
import { date, oneOf, safeInt, str } from "./scalars"
import { checkShape, checkUnique, isRecord, list, opt, req } from "./shape"

const shape = {
	id: req(str),
	kind: req(oneOf(ACCOUNT_KINDS, "INVALID_KIND")),
	rate: req(safeInt),
	lockedUntil: opt(date),
}

const account: Check = (value, path, emit) => {
	const checked = checkShape(value, path, shape, emit)
	if (checked?.["kind"] === "liability" && Object.hasOwn(checked, "lockedUntil")) {
		emit("LIABILITY_MISUSE", [...path, "lockedUntil"])
	}
}

export function checkAccounts(value: unknown, path: Path, emit: Emit): void {
	list(account)(value, path, emit)
	checkUnique(value, path, "id", emit)
}

/** Declared account ids (first declaration wins) mapped to their raw `kind`. */
export function indexAccounts(accounts: unknown): AccountIndex {
	const index = new Map<string, unknown>()
	if (!Array.isArray(accounts)) return index
	for (const item of accounts as readonly unknown[]) {
		if (isRecord(item) && typeof item["id"] === "string" && !index.has(item["id"])) {
			index.set(item["id"], item["kind"])
		}
	}
	return index
}
