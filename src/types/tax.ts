/**
 * Stub types for integration with `@trajectonomics/tax`.
 *
 * Full statutory calculation integration lands in follow-up issues (#4).
 */

export interface TaxCalculationRequest {
	readonly jurisdiction: string
	readonly taxYear?: number
	readonly grossIncome: number
}

export interface TaxCalculationResponse {
	readonly jurisdiction: string
	readonly taxYear: number
	readonly totalTax: number
	readonly effectiveRate: number
}
