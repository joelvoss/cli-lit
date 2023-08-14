export type ArgvParserOptions = {
	alias?: Record<string, string | string[]>;
	default?: Record<string, any>;
	[key: string]: any;
};

export type ArgvParserOutput = {
	_: Array<string>;
	[key: string]: any;
};

export type TreeEntry = {
	usage: string;
	alibi: string[];
	options: string[][];
	alias: Record<string, string[]>;
	default: Record<string, boolean | undefined | null>;
	examples: string[];
	describe?: string[];
	handler?: Function;
};
export type Tree = Record<string, TreeEntry | string>;

export type CommandOptions = {
	default?: boolean;
	alias?: string | string[];
};

export type ParseOptions = {
	alias?: Record<string, string[]>;
	default?: Record<string, boolean | undefined | null>;
	lazy?: boolean;
};
