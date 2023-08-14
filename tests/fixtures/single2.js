#!/usr/bin/env node
import { cli } from '../../dist/cli-lit.module.js';

cli('bin', true)
	.describe('hello description')
	.option('-g, --global', 'flag 1')
	.action(opts => {
		console.log(`~> ran "single" with: ${JSON.stringify(opts)}`);
	})
	.parse(process.argv);
