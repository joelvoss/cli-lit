import { mri } from '../src/lib/mri';

describe('mri', () => {
	test(`basic args`, () => {
		const res1 = mri(['--no-moo']);
		const res2 = mri(['-v', 'a', '-v', 'b', '-v', 'c']);
		expect(res1).toEqual({ moo: false, _: [] });
		expect(res2).toEqual({ v: ['a', 'b', 'c'], _: [] });
	});

	test(`comprehensive args`, () => {
		const res3 = mri([
			'--name=meowmers',
			'bare',
			'-cats',
			'woo',
			'-h',
			'awesome',
			'--multi=quux',
			'--key',
			'value',
			'-b',
			'--bool',
			'--no-meep',
			'--multi=baz',
			'--number=-123',
			'--zeronum=0',
			'--doublenum=01',
			'--',
			'--not-a-flag',
			'eek',
		]);
		expect(res3).toEqual({
			c: true,
			a: true,
			t: true,
			s: 'woo',
			h: 'awesome',
			b: true,
			bool: true,
			key: 'value',
			multi: ['quux', 'baz'],
			meep: false,
			name: 'meowmers',
			number: -123,
			zeronum: 0,
			doublenum: 1,
			_: ['bare', '--not-a-flag', 'eek'],
		});
	});

	test('flag + default', () => {
		const res = mri(['--foo'], {
			default: { bar: true },
		});
		expect(res).toEqual({ foo: true, bar: true, _: [] });
		expect(typeof res.foo).toBe('boolean');
		expect(typeof res.bar).toBe('boolean');
	});

	test('flag + default and alias', () => {
		const res = mri(['--foo'], {
			default: { bar: true },
			alias: { bar: 'b' },
		});
		expect(res).toEqual({ foo: true, bar: true, b: true, _: [] });
		expect(typeof res.foo).toBe('boolean');
		expect(typeof res.bar).toBe('boolean');
		expect(typeof res.b).toBe('boolean');
	});

	test('flag + default w/ alias', () => {
		const res1 = mri(['--arg', '01'], {
			alias: { a: ['arg'] },
			default: { arg: '' },
		});
		const res2 = mri(['-a', '01'], {
			alias: { a: ['arg'] },
			default: { arg: '' },
		});

		expect(res1).toEqual({ _: [], arg: 1, a: 1 });
		expect(res2).toEqual({ _: [], arg: 1, a: 1 });

		// ---

		const res3 = mri(['-a', '01'], {
			alias: { arg: ['a'] },
			default: { a: '' },
		});
		const res4 = mri(['--arg', '01'], {
			alias: { arg: ['a'] },
			default: { a: '' },
		});

		expect(res3).toEqual({ _: [], arg: 1, a: 1 });
		expect(res4).toEqual({ _: [], arg: 1, a: 1 });

		// ---

		const res5 = mri(['-a', '01'], {
			alias: { arg: ['a'] },
			default: { arg: '' },
		});

		expect(res5).toEqual({ _: [], arg: 1, a: 1 });
	});

	test('alias', () => {
		const res = mri(['-f', '11', '--zoom', '55'], {
			alias: { z: 'zoom' },
		});
		expect(res.zoom).toEqual(55);
		expect(res.z).toEqual(res.zoom);
		expect(res.f).toEqual(11);
	});

	test('multiple aliases', () => {
		const res = mri(['-f', '11', '--zoom', '55'], {
			alias: { z: ['zm', 'zoom'] },
		});
		expect(res.zoom).toEqual(55);
		expect(res.z).toEqual(res.zoom);
		expect(res.z).toEqual(res.zm);
		expect(res.f).toEqual(11);
	});

	test('flag + default null value', () => {
		const res = mri(['--foo'], { default: { bar: null } });
		expect(res).toEqual({ foo: true, bar: null, _: [] });
	});

	test('flag + default boolean value', () => {
		const res1 = mri(['-t'], { default: { t: true } });
		expect(res1).toEqual({ t: true, _: [] });
		expect(typeof res1.t).toEqual('boolean');

		const res2 = mri(['-t'], { default: { t: false } });
		expect(res2).toEqual({ t: true, _: [] });
		expect(typeof res2.t).toEqual('boolean');

		const res3 = mri(['--no-two'], { default: { two: true } });
		expect(res3).toEqual({ two: false, _: [] });
		expect(typeof res3.two).toEqual('boolean');
	});

	test('flag + default boolean value & alias', () => {
		const alias = { t: ['tt'], two: ['toot'] };

		const res1 = mri(['-t'], { alias, default: { t: true } });
		expect(res1).toEqual({ t: true, tt: true, _: [] });
		expect(typeof res1.t).toEqual('boolean');

		const res2 = mri(['-t'], { alias, default: { t: false } });
		expect(res2).toEqual({ t: true, tt: true, _: [] });
		expect(typeof res2.t).toEqual('boolean');

		const res3 = mri(['--no-two'], { alias, default: { two: true } });
		expect(res3).toEqual({ two: false, toot: false, _: [] });
		expect(typeof res3.two).toEqual('boolean');
	});

	test('flag + default boolean value & string & alias', () => {
		const res1 = mri(['-t'], { default: { t: 'hi' } });
		expect(res1).toEqual({ t: true, _: [] });
		expect(typeof res1.t).toEqual('boolean');

		const res2 = mri(['-t'], { alias: { t: 'tt' }, default: { t: 'boo' } });
		expect(res2).toEqual({ t: true, tt: true, _: [] });
		expect(typeof res2.t).toEqual('boolean');

		// --no-* overrides
		const res3 = mri(['--no-two'], { default: { two: 'hi' } });
		expect(res3).toEqual({ two: false, _: [] });
		expect(typeof res3.two).toEqual('boolean');
	});
});
