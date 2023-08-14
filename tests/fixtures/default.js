#!/usr/bin/env node
import { cli } from '../../dist/cli-lit.module.js';

cli('bin')
	.command('foo [dir]', null, { alias: 'f', default:true })
	.action(dir => console.log(`~> ran "foo" action w/ "${dir || '~EMPTY~'}" arg`))

	.command('bar')
	.alias('b')
	.action(() => console.log('~> ran "bar" action'))

	.parse(process.argv);
