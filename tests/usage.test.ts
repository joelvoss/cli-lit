import { beforeEach, describe, expect, test, vi } from 'vitest';

import { cli } from '../src/index';

const noop = vi.fn() as unknown as () => never;

describe('usage tests', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.resetAllMocks();
	});

	test('basic', () => {
		const fn = vi.fn() as unknown as () => never;

		const prog = cli('bin').command('foo').alias('f', 'fo').action(fn);

		prog.parse(['', '', 'foo'], {});
		expect(fn).toBeCalledTimes(1);
		expect(fn).toHaveBeenLastCalledWith({ _: [] });

		prog.parse(['', '', 'f']);
		expect(fn).toBeCalledTimes(2);
		expect(fn).toHaveBeenLastCalledWith({ _: [] });

		prog.parse(['', '', 'fo']);
		expect(fn).toBeCalledTimes(3);
		expect(fn).toHaveBeenLastCalledWith({ _: [] });
	});

	test('basic (missing command)', () => {
		const mockExit = vi.spyOn(process, 'exit').mockImplementation(noop);
		console.error = vi.fn();
		const fn = vi.fn();

		const prog = cli('bin').command('foo').alias('f', 'fo').action(fn);

		prog.parse(['', '']);
		expect(console.error).toHaveBeenCalledWith(
			expect.stringContaining('No command specified'),
		);
		expect(mockExit).toHaveBeenCalledTimes(1);
	});

	test('basic (invalid command)', () => {
		const mockExit = vi.spyOn(process, 'exit').mockImplementation(noop);
		console.error = vi.fn();
		const fn = vi.fn();

		const prog = cli('bin').command('foo').alias('f', 'fo').action(fn);

		prog.parse(['', '', 'fu']);
		expect(console.error).toHaveBeenCalledWith(
			expect.stringContaining('Invalid command: fu'),
		);
		expect(mockExit).toHaveBeenCalledTimes(1);
	});

	test('basic (duplicate command)', () => {
		const mockExit = vi.spyOn(process, 'exit').mockImplementation(noop);
		const fn = vi.fn();

		try {
			const prog = cli('bin')
				.command('foo', 'original')
				.command('foo', 'duplicate')
				.action(fn);

			prog.parse(['', '', 'foo']);
		} catch (err) {
			expect(err.message).toBe('Command already exists: foo');
			// Process throws
			expect(mockExit).toHaveBeenCalledTimes(0);
		}
	});

	test('basic (help)', () => {
		console.log = vi.fn();
		const fn = vi.fn();

		const prog = cli('bin').command('foo').alias('f', 'fo').action(fn);

		prog.parse(['', '', '-h']);
		expect(console.log).toHaveBeenLastCalledWith(
			expect.stringContaining('Available Commands\n    foo'),
		);

		prog.parse(['', '', 'foo', '-h']);
		expect(console.log).toHaveBeenLastCalledWith(
			expect.stringContaining('Usage\n    $ bin foo [options]'),
		);
	});
});
