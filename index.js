const path = require('path');
const wallpaper = require('./src/wallpaper');

async function generateWallpapers() {
    const inputImageDir = path.join('/home/cotp/Art');
    const wallpaperOutputDir = path.join('/home/cotp/Pictures/Art');

    const wallpaperSizes = [
        { width: 1920, height: 1080 },
    ];

    const wallpapers = [
        {
            artImage: path.join(inputImageDir, 'rembrandt-self-portrait-1659/original/Rembrandt_self_portrait.jpg'),
            title: 'Self-portrait',
            artist: 'Rembrandt',
            date: '1659',
            medium: 'Oil on canvas',
        },
        {
            artImage: path.join(inputImageDir, 'amaldus-nielsen-aften-ved-frederiksstad-1909/original/Amaldus_Nielsen-Aften_ved_Frederiksstad.jpg'),
            title: 'Aften ved Frederiksstad',
            artist: 'Amaldus Nielsen',
            date: '1909',
            medium: 'Oil on canvas',
        },
    ];

    for (const wp of wallpapers) {
        for (const size of wallpaperSizes) {
            const wallpaperFile = path.join(wallpaperOutputDir, `${wp.title}-${wp.artist}-${wp.date}-${size.width}x${size.height}.jpg`);
            await wallpaper.create({...wp, ...size, wallpaperFile}).catch(e => console.error(e));
        }
    }
}

generateWallpapers().catch(e => console.error(e));