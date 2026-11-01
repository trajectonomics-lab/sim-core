const DATE_SHAPE = /^(\d{4})-(\d{2})-(\d{2})$/
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function isLeapYear(year: number): boolean {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function daysInMonth(year: number, month: number): number {
	return month === 2 && isLeapYear(year) ? 29 : (MONTH_DAYS[month - 1] ?? 0)
}

/** Pure calendar arithmetic (no `Date`): a real `YYYY-MM-DD` date in years 0001-9999. */
export function isValidDate(value: unknown): value is string {
	if (typeof value !== "string") return false
	const match = DATE_SHAPE.exec(value)
	if (!match) return false
	const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
	return year >= 1 && day >= 1 && day <= daysInMonth(year, month)
}
