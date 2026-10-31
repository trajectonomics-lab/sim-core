import { describe, expect, it } from "bun:test"
import { VERSION } from "./index"

describe("@trajectonomics/sim-core public exports", () => {
	it("exports package version constant", () => {
		expect(VERSION).toBe("0.0.0-development")
	})
})
