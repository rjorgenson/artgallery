const db = require('../../db');

const _get = require('lodash/get');
const config = require('config');
const csv = require('csv-parser');
const fs = require('fs');
const iconv = require('iconv-lite');
const path = require('path');
const normalize = require('./normalize');

async function updateDatabase() {
    const database = await db.get();
    const records = await readCatalog();

    return database.parallelize(() => {
        for (const record of records) {
            insertDatabaseRecord(record, database);
        }
    });
}

function readCatalog() {
    const catalogFile = path.join(config.get('catalogDirectory'), '/web-gallery-of-art/catalog.csv');

    return new Promise((resolve, reject) => {
        const records = [];
        fs.createReadStream(catalogFile)
            .pipe(iconv.decodeStream('ISO-8859-1'))
            .pipe(csv())
            .on('data', catalogRecord => {
                const url = convertToImageUrl(_get(catalogRecord, 'URL', ''));
                const record = {
                    $url: url,
                    $catalog: 'Web Gallery of Art',
                    $license: 'unknown',
                    $artist: normalize.artist(_get(catalogRecord, 'AUTHOR', 'Unknown artist')),
                    $title: normalize.title(_get(catalogRecord, 'TITLE', 'Unknown title')),
                    $date: normalize.date(_get(catalogRecord, 'DATE', 'Unknown date')),
                    $technique: normalize.technique(_get(catalogRecord, 'TECHNIQUE', 'Unknown technique')),
                    $location: _get(catalogRecord, 'LOCATION', 'Unknown location'),
                    $form: _get(catalogRecord, 'FORM', 'Unknown form'),
                    $type: _get(catalogRecord, 'TYPE', 'Unknown type'),
                    $school: _get(catalogRecord, 'SCHOOL', 'Unknown school'),
                    $timeframe: _get(catalogRecord, 'TIMEFRAME', 'Unknown timeframe')
                };
                records.push(record);
            })
            .on('error', reject)
            .on('end', () => {
                resolve(records);
            });
    });
}

function insertDatabaseRecord(record, database) {
    const sql = `INSERT INTO art (url, catalog, license, artist, title, date, technique, location, form, type, school,timeframe) VALUES ($url, $catalog, $license, $artist, $title, $date, $technique, $location, $form, $type, $school,$timeframe)`;
    database.run(sql, record, error => {
        if (error) {
            console.error(error);
        }
    })
}

function convertToImageUrl(htmlUrl) {
    return htmlUrl.replace(/\/html\//, '/art/').replace(/\.html$/, '.jpg');
}

module.exports = {
    updateDatabase,
};