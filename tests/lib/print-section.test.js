import { printSection } from '../../src/lib/print-section';

describe('printSection', () => {
	const title = 'Description';
	const lines = ['Line no. 1', 'Line no. 2'];
	const prefix = s => `prefix: ${s}`;

	it(`should print a section string`, () => {
		const res = printSection(title, lines);
		expect(res).toEqual(`\n  Description\n    Line no. 1\n    Line no. 2\n`);
	});

	it(`should print a section string + prefix`, () => {
		const res = printSection(title, lines, prefix);
		expect(res).toEqual(
			`\n  Description\n    prefix: Line no. 1\n    prefix: Line no. 2\n`,
		);
	});
});
