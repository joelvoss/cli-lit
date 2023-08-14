import { ALL, DEF } from '@/constants';
import { help } from '@/lib/help';
import { argvParser } from '@/lib/mri';
import { printError } from '@/lib/print-error';

import type { CommandOptions, ParseOptions, Tree, TreeEntry } from '@/types';

////////////////////////////////////////////////////////////////////////////////

class Cli {
	bin: string;
	ver: string;
	default: string;
	tree: Tree;
	single: boolean;
	curr: string;

	constructor(name: string, isOne?: boolean) {
		let [bin, ...rest] = name.split(/\s+/);
		isOne = isOne || rest.length > 0;

		this.bin = bin;
		this.ver = '0.0.0';
		this.default = '';
		this.tree = {};
		// set internal shapes;
		this.command(ALL);
		this.command([DEF].concat(isOne ? rest : '<command>').join(' '));
		this.single = isOne;
		this.curr = ''; // reset
	}

	command(str: string, desc?: string, opts: CommandOptions = {}) {
		if (this.single) {
			throw new Error('Cannot call `command()` in "single" mode');
		}

		// All non-([|<) are commands
		const cmdArr: string[] = [];
		const usage = [];
		const rgx = /(\[|<)/;
		str.split(/\s+/).forEach(x => {
			if (rgx.test(x.charAt(0))) {
				usage.push(x);
			} else {
				cmdArr.push(x);
			}
		});

		const cmdString = cmdArr.join(' ');

		if (cmdString in this.tree) {
			throw new Error(`Command already exists: ${cmdString}`);
		}

		// re-include `cmd` for commands
		cmdString.includes('__') || usage.unshift(cmdString);
		const usageString = usage.join(' ');

		this.curr = cmdString;
		if (opts.default) this.default = cmdString;

		this.tree[cmdString] = {
			usage: usageString,
			alibi: [],
			options: [],
			alias: {},
			default: {},
			examples: [],
		};
		if (opts.alias) this.alias(...opts.alias);
		if (desc) this.describe(desc);

		return this;
	}

	describe(str: string | string[]) {
		const treeEntry = this.tree[this.curr || DEF] as TreeEntry;
		if (Array.isArray(str)) {
			treeEntry.describe = str;
		} else {
			// NOTE(joel): Based on: https://stackoverflow.com/a/18914855/3577474
			treeEntry.describe = (str || '')
				.replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
				.split('|');
		}
		return this;
	}

	alias(...names: string[]) {
		if (this.single) {
			throw new Error('Cannot call `alias()` in "single" mode');
		}

		if (!this.curr) {
			throw new Error('Cannot call `alias()` before defining a command');
		}

		const treeEntry = this.tree[this.curr] as TreeEntry;
		treeEntry.alibi = treeEntry.alibi.concat(...names);
		treeEntry.alibi.forEach((key: string) => (this.tree[key] = this.curr));

		return this;
	}

	option(input: string, desc: string, val: any) {
		const cmd = this.tree[this.curr || ALL] as TreeEntry;

		// NOTE(joel): Strips leading `-|--` and extra space(s).
		let [flag, alias] = (input || '')
			.split(/^-{1,2}|,|\s+-{1,2}|\s+/)
			.filter(Boolean);

		// NOTE(joel): Flip alias so it comes first.
		if (alias != null && alias.length > 1) {
			[flag, alias] = [alias, flag];
		}

		// NOTE(joel): Set alias flags.
		let _str = `--${flag}`;
		if (alias != null && alias.length > 0) {
			_str = `-${alias}, ${_str}`;
			cmd.alias[alias] = (cmd.alias[alias] || []).concat(flag);
		}

		const arr = [_str, desc || ''];

		// NOTE(joel): Set default flag:value pair.
		if (val != null) {
			arr.push(val);
			cmd.default[flag] = val;
		} else if (alias == null) {
			cmd.default[flag] = null;
		}

		cmd.options.push(arr);
		return this;
	}

	action(handler: Function) {
		const treeEntry = this.tree[this.curr || DEF] as TreeEntry;
		treeEntry.handler = handler;
		return this;
	}

	example(str: string) {
		const treeEntry = this.tree[this.curr || DEF] as TreeEntry;
		treeEntry.examples.push(str);
		return this;
	}

	version(str: string) {
		this.ver = str;
		return this;
	}

	parse(_args: typeof process.argv, opts: ParseOptions = {}) {
		// NOTE(joel): Copy `process.argv`.
		const args = _args.slice();

		let offset = 2;
		const alias = { h: 'help', v: 'version' };
		const parsedArgs = argvParser(args.slice(offset), { alias });
		let bin = this.bin;

		let name = '';
		let cmd: TreeEntry | undefined;
		if (this.single) {
			cmd = this.tree[DEF] as TreeEntry;
		} else {
			let tmpCmd;
			// NOTE(joel): Loop thru possible command(s)
			for (let i = 1, l = parsedArgs._.length + 1; i < l; i++) {
				tmpCmd = parsedArgs._.slice(0, i).join('');
				const treeEntry = this.tree[tmpCmd];
				if (typeof treeEntry === 'string') {
					name = treeEntry;
					const nameSplits = name.split(' ');
					args.splice(args.indexOf(parsedArgs._[0]), i, ...nameSplits);
					i += nameSplits.length - i;
				} else if (treeEntry) {
					name = tmpCmd;
				} else if (name) {
					break;
				}
			}

			cmd = this.tree[name] as TreeEntry | undefined;

			if (cmd == null) {
				if (this.default) {
					name = this.default;
					cmd = this.tree[name] as TreeEntry;
					args.unshift(name);
					offset++;
				} else if (tmpCmd) {
					return printError(bin, `Invalid command: ${tmpCmd}`);
				} // NOTE(joel): `cmd` not specified, wait for now...
			}
		}

		// NOTE(joel): Show help if the user relied on `default` for a multi-cmd.
		if (parsedArgs.help) {
			return !this.single && cmd != null ? this.help(name) : this.help();
		}
		if (parsedArgs.version) return this._version();

		if (!this.single && cmd == null) {
			return printError(bin, 'No command specified.');
		}

		const all = this.tree[ALL] as TreeEntry;
		// merge all objects :: params > command > all
		opts.alias = Object.assign(all.alias, cmd!.alias, opts.alias);
		opts.default = Object.assign(all.default, cmd!.default, opts.default);

		const nameSplits = name.split(' ');
		const cmdIdx = args.indexOf(nameSplits[0], 2);
		if (~cmdIdx) args.splice(cmdIdx, nameSplits.length);

		const vals = argvParser(args.slice(offset), opts);
		if (vals == null || typeof vals === 'string') {
			return printError(bin, vals || 'Parsed unknown option flag(s)!');
		}

		const segs = cmd!.usage.split(/\s+/);
		const reqs = segs.filter(x => x.charAt(0) === '<');
		const handlerArgs = vals._.splice(0, reqs.length);

		if (handlerArgs.length < reqs.length) {
			if (name) bin += ` ${name}`; // for help text
			return printError(bin, 'Insufficient arguments!');
		}

		segs
			.filter(x => x.charAt(0) === '[')
			.forEach(_ => {
				// NOTE(joel): Adds `undefined` per [slot] if no more.
				// @ts-expect-error
				handlerArgs.push(vals._.shift());
			});

		// @ts-expect-error
		handlerArgs.push(vals); // flags & co are last
		if (opts.lazy) {
			return { args: handlerArgs, name, handler: cmd?.handler };
		}
		return cmd?.handler?.apply(null, handlerArgs);
	}

	help(str?: string) {
		// eslint-disable-next-line no-console
		console.log(help(this.bin, this.tree, str || DEF, this.single));
	}

	_version() {
		// eslint-disable-next-line no-console
		console.log(`${this.bin}, ${this.ver}`);
	}
}

////////////////////////////////////////////////////////////////////////////////

export function cli(str: string, isOne?: boolean) {
	return new Cli(str, isOne);
}
