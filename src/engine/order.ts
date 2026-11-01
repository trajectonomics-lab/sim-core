/** Plain UTF-16 code-unit ordering, never `localeCompare`. */
export function compareIds(left: string, right: string): number {
	if (left < right) return -1
	if (left > right) return 1
	return 0
}
