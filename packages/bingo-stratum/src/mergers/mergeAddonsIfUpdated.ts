import hashObject from "hash-object";

export function mergeAddonsIfUpdated<T extends object>(
	existingAddons: T,
	newAddons: T,
): Error | T | undefined {
	const newEntries = Object.entries(newAddons) as [keyof T, unknown][];
	const result = { ...existingAddons };
	let updated = newEntries.length !== Object.keys(existingAddons).length;

	for (const [key, value] of newEntries) {
		if (!(key in result) || result[key] == null) {
			updated = true;
			result[key] = value as T[keyof T];
			continue;
		}

		if (value == null) {
			continue;
		}

		if (Array.isArray(result[key])) {
			if (!Array.isArray(value)) {
				return new Error("Mismatched merging addons (Array.isArray).");
			}

			const existingElementKeys = new Set(
				result[key].map((value) => createHash(value)),
			);

			for (const newElement of value) {
				const newElementKey = createHash(newElement);
				if (!existingElementKeys.has(newElementKey)) {
					existingElementKeys.add(newElementKey);
					result[key].push(newElement);
					updated = true;
				}
			}

			continue;
		}

		if (typeof result[key] === "object") {
			if (typeof value !== "object") {
				return new Error("Mismatched merging addons (typeof object).");
			}

			const nestedMerge = mergeAddonsIfUpdated(result[key], value);
			if (nestedMerge) {
				if (nestedMerge instanceof Error) {
					return nestedMerge;
				}

				result[key] = nestedMerge as T[keyof T];
				updated = true;
			}

			continue;
		}

		if (result[key] !== value) {
			return new Error(
				`Mismatched merging addons (${result[key] as string} vs. ${value as string}).`,
			);
		}
	}

	return updated ? result : undefined;
}

function createHash(value: unknown) {
	return typeof value === "object"
		? hashObject(value as Record<string, unknown>)
		: String(value as boolean | null | number | string | undefined);
}
