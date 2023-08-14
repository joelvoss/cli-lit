import { toArr } from '@/lib/to-arr';
import { ArgvParserOptions, ArgvParserOutput } from '@/types';

////////////////////////////////////////////////////////////////////////////////

export function argvParser(
	_args: typeof process.argv,
	_opts?: ArgvParserOptions,
) {
	const args = _args || [];
	const opts: ArgvParserOptions = _opts || {};

	const hasAliases = opts.alias != null;
	const hasDefaults = opts.default != null;

	const out: ArgvParserOutput = { _: [] };
	const alias: Record<string, string[]> = {};

	// NOTE(joel): Expand aliases for every permutation.
	if (hasAliases) {
		for (let k in opts.alias) {
			alias[k] = toArr(opts.alias[k]);
			const arr = alias[k];
			for (let i = 0; i < arr.length; i++) {
				alias[arr[i]] = arr.concat(k);
				alias[arr[i]].splice(i, 1);
			}
		}
	}

	if (hasDefaults) {
		for (let k in opts.default) {
			alias[k] = alias[k] || [];
		}
	}

	for (let i = 0, len = args.length; i < len; i++) {
		const arg = args[i];

		// NOTE(joel): Everything after `--` is a positional argument and not
		// a flag.
		if (arg === '--') {
			const posArgs = args.slice(++i);
			out._ = out._.concat(posArgs);
			break;
		}

		let j: number;

		// NOTE(joel): Skip `-` (code: 45)
		for (j = 0; j < arg.length; j++) {
			if (arg.charCodeAt(j) !== 45) break;
		}

		if (j === 0) {
			// NOTE(joel): `arg` did not start with `-`.
			out._.push(arg);
		} else if (arg.substring(j, j + 3) === 'no-') {
			// NOTE(joel): `arg` starts with 'no-`.
			const name = arg.substring(j + 3);
			out[name] = false;
		} else {
			let splitIdx: number;

			// NOTE(joel): Find index of `=` (code: 61) within `arg` to know where
			// to split `arg` into `name` and `value`.
			for (splitIdx = j + 1; splitIdx < arg.length; splitIdx++) {
				if (arg.charCodeAt(splitIdx) === 61) break;
			}

			const name = arg.substring(j, splitIdx);
			const val =
				arg.substring(++splitIdx) ||
				i + 1 === len ||
				('' + args[i + 1]).charCodeAt(0) === 45 ||
				args[++i];

			const arr = j === 2 ? [name] : name;

			for (let i = 0; i < arr.length; i++) {
				const name = arr[i];

				let x;
				let nxt;
				const possiblenxtVal = i + 1 < arr.length || val;

				if (typeof possiblenxtVal === 'boolean') {
					nxt = possiblenxtVal;
				} else if (((x = +possiblenxtVal), x * 0 === 0)) {
					nxt = x;
				} else {
					nxt = possiblenxtVal;
				}

				if (out[name] == null) {
					out[name] = nxt;
				} else if (Array.isArray(out[name])) {
					out[name] = out[name].concat(nxt);
				} else {
					out[name] = [out[name], nxt];
				}
			}
		}
	}

	// NOTE(joel): Overwrite empty flags with their respective default values.
	if (hasDefaults) {
		for (let k in opts.default) {
			if (out[k] == null) {
				out[k] = opts.default[k];
			}
		}
	}

	if (hasAliases) {
		for (let k in out) {
			const arr = alias[k] || [];
			while (arr.length > 0) {
				out[arr.shift()!] = out[k];
			}
		}
	}

	return out;
}
