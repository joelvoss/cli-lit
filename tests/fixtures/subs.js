#!/usr/bin/env node
import { cli } from '../../dist/cli-lit.module.js';

cli('bin')
	.command('remote', '', { alias: 'r' })
	.action(_opts => {
		console.log('~> ran "remote" action');
	})

	.command('remote add <name> <url>', '', { alias: ['ra', 'remote new'] })
	.action((name, uri, _opts) => {
		console.log(`~> ran "remote add" with "${name}" and "${uri}" args`);
	})

	.command('remote rename <old> <new>', '', { alias: 'rr' })
	.action((old, nxt, _opts) => {
		console.log(`~> ran "remote rename" with "${old}" and "${nxt}" args`);
	})

	.parse(process.argv);
