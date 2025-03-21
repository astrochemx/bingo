import { describe, expect, it, vi } from "vitest";

import { tryImportWithPredicate } from "./tryImportWithPredicate.js";

function isString(value: unknown) {
	return typeof value === "string";
}

describe("tryImportWithPredicate", () => {
	it("returns the Error when the imported value is an Error", async () => {
		const error = new Error("Oh no!");
		const actual = await tryImportWithPredicate(
			vi.fn().mockResolvedValueOnce(error),
			"create-example.config.js",
			isString,
			"string",
		);

		expect(actual).toBe(error);
	});

	it("returns an error when the imported value does not have a default export", async () => {
		const actual = await tryImportWithPredicate(
			vi.fn().mockResolvedValueOnce({}),
			"create-example.config.js",
			isString,
			"string",
		);

		expect(actual).toEqual(
			new Error(
				`create-example.config.js should have a default exported string.`,
			),
		);
	});

	it("returns an error when the imported value's default export does not match the predicate", async () => {
		const actual = await tryImportWithPredicate(
			vi.fn().mockResolvedValueOnce({ default: false }),
			"create-example.config.js",
			isString,
			"string",
		);

		expect(actual).toEqual(
			new Error(
				`The default export of create-example.config.js should be a string.`,
			),
		);
	});

	it("returns the config when the imported value's default export matches the predicate", async () => {
		const value = "abc";
		const actual = await tryImportWithPredicate(
			vi.fn().mockResolvedValueOnce({ default: value }),
			"create-example.config.js",
			isString,
			"string",
		);

		expect(actual).toBe(value);
	});
});
