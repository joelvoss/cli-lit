import { INDENT, NEWLINE } from '@/constants';
import { printSection } from '@/lib/print-section';

export function printError(bin: string, str: string, num = 1) {
	let out = printSection('ERROR', [str]);
	out += NEWLINE + INDENT + `Run \`$ ${bin} --help\` for more info.` + NEWLINE;
	console.error(out);
	process.exit(num);
}
