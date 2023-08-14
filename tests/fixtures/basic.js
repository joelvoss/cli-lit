#!/usr/bin/env ts-node
import { cli } from '../../dist/cli-lit.module.js';

cli('bin')
	.command('foo')
	.alias('f', 'fo')
	.action(() => {
		console.log('~> ran "foo" action');
	})
	.parse(process.argv);
