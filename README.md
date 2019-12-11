# Art Gallery

## Prerequisites

* Node 12.x or higher
* Sqlite3

## Installation

Install the prerequisites for you Operating System.

Install the node.js dependencies:

```
npm install
```

## Running

There are a few things you can do with Art Gallery:

* Update the database of records from the catalogs
* Download images of art for each record in the catalogs
* Create wallpaper/backgrounds from the art images

### Update the Database

This reads data from the catalogs (in `./catalogs`) and creates or updates records in the database for them.

```
npm run updateDatabase
```

### Download Images

This finds records in the database that don't have images downloaded for them yet, and downloads them. By default it
will process a limited number of records and will add a delay between each download to prevent overwhelming the servers
that images are downloaded from. 

```
npm run downloadImages -- --max=10 --delayMs=100
```

Wallpapers are saved to `images/Art` unless you add a `config/local.yaml` file that overrides that.

### Create Wallpaper/Background Images

This selects the most recently modified records from the database and generates wallpaper/background files for them. Wallpaper
images are sized for common screen resolutions, contain an image of the art centered on the wallpaper, as well as information about the art
as text in the corner of the wallpaper. By default it will generate a limited number of wallpaper images.

```
npm run createWallpapers -- --max=10
```

Wallpapers are saved to `images/Wallpapers` unless you add a `config/local.yaml` file that overrides that.

## Sources

I'm always looking for sources of art images and metadata that can be downloaded and processed by software. The
`catalogs` directory has subdirectories for each source of art. Details about each source can be found in the README.md
file within each source's subdirectory.

## Future Work

Need to set the dimensions of the wallpapers in configuration (currently it's hard-coded in `src/wallpapers.js`).

I am considering creating a web application that allows people to browse, search, comment, etc.