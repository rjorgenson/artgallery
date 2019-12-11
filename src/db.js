const config = require('config');
const sqlite3 = require('sqlite3').verbose();

const databaseFile = config.get('databaseFile');

let db;

function initialize() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(databaseFile, err => {
            if (err) {
                reject(err);
            }
        });

        function exitHandler(exitCode) {
            // When the app exits, close the database
            if (db) {
                db.close(err => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('Disconnected from the art gallery database');
                    }
                });
            }
        }

        process.on('exit', exitHandler);
         // Not sure if handling exit is enough, or if we need to handle these too...
        process.on('SIGINT', exitHandler);
        process.on('SIGUSR1', exitHandler);
        process.on('SIGUSR2', exitHandler);
        process.on('uncaughtException', exitHandler);

        const sqlCreateArtTable = `CREATE TABLE IF NOT EXISTS art (
            art_id INTEGER PRIMARY KEY,
            url TEXT NOT NULL UNIQUE,
            catalog TEXT,
            license TEXT,
            file_name TEXT,
            artist TEXT,
            title TEXT,
            date TEXT,
            technique TEXT,
            location TEXT,
            form TEXT,
            type TEXT,
            school TEXT,
            timeframe TEXT,
            created DATETIME DEFAULT CURRENT_TIMESTAMP,
            modified DATETIME DEFAULT CURRENT_TIMESTAMP
        )`;

        db.run(sqlCreateArtTable, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(db);
            }
        });
    });
}

function get() {
    if (db) {
        return Promise.resolve(db);
    } else {
        return initialize();
    }
}

module.exports = {
    get,
};
