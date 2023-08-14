#!/usr/bin/env node
import { cli } from '../../dist/cli-lit.module.js';

cli('bin')
	.alias('foo')
	.command('bar <src>')
	.parse(process.argv);
