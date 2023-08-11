type ConditialArrayType<T> = T extends any[] ? T : T[];

export function toArr<T>(input?: T): ConditialArrayType<T> {
	if (input == null) return [] as ConditialArrayType<T>;
	if (Array.isArray(input)) return [].concat(...input) as ConditialArrayType<T>;
	return [input] as ConditialArrayType<T>;
}
