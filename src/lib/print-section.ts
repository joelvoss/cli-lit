import { INDENT, NEWLINE } from '../constants';

const noop = (s: string) => s;

/**
 * Print a section with a title and lines.
 */
export function printSection(
	title: string,
	lines?: string[] | null,
	fn: typeof noop = noop,
) {
	if (lines == null || lines.length === 0) return '';

	let out = NEWLINE + INDENT + title;
	for (let i = 0; i < lines.length; i++) {
		out += NEWLINE + INDENT + INDENT + fn(lines[i]);
	}

	return out + NEWLINE;
}
