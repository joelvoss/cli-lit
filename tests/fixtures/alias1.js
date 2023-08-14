#!/usr/bin/env node
import { cli } from '../../dist/cli-lit.module.js';

cli('bin <type> [dir]')
	.alias('error')
	.parse(process.argv);
