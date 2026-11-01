export const SCHEMA_VERSION: 1 = 1

export const ACCOUNT_KINDS = ["asset", "liability"] as const
export const FLOW_KINDS = ["income", "expense", "contribution"] as const
export const FREQUENCIES = [
	"once",
	"daily",
	"weekly",
	"biweekly",
	"monthly",
	"quarterly",
	"annual",
] as const
export const RESOLUTIONS = ["day", "month"] as const
