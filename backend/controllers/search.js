const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');

const keywords = require('../data/keywords.json');
const { artist_names, lyricist_names } = require('../data/entities.json');

const client = new Client({
  node: process.env.ELASTIC_NODE_URL,
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
  tls: {
    ca: fs.readFileSync(process.env.ELASTIC_TLS_CERT_PATH),
    rejectUnauthorized: false,
  },
});

const INDEX_NAME = process.env.INDEX_NAME;

const search = async (req, res) => {
  let { query } = req.body;
  const queryWords = query.trim().split(/\s+/);

  const removingQueryWords = [];

  let size = 100;

  let fieldType = '';

  let bTitle = 1;
  let bArtist = 1;
  let bLyrics = 1;
  let bLyricist = 1;
  let b_album = 1;
  let b_metaphor = 1;
  let bMeaning = 1;
  let bSource = 1;
  let bTarget = 1;

  let sorting = 0;
  let range = 0;
  let sortMethod = [];

  if (queryWords.length > 8) {
    bLyrics = bLyrics + 2;
    fieldType = 'best_fields';
  } else {
    fieldType = 'cross_fields';
    queryWords.forEach((word) => {
      word = word.replace('ගේ', '');
      word = word.replace("'s", '');
      word = word.replace('යන්ගේ', '');
      if (artist_names.includes(word)) {
        bArtist = bArtist + 1;
      }
      if (lyricist_names.includes(word)) {
        bLyricist = bLyricist + 1;
      }

      if (keywords.artist.includes(word)) {
        bArtist = bArtist + 1;
        removingQueryWords.push(word);
      }
      if (keywords.metaphor.includes(word)) {
        bSource = bSource + 1;
        bTarget = bTarget + 1;
        removingQueryWords.push(word);
      }
      if (keywords.meaning.includes(word)) {
        bMeaning = bMeaning + 1;
        removingQueryWords.push(word);
      }
      if (keywords.lyricist.includes(word)) {
        bLyricist = bLyricist + 1;
        removingQueryWords.push(word);
      }
      if (keywords.song.includes(word)) {
        removingQueryWords.push(word);
      }
      if (keywords.sorting.includes(word)) {
        sorting = sorting + 1;
        removingQueryWords.push(word);
      }

      if (!isNaN(word)) {
        range = parseInt(word);
        removingQueryWords.push(word);
      }
    });
  }
  if (range == 0 && sorting > 0) {
    size = 10;
    sortMethod = [{ releasedYear: { order: 'desc' } }];
  } else if (range > 0 || sorting > 0) {
    size = range;
    sortMethod = [{ releasedYear: { order: 'desc' } }];
  }

  removingQueryWords.forEach((word) => {
    query = query.replace(word, '');
  });
  console.log(removingQueryWords);

  const searchParams = {
    index: INDEX_NAME,
    body: {
      size: size,
      _source: {
        includes: [
          'artist',
          'title',
          'lyricist',
          'album',
          'lyrics',
          'metaphor',
          'meaning',
          'source',
          'target',
          'releasedYear',
          'id'
        ],
      },
      sort: sortMethod,
      query: {
        multi_match: {
          query: query.trim(),
          type: fieldType,
          fields: [
            'artist^' + bArtist,
            'lyrics^' + bLyrics,
            'title^' + bTitle,
            'lyricist^' + bLyricist,
            'album^' + b_album,
            'metaphor^' + b_metaphor,
            'meaning^' + bMeaning,
            'source^' + bSource,
            'target^' + bTarget,
          ],
          operator: 'or',
        },
      },
      aggs: {
        album_filter: {
          terms: {
            field: 'album.raw',
            size: 10,
          },
        },
        artist_filter: {
          terms: {
            field: 'artist.raw',
            size: 10,
          },
        },
        lyricist_filter: {
          terms: {
            field: 'lyricist.raw',
            size: 10,
          },
        },
        source_filter: {
          terms: {
            field: 'source.raw',
            size: 10,
          },
        },
        target_filter: {
          terms: {
            field: 'target.raw',
            size: 10,
          },
        },
      },
    },
  };

  console.log(JSON.stringify(searchParams, null, 2))
  const response = await client.search(searchParams);
  // console.log(JSON.stringify(response, null, 2));
  return res.status(200).json({ response });
};

module.exports = {
  search,
};
