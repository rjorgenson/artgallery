const path = require('path');
const wallpaper = require('./wallpaper');

async function generateWallpapers() {
    const inputDir = path.join('/home/cotp/Art');
    const outputDir = path.join('/home/cotp/Pictures/Art');

    const sizes = [
        { width: 2650, height: 1440 },
    ];

    const wallpapers = [
        {
            inputImage: path.join(inputDir, 'rembrandt-self-portrait-1659/original/Rembrandt_self_portrait.jpg'),
            title: 'Self-portrait',
            artist: 'Rembrandt',
            date: '1659',
            medium: 'Oil on canvas',
        },
        {
            inputImage: path.join(inputDir, 'amaldus-nielsen-aften-ved-frederiksstad-1909/original/Amaldus_Nielsen-Aften_ved_Frederiksstad.jpg'),
            title: 'Aften ved Frederiksstad',
            artist: 'Amaldus Nielsen',
            date: '1909',
            medium: 'Oil on canvas',
        },
    ];

    for (const wp of wallpapers) {
        for (const size of sizes) {
            const outputImage = path.join(outputDir, `${wp.title}-${wp.artist}-${wp.date}-${size.width}x${size.height}.jpg`);
            await wallpaper({...wp, ...size, outputImage}).catch(e => console.error(e));
        }
    }
}

generateWallpapers().catch(e => console.error(e));