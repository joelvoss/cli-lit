#!/usr/bin/env node
import { cli } from '../../dist/cli-lit.module.js';

cli('bin')
	.option('--bool', 'flag defined')
	.option('-g, --global', 'global flag')

	.command('foo', '', { alias: 'f' })
	.option('-l, --local', 'command flag')
	.action(opts => {
		console.log(`~> ran "foo" with ${JSON.stringify(opts)}`);
	})

	.parse(process.argv, {
		unknown: () => false
	});
