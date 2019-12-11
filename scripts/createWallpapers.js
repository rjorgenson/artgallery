#!/usr/bin/env node

const argv = require('yargs').argv;
const wallpapers = require('../src/wallpapers');

if (argv.max > 0) {
    wallpapers.create(argv.max).catch(e => console.error(e));
} else {
    wallpapers.create().catch(e => console.error(e));
}
