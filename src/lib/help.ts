import { Tree, TreeEntry } from '@/types';
import { ALL, DEF, NEWLINE, INDENT, GAP } from '@/constants';
import { printSection } from '@/lib/print-section';

////////////////////////////////////////////////////////////////////////////////

export function help(bin: string, tree: Tree, key: string, single: boolean) {
	let out = '';
	let cmd = tree[key] as TreeEntry;
	let pfx = `$ ${bin}`;
	let all = tree[ALL] as TreeEntry;

	const prefix = (s: string) => `${pfx} ${s}`.replace(/\s+/g, ' ');

	// NOTE(joel): Update ALL & CMD options.
	const tail = [['-h, --help', 'Displays this help message']];
	if (key === DEF) tail.unshift(['-v, --version', 'Displays current version']);

	cmd.options = (cmd.options || []).concat(all.options, tail);

	// NOTE(joel): Add options placeholder.
	if (cmd.options.length > 0) cmd.usage += ' [options]';

	out += printSection('Description', cmd.describe);
	out += printSection('Usage', [cmd.usage!], prefix);

	if (!single && key === DEF) {
		const rgx = /^__/;
		let help = '';
		const cmds: string[][] = [];
		// NOTE(joel): Print all non-alias and -internal commands plus their first
		// line of helptext.
		for (let key in tree) {
			if (typeof tree[key] === 'string' || rgx.test(key)) continue;

			cmds.push([key, ((tree[key] as TreeEntry).describe || [''])[0]]);
			if (cmds.length < 3) {
				help += NEWLINE + INDENT + INDENT + `${pfx} ${key} --help`;
			}
		}

		out += printSection('Available Commands', format(cmds));
		out +=
			NEWLINE +
			INDENT +
			'For more info, run any command with the `--help` flag' +
			help +
			NEWLINE;
	} else if (!single && key !== DEF) {
		// NOTE(joel): Print its aliases if any.
		out += printSection('Aliases', cmd.alibi!, prefix);
	}

	out += printSection('Options', format(cmd.options));
	out += printSection('Examples', cmd.examples!.map(prefix));

	return out;
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Format a given set of `cmd` or `options` lines and align their columns.
 */
function format(arr: string[][]) {
	if (!arr.length) return [''];
	const len = findLongestStr(arr.map(x => x[0])) + GAP;
	return arr.map(
		(a: string[]) =>
			a[0] +
			' '.repeat(len - a[0].length) +
			a[1] +
			(a[2] == null ? '' : INDENT + `(default ${a[2]})`),
	);
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Find the longes string in an array of strings.
 */
function findLongestStr(arr: string[]) {
	if (arr.length !== 0) {
		let idx = 0;
		let longestStr = 0;
		for (let i = arr.length - 1; i >= 0; i--) {
			const strLength = arr[i].length;
			if (strLength > longestStr) {
				idx = i;
				longestStr = strLength;
			}
		}
		return arr[idx].length;
	}

	return arr[0].length;
}
