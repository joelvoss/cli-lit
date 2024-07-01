type Unarray<T> = T extends Array<infer U> ? U : T;

/**
 * Converts a value to an array.
 */
export function toArr<T>(input?: T): Unarray<T>[] {
	if (input == null) return [];
	if (Array.isArray(input)) return [].concat(...input);
	return [input] as Unarray<T>[];
}
