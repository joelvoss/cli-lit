#!/usr/bin/env node
import { cli } from '../../dist/cli-lit.module.js';

cli('bin')
	.command('foo <dir>')
	.alias('f')
	.action(dir => {
		console.log(`~> ran "foo" with "${dir}" arg`);
	})
	.command('bar [dir]')
	.alias('b')
	.action(dir => {
		dir = dir || '~default~';
		console.log(`~> ran "bar" with "${dir}" arg`);
	})
	.parse(process.argv);
