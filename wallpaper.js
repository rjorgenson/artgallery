const convert = require('./convert');
const _isEmpty = require('lodash/isEmpty');

async function wallpaper({
                             width = 2650,
                             height = 1440,
                             outputImage = 'wallpaper.jpg',
                             inputImage,
                             backgroundColor = 'black',
                             fontColor= 'white',
                             font = 'Ubuntu',
                             textPosition = 'northeast',
                             textOffset = 25,
                             pointSize = 28,
                             title = 'Unknown title',
                             artist = 'Unknown artist',
                             date = 'Unknown date',
                             medium = 'Unknown medium',
                         } = {}) {
    if (_isEmpty(inputImage)) {
        throw "Input image location must be provided";
    }

    try {
        // Create the canvas
        await convert(['-size', `${width}x${height}`, `canvas:${backgroundColor}`, outputImage]);

        // What dimensions do we need to scale the input image to so that it's as big as possible without being
        // cut off on the top or the sides?
        const {width: w, height: h} = await scaledDimensions(width, height, inputImage);

        // Add the input image (scaled to the right size)
        await convert([outputImage, '(', inputImage, '-resize', `${w}x${h}`, ')', '-gravity', 'center', '-composite', outputImage]);

        // Add the text information
        await convert([
            outputImage,
            '-gravity',
            textPosition,
            '-fill', fontColor,
            '-font', font,
            '-pointsize', pointSize,
            '-annotate', `+${textOffset}+${textOffset}`,
            `${title}\n${artist}\n${date}\n${medium}`,
            outputImage])
    } catch (e) {
        console.error(e)
    }
}

async function scaledDimensions(canvasWidth, canvasHeight, inputImage) {
    // Get the dimensions of the input image
    const dimStr = await convert([inputImage, '-format', '%w,%h', 'info:']);
    const [width, height] = dimStr.split(',');
    const w = Number.parseInt(width);
    const h = Number.parseInt(height);

    const canvasAspect = canvasWidth/canvasHeight;
    const inputAspect = w/h;

    if (inputAspect >  canvasAspect) {
        // Input image has a greater width-to-height ratio, so stretching it vertically to fit the canvas height would
        // cause the sides to be cut off. Therefore we need to stretch it horizontally to fit the canvas width so that
        // the whole input image will be visible when overlaid on the canvas.
        return {width: canvasWidth, height: h * (canvasWidth/w)};
    } else {
        // Input image has a smaller width-to-height ratio, so stretching it vertically to fit the canvas height won't
        // cause the sides to be cut off. Therefore stretch it vertically.
        return {width: w * (canvasHeight/h), height: canvasHeight}
    }
}

module.exports = wallpaper;
