const _isEmpty = require('lodash/isEmpty');
const config = require('config');
const path = require('path');

const convert = require('./imagemagick/convert');
const db = require('./db');

async function create(max=100) {
    const artDirectory = config.get('artDirectory');
    const wallpaperDirectory = config.get('wallpaperDirectory');

    // TODO: Add sizes to config
    const wallpaperSizes = [
        { width: 1920, height: 1080 },
    ];

    const records = await getRecords(max);

    for (const record of records) {
        const wp = {
            artImage: path.join(artDirectory, record.file_name),
            title: record.title,
            artist: record.artist,
            date: record.date,
            technique: record.technique,
        };
        for (const size of wallpaperSizes) {
            const wallpaperFile = path.join(wallpaperDirectory, `${size.width}x${size.height}-${record.file_name}`);
            await createWallpaper({...wp, ...size, wallpaperFile}).catch(e => console.error(e));
        }
    }
}


/**
 * Creates an image suitable for use as background wallpaper.
 *
 * @param width
 * @param height
 * @param wallpaperFile
 * @param artImage
 * @param backgroundColor
 * @param fontColor
 * @param font
 * @param textPosition
 * @param textOffset
 * @param pointSize
 * @param title
 * @param artist
 * @param date
 * @param technique
 * @returns {Promise<void>}
 */
async function createWallpaper({
                             width = 2650,
                             height = 1440,
                             wallpaperFile = 'wallpaper.jpg',
                             artImage,
                             backgroundColor = 'black',
                             fontColor = 'white',
                             font = 'Ubuntu',
                             textPosition = 'northeast',
                             textOffset = 25,
                             pointSize = 28,
                             title = 'Unknown title',
                             artist = 'Unknown artist',
                             date = 'Unknown date',
                             technique = 'Unknown technique',
                         } = {}) {
    if (_isEmpty(artImage)) {
        throw "Input image must be provided";
    }

    console.log(`Creating wallpaper from ${artImage}`);

    try {
        await createWallpaperCanvas(wallpaperFile, width, height, backgroundColor);
        await addImageToWallpaperCanvas(wallpaperFile, artImage);
        await addTextToWallpaperCanvas(wallpaperFile, textPosition, fontColor, font, pointSize, textOffset, [title, artist, date, technique]);
    } catch (e) {
        console.error(e)
    }
}

/**
 * Creates an image (a.k.a. the wallpaper) with the given dimensions and color.
 *
 * @param wallpaperFile - The file to save the wallpaper to.
 * @param width - The width in pixels of the wallpaper.
 * @param height - The height in pixels fo the wallpaper.
 * @param backgroundColor - Background color (e.g. black, #000, etc).
 */
async function createWallpaperCanvas(wallpaperFile, width, height, backgroundColor) {
    await convert(['-size', `${width}x${height}`, `canvas:${backgroundColor}`, wallpaperFile]);
}

/**
 * Adds an image (a.k.a. the input image) on top of another image (a.k.a. the wallpaper) after resizing the input image
 * to fit on the wallpaper.
 *
 * @param wallpaperFile - The wallpaper file.
 * @param artImage - The image of art to add to the wallpaper.
 */
async function addImageToWallpaperCanvas(wallpaperFile, artImage) {
    const {width: wallpaperWidth, height: wallpaperHeight} = await getImageDimensions(wallpaperFile);
    const {width, height} = await calculateScaledImageDimensions(artImage, wallpaperWidth, wallpaperHeight);
    await convert([wallpaperFile, '(', artImage, '-resize', `${width}x${height}`, ')', '-gravity', 'center', '-composite', wallpaperFile]);
}

/**
 * Adds lines of text to one of the corners of an image (a.k.a. the wallpaper).
 *
 * @param wallpaperFile - The file to add the text to.
 * @param position - northwest, southwest, northeast, or southeast.
 * @param fontColor - Font color (e.g. black, #000, etc)
 * @param font - The font family (e.g. Ubuntu)
 * @param pointSize - The size of the text in points.
 * @param offsetPx - Number of pixels from the edges to offset the text.
 * @param lines - List of lines of text.
 */
async function addTextToWallpaperCanvas(wallpaperFile, position, fontColor, font, pointSize, offsetPx, lines = []) {
    const text = lines.join('\n');
    await convert([
        wallpaperFile,
        '-gravity',
        position,
        '-fill', fontColor,
        '-font', font,
        '-pointsize', pointSize,
        '-annotate', `+${offsetPx}+${offsetPx}`,
        text,
        wallpaperFile]);
}

/**
 * Calculates the dimensions to scale an image to so that it fits on a wallpaper. The scaled image will take up as much
 * room on the wallpaper as possible without cutting off any of the image.
 *
 * @param image
 * @param wallpaperWidth
 * @param wallpaperHeight
 * @returns {Promise<{width: *, height: number}|{width: number, height: *}>}
 */
async function calculateScaledImageDimensions(image, wallpaperWidth, wallpaperHeight) {
    const {width: imageWidth, height: imageHeight} = await getImageDimensions(image);

    const wallpaperAspect = wallpaperWidth / wallpaperHeight;
    const inputAspect = imageWidth / imageHeight;

    if (inputAspect > wallpaperAspect) {
        // Input image has a greater width-to-height ratio, so stretching it vertically to fit the wallpaper height would
        // cause the sides to be cut off. Therefore we need to stretch it horizontally to fit the wallpaper width so that
        // the whole input image will be visible when overlaid on the wallpaper.
        return {width: wallpaperWidth, height: imageHeight * (wallpaperWidth / imageWidth)};
    } else {
        // Input image has a smaller width-to-height ratio, so stretching it vertically to fit the wallpaper height won't
        // cause the sides to be cut off. Therefore stretch it vertically.
        return {width: imageWidth * (wallpaperHeight / imageHeight), height: wallpaperHeight}
    }
}

async function getImageDimensions(image) {
    const dimStr = await convert([image, '-format', '%w,%h', 'info:']);
    const [w, h] = dimStr.split(',');
    const width = Number.parseInt(w);
    const height = Number.parseInt(h);
    return {width, height};
}

/**
 * Get records of art from the database to generate wallpapers for. Prefer the most recently-modified database records
 * so that we tend to generate wallpaper for recently-downloaded images.
 *
 * @param max
 * @returns {Promise<unknown>}
 */
async function getRecords(max) {
    const database = await db.get();
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM art WHERE file_name IS NOT NULL ORDER BY modified DESC LIMIT ${max}`;
        database.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

module.exports = {
    create,
};
