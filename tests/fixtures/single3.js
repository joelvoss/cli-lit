#!/usr/bin/env node
import { cli } from '../../dist/cli-lit.module.js';

cli('bin', true)
	.command('foo <bar>')
	.action((_bar, opts) => {
		console.log(`~> ran "foo" with: ${JSON.stringify(opts)}`);
	})
	.parse(process.argv);
