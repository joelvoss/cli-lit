export type ArgvParserOptions = {
	alias?: Record<string, string | string[]>;
	default?: Record<string, unknown>;
	[key: string]: unknown;
};

export type ArgvParserOutput = {
	_: string[];
	[key: string]: unknown;
};

export type TreeEntry = {
	usage: string;
	alibi: string[];
	options: string[][];
	alias: Record<string, string[]>;
	default: Record<string, string | boolean | null>;
	examples: string[];
	describe: string[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	handler?: (...args: any[]) => void;
};
export type Tree = Record<string, TreeEntry>;

export type CommandOptions = {
	default?: boolean;
	alias?: string | string[];
};

export type ParseOptions = {
	alias?: Record<string, string[]>;
	default?: Record<string, boolean | undefined | null>;
	lazy?: boolean;
};
