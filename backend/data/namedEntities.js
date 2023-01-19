const songs = require('./sinhalasong.json');
const fs = require('fs');

const artists = songs.map((song) => song.artist).filter((x) => x !== null);
const lyricists = songs.map((song) => song.lyricist).filter((x) => x !== null);
const splittedNames = artists
  .flatMap((artist) => artist.split(' '))
  .filter((x) => !['and', ''].includes(x))
  .filter((x) => x.length > 2);
const splittedLyricists = lyricists
  .flatMap((lyricist) => lyricist.split(' '))
  .filter((x) => !['and', ''].includes(x))
  .filter((x) => x.length > 2);

const uniqueNames = [...new Set(splittedNames)];
const uniqueLyricists = [...new Set(splittedLyricists)];

const obj = {
  artist_names: uniqueNames,
  lyricist_names: uniqueLyricists,
}

fs.writeFile('entities.json', JSON.stringify(obj, null, 2), (err) => {
  if (err) {
    console.log(err);
  }
  console.log('Successfully Written to File.');
});
