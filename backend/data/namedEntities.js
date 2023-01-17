const songs = require('./sinhalasong.json');
const fs = require('fs');

const artists = songs.map((song) => song.artist).filter((x) => x !== null);
const lyricists = songs.map((song) => song.lyricist).filter((x) => x !== null);
const splittedNames = artists.flatMap((artist) => artist.split(' '));
const splittedLyricists = lyricists.flatMap((lyricist) => lyricist.split(' '));
const combined = [...splittedLyricists, ...splittedNames]
  .filter((x) => !['and', ''].includes(x))
  .filter((x) => {
    // const lastLetter = x.charAt(x.length - 1);
    return x.length > 2;
  });
const unique = [...new Set(combined)];

fs.writeFile('entities.json', JSON.stringify(unique, null, 2), (err) => {
  if (err) {
    console.log(err);
  }
  console.log('Successfully Written to File.');
});
