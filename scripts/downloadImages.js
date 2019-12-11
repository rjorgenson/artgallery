#!/usr/bin/env node

// Example usage: ./updateImages --max=10 --delayMs=1000

const argv = require('yargs').argv;
const images = require('../src/images');

async function downloadImages() {
    if (argv.max > 0 && argv.delayMs > 0) {
        await images.download(argv.max, argv.delayMs);
    } else if (argv.max > 0) {
        await images.download(argv.max);
    } else if (argv.delayMs > 0) {
        await images.download(100, argv.delayMs);
    } else {
        await images.download();
    }
}

downloadImages().catch(e => console.error(e));