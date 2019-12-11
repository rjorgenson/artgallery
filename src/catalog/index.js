const webGalleryOfArt = require('./wgoa/webGalleryOfArt');

async function updateDatabase() {
    await webGalleryOfArt.updateDatabase();
    // TODO: When we add more catalogs call their updateDatabase() functions here
}

module.exports = {
    updateDatabase
};
