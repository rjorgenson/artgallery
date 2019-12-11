#!/usr/bin/env node

const catalog = require('../src/catalog');

catalog.updateDatabase().catch(e => console.error(e));