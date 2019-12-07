const convert = require('imagemagick').convert;

/**
 * Wraps Imagemagick's convert function in a Promise so it can be used with async/await.
 */
function conv(args) {
    return new Promise((resolve, reject) => {
        convert(args, (err, stdout) => {
            if (err) {
                reject(err)
            } else {
                resolve(stdout);
            }
        });
    });
}

module.exports = conv;