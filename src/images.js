const _snakeCase = require('lodash/snakeCase');
const axios = require('axios');
const config = require('config');
const fs = require('fs');
const path = require('path');
const db = require('./db');

const artDirectory = path.join(config.get('artDirectory'));

/**
 * Download the images for a random set of records that need them downloaded.
 *
 * @param max The maximum number to download
 * @param delayMs The time to wait between each download to prevent flooding image servers.
 */
async function download(max = 100, delayMs = 7500) {
    let records = [];

    try {
        records = await getRecordsMissingImages(max);
    } catch (e) {
        console.error(e);
    }

    for (const record of records) {
        try {
            const fileName = await downloadImage(record);
            await saveFileName(fileName, record);
        } catch (e) {
            console.error(e);
        }
        await pause(delayMs);
    }
}

/**
 * Gets a random set database records that don't have a file_name, indicating that the art image has not been downloaded.
 *
 * @param max
 * @returns {Promise<unknown>}
 */
async function getRecordsMissingImages(max) {
    const database = await db.get();
    return new Promise((resolve, reject) => {
        const sqlGetRecords = `SELECT art_id, url, title, artist, catalog FROM art WHERE file_name IS NULL ORDER BY random() LIMIT ${max}`;
        database.all(sqlGetRecords, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

/**
 * Downloads an image for a record.
 *
 * @param record
 * @returns {Promise<unknown>}
 */
async function downloadImage(record) {
    const {url} = record;
    const fileName = createFileName(record);
    const downloadPath = path.join(artDirectory, fileName);

    console.log(`Downloading ${fileName}`);

    const response = await axios.get(url, {
        responseType: 'stream'
    });

    const writer = fs.createWriteStream(downloadPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(fileName));
        writer.on('error', reject)
    });
}

/**
 * Updates the database record with the name of the image file that was downloaded for that piece of art.
 *
 * @param fileName
 * @param record
 * @returns {Promise<unknown>}
 */
async function saveFileName(fileName, record) {
    const database = await db.get();
    return new Promise((resolve, reject) => {
        const {art_id} = record;
        const sql = "UPDATE art SET file_name=?, modified=datetime('now') WHERE art_id=?";
        database.run(sql, [fileName, art_id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Pauses execution.
 *
 * @param ms
 * @returns {Promise<unknown>}
 */
function pause(ms = 1000) {
    return new Promise((resolve, reject) => {
        try {
            setTimeout(() => resolve(), ms);
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Creates a file name for an image of a piece of art. The name consists of the database record id number, title, artist,
 * and catalog.
 *
 * @param record
 * @returns {string}
 */
function createFileName(record) {
    const {art_id, title, artist, catalog} = record;
    return `${art_id}-${_snakeCase(title)}-${_snakeCase(artist)}-${_snakeCase(catalog)}.jpg`;
}

module.exports = {
    download,
};