#!/usr/bin/env node
'use strict';

const program = require('commander');

// TODO: refactor stories to mystories or something (only allow to pull user's own stories)
program
.version('0.0.1')
.command('login','get access token').alias('l')
.command('stories','returns a list of public stories').alias('s')
.parse(process.argv);

