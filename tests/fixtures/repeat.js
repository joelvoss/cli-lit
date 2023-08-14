#!/usr/bin/env node
import { cli } from '../../dist/cli-lit.module.js';

cli('bin')
	.command('foo', 'original')
	.command('foo', 'duplicate')
	.action(() => {
		console.log('~> ran "foo" action');
	})
	.parse(process.argv);
