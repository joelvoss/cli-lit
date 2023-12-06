import { cli } from '../src/index';

describe('cli', () => {
	test('export', () => {
		expect(typeof cli).toBe('function');
	});

	test('general shape', () => {
		const ctx = cli('test');

		expect(ctx.constructor && ctx.constructor.name === 'Cli').toBe(true);
		expect(ctx.bin).toBe('test');
		expect(ctx.ver).toBe('0.0.0');
		expect(ctx.curr).toBe('');
		expect(ctx.default).toBe('');
		expect(typeof ctx.tree).toBe('object');

		expect(Object.keys(ctx.tree)).toEqual(['__all__', '__default__']);

		for (let k in ctx.tree) {
			expect(typeof ctx.tree[k].usage).toBe('string');
			expect(Array.isArray(ctx.tree[k].options)).toBe(true);
			expect(Array.isArray(ctx.tree[k].examples)).toBe(true);
			expect(typeof ctx.tree[k].default).toBe('object');
			expect(typeof ctx.tree[k].alias).toBe('object');
		}
	});

	test('version (global)', () => {
		const ctx = cli('test').version('1.0.0');
		expect(ctx.ver).toBe('1.0.0');
	});

	test('option (global)', () => {
		const ctx = cli('test');
		expect(ctx.tree.__all__.options.length).toBe(0);

		ctx.option('--foo, -f', 'bar', 'baz.js');
		const arr = ctx.tree.__all__.options;
		expect(arr.length).toBe(1);

		expect(Array.isArray(arr[0])).toBe(true);
		expect(arr).toEqual([['-f, --foo', 'bar', 'baz.js']]);
	});

	test('option (hypenated)', () => {
		const ctx = cli('test');
		ctx.option('--foo-bar, -f');
		ctx.option('--foo-bar-baz');

		expect(ctx.tree.__all__.options).toEqual([
			['-f, --foo-bar', ''],
			['--foo-bar-baz', ''],
		]);
	});

	test('describe (global)', () => {
		const ctx = cli('test').describe('First sentence. Second sentence.');
		const arr = ctx.tree.__default__.describe;
		expect(Array.isArray(arr)).toBe(true);
		expect(arr.length).toBe(2);
		expect(arr).toEqual(['First sentence.', 'Second sentence.']);
	});

	test('example (global)', () => {
		const ctx = cli('test').example('hello --local');
		const arr = ctx.tree.__default__.examples;

		expect(Array.isArray(arr)).toBe(true);
		expect(arr.length).toBe(1);
		expect(arr).toEqual(['hello --local']);
	});

	test('command', () => {
		const ctx = cli('test').command('foo');
		expect('foo' in ctx.tree).toBe(true);
		const fooCmd = ctx.tree['foo'];

		expect(typeof fooCmd.usage).toBe('string');
		expect(Array.isArray(fooCmd.options)).toBe(true);
		expect(Array.isArray(fooCmd.examples)).toBe(true);
		expect(typeof fooCmd.default).toBe('object');
		expect(typeof fooCmd.alias).toBe('object');

		expect(fooCmd.usage).toBe('foo');

		// Options
		expect(fooCmd.options.length).toBe(0);
		ctx.option('-f, --force', 'force');
		expect(fooCmd.options.length).toBe(1);
		expect(fooCmd.alias).toEqual({ f: ['force'] });

		// Examples
		expect(fooCmd.examples.length).toBe(0);
		ctx.example('foo --force');
		expect(fooCmd.examples.length).toBe(1);
		expect(fooCmd.examples).toEqual(['foo --force']);

		// Description
		expect(fooCmd.describe == null).toBe(true);
		ctx.describe('hello world');
		expect(Array.isArray(fooCmd.describe)).toBe(true);
		expect(fooCmd.describe).toEqual(['hello world']);

		// Add new Command
		ctx.command('bar');
		expect('bar' in ctx.tree).toBe(true);
		const barCmd = ctx.tree.bar;

		expect(typeof barCmd.usage).toBe('string');
		expect(Array.isArray(barCmd.options)).toBe(true);
		expect(Array.isArray(barCmd.examples)).toBe(true);
		expect(typeof barCmd.default).toBe('object');
		expect(typeof barCmd.alias).toBe('object');

		expect(barCmd.usage).toBe('bar');

		// Show that command state changed
		ctx.describe('this is bar');
		expect(barCmd.describe).toEqual(['this is bar']);
		expect(fooCmd.describe).toEqual(['hello world']);

		// Add third, with description & change default
		ctx.command('baz <qux>', 'BazQux', { default: true });
		expect('baz' in ctx.tree).toBe(true);
		const bazCmd = ctx.tree.baz;

		expect(typeof bazCmd.usage).toBe('string');
		expect(Array.isArray(bazCmd.options)).toBe(true);
		expect(Array.isArray(bazCmd.examples)).toBe(true);
		expect(typeof bazCmd.default).toBe('object');
		expect(typeof bazCmd.alias).toBe('object');

		expect(bazCmd.usage).toBe('baz <qux>');

		// Add Example
		ctx.example('baz 22');
		expect(bazCmd.examples).toEqual(['baz 22']);

		expect(fooCmd.examples).toEqual(['foo --force']);
		expect(barCmd.examples).toEqual([]);

		expect(ctx.default).toBe('baz');
	});

	test('action', () => {
		expect.assertions(13);
		const a = 'Bob';
		let b, c, d, e;

		const prog = cli('foo')
			.command('greet <name>')
			.option('--loud', 'Be loud?')
			.option('--with-kiss, -k', 'Super friendly?')
			.action((name, opts) => {
				expect(name).toBe(a);
				b && expect(opts.loud).toBe(true);
				c && expect(opts['with-kiss']).toBe(true);
				d && expect(opts['with-kiss']).toBe('cheek');
				e && expect(opts['with-kiss']).toBe(false);
				b = c = d = e = false;
			});

		const run = args => prog.parse(['', '', 'greet', a].concat(args || []));

		const cmd = prog.tree.greet;
		expect('handler' in cmd).toBe(true);
		expect(typeof cmd.handler).toBe('function');

		run(); // +1 test
		(b = true) && run('--loud'); // +2 tests
		(c = true) && run('--with-kiss'); // +2 tests
		(d = true) && run('--with-kiss=cheek'); // +2 tests
		(d = true) && run(['--with-kiss', 'cheek']); // +2 tests
		(e = true) && run('--no-with-kiss'); // +2 tests
	});

	test('action (multi requires)', () => {
		expect.assertions(7);

		const a = 'aaa';
		const b = 'bbb';
		let c = false;

		const prog = cli('foo')
			.command('build <src> <dest>')
			.option('-f, --force', 'Force foo overwrite')
			.action((src, dest, opts) => {
				expect(src).toBe(a);
				expect(dest).toBe(b);
				c && expect('force' in opts && opts.force).toBe(true);
				c && expect('f' in opts && opts.f).toBe(true);
			});

		expect(prog.tree.build.usage).toBe('build <src> <dest>');

		const run = _ => prog.parse(['', '', 'build', a, b, c && '-f']);

		run(); // +2 tests
		(c = true) && run(); // +4 tests
	});

	test('action (multi optional)', () => {
		expect.assertions(7);

		const a = 'aaa';
		const b = 'bbb';
		let c = false;

		const prog = cli('foo')
			.command('build [src] [dest]')
			.option('-f, --force', 'Force foo overwrite')
			.action((src, dest, opts) => {
				expect(src).toBe(a);
				expect(dest).toBe(b);
				c && expect('force' in opts && opts.force).toBe(true);
				c && expect('f' in opts && opts.f).toBe(true);
			});

		expect(prog.tree.build.usage).toBe('build [src] [dest]');

		const run = _ => prog.parse(['', '', 'build', a, b, c && '-f']);

		run(); // +2 tests
		(c = true) && run(); // +4 tests
	});

	test('parse (safe + default)', () => {
		const prog = cli('test').command('build', '', { default: true });

		const argv1 = ['', '', 'build'];
		const res1 = prog.parse(argv1, { lazy: true });
		expect(argv1).toEqual(['', '', 'build']);
		expect(res1.args).toEqual([{ _: [] }]);

		let argv2 = ['', ''];
		let res2 = prog.parse(argv2, { lazy: true });
		expect(argv2).toEqual(['', '']);
		expect(res2.args).toEqual([{ _: [] }]);
	});

	test('parse (safe + alias)', () => {
		const prog = cli('test').command('build').alias('b');

		const argv1 = ['', '', 'build'];
		const res1 = prog.parse(argv1, { lazy: true });
		expect(argv1).toEqual(['', '', 'build']);
		expect(res1.args).toEqual([{ _: [] }]);

		let argv2 = ['', '', 'b'];
		let res2 = prog.parse(argv2, { lazy: true });
		expect(argv2).toEqual(['', '', 'b']);
		expect(res2.args).toEqual([{ _: [] }]);
	});

	test('parse (safe + default + flags)', () => {
		const prog = cli('test').command('build <dir>', '', { default: true });

		const argv1 = ['', '', '-r', 'dotenv', 'build', 'public', '--fresh'];
		const res1 = prog.parse(argv1, { lazy: true });
		expect(argv1).toEqual([
			'',
			'',
			'-r',
			'dotenv',
			'build',
			'public',
			'--fresh',
		]);
		expect(res1.args).toEqual(['public', { _: [], r: 'dotenv', fresh: true }]);

		let argv2 = ['', '', '-r', 'dotenv', 'public', '--fresh'];
		let res2 = prog.parse(argv2, { lazy: true });
		expect(argv2).toEqual(['', '', '-r', 'dotenv', 'public', '--fresh']);
		expect(res2.args).toEqual(['public', { _: [], r: 'dotenv', fresh: true }]);
	});

	test('parse (safe + alias + flags)', () => {
		const prog = cli('test').command('build <dir>').alias('b');

		const argv1 = ['', '', '-r', 'dotenv', 'build', 'public', '--fresh'];
		const res1 = prog.parse(argv1, { lazy: true });
		expect(argv1).toEqual([
			'',
			'',
			'-r',
			'dotenv',
			'build',
			'public',
			'--fresh',
		]);
		expect(res1.args).toEqual(['public', { _: [], r: 'dotenv', fresh: true }]);

		let argv2 = ['', '', '-r', 'dotenv', 'b', 'public', '--fresh'];
		let res2 = prog.parse(argv2, { lazy: true });
		expect(argv2).toEqual(['', '', '-r', 'dotenv', 'b', 'public', '--fresh']);
		expect(res2.args).toEqual(['public', { _: [], r: 'dotenv', fresh: true }]);
	});

	test('parse (lazy)', () => {
		expect.assertions(14);

		const val = 'aaa';
		let f = false;

		const prog = cli('test')
			.command('build <src>')
			.option('--force')
			.action((src, opts) => {
				expect(src).toBe(val);
				f && expect(opts.force).toBe(true);
			});

		const run = _ =>
			prog.parse(['', '', 'build', val, f && '--force'], { lazy: true });

		const res1 = run();

		expect(res1.constructor).toBe(Object);
		expect(Object.keys(res1)).toEqual(['args', 'name', 'handler']);

		expect(Array.isArray(res1.args)).toBe(true);
		expect(res1.args[0]).toBe(val);
		expect(res1.args[1].constructor).toBe(Object);
		expect(Array.isArray(res1.args[1]._)).toBe(true);
		expect(typeof res1.handler).toBe('function');
		expect(res1.name).toBe('build');

		res1.handler.apply(null, res1.args); //+1 test

		f = true;
		const res2 = run();
		expect(res2.constructor).toBe(Object);
		expect(res2.args[1].constructor).toBe(Object);
		expect(res2.args[1].force).toBe(true);

		res2.handler.apply(null, res2.args); // +2 tests
	});

	test('parse (lazy + single)', () => {
		expect.assertions(14);

		const val = 'aaa';
		let f = false;

		const prog = cli('test <src>')
			.option('--force')
			.action((src, opts) => {
				expect(src).toBe(val);
				f && expect(opts.force).toBe(true);
			});

		const run = _ => prog.parse(['', '', val, f && '--force'], { lazy: true });

		const res1 = run();
		expect(res1.constructor).toBe(Object);
		expect(Object.keys(res1)).toEqual(['args', 'name', 'handler']);

		expect(Array.isArray(res1.args)).toBe(true);
		expect(res1.args[0]).toBe(val);
		expect(res1.args[1].constructor).toBe(Object);
		expect(Array.isArray(res1.args[1]._)).toBe(true);
		expect(typeof res1.handler).toBe('function');
		expect(res1.name).toBe('');

		res1.handler.apply(null, res1.args); // +1 test

		const res2 = run((f = true));
		expect(res2.constructor).toBe(Object);
		expect(res2.args[1].constructor).toBe(Object);
		expect(res2.args[1].force).toBe(true);

		res2.handler.apply(null, res2.args); // +2 tests
	});
});
