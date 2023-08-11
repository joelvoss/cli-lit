import { toArr } from '../../src/lib/to-arr';

describe('toArr', () => {
	it(`should return an empty array of input is null`, () => {
		expect(toArr(null)).toEqual([]);
		expect(toArr(undefined)).toEqual([]);
	});

	it(`should always return an array`, () => {
		expect(toArr(0)).toEqual([0]);
		expect(toArr('0')).toEqual(['0']);
		expect(toArr({})).toEqual([{}]);
	});

	it(`should return the input value if it is already an array`, () => {
		expect(toArr([0])).toEqual([0]);
		expect(toArr(['0'])).toEqual(['0']);
		expect(toArr([{}])).toEqual([{}]);
		expect(toArr([])).toEqual([]);
	});
	
	it(`should not mutate the input array`, () => {
		const input = ['1'];
		const arr1 = toArr(input);
		expect(input === arr1).toBe(false);
	});
});
