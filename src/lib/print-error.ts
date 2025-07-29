import { INDENT, NEWLINE } from '../constants';
import { printSection } from './print-section';

/**
 * Print an error message and exit the process.
 */
export function printError(bin: string, str: string, num: number = 1) {
	let out = printSection('ERROR', [str]);
	out += `${NEWLINE + INDENT}Run \`$ ${bin} --help\` for more info.${NEWLINE}`;
	console.error(out);
	process.exit(num);
}
