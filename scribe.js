#!/usr/bin/env node
'use strict';

const program = require('commander');

program
.version('0.0.1')
.command('login','get access token').alias('l')
.command('search <query>', 'searches with argument as filter').alias('s')
.command('stories <count>','returns a list of public stories')
.parse(process.argv);

