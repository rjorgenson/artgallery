#!/usr/bin/env node

const argv = require('yargs').argv;
const wallpaper = require('../src/wallpapers');

if (argv.max > 0) {
    wallpaper.create(argv.max).catch(e => console.error(e));
} else {
    wallpaper.create().catch(e => console.error(e));
}
