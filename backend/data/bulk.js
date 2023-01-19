require('dotenv').config({ path: '../.env' });
const songs = require('./sinhalasong.json');
const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');

const INDEX_NAME = process.env.INDEX_NAME;

const songsWithId = songs.map((song, index) => ({
  id: (index + 1).toString(),
  ...song,
  releasedYear: parseInt(song.releasedYear),
}));

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

const indexSettings = {
  index: INDEX_NAME,
  body: {
    settings: {
      analysis: {
        analyzer: {
          analyzerCaseInsensitive: {
            type: 'custom',
            tokenizer: 'whitespace',
            filter: ['lowercase', 'customStopWordFilter','customNgramFilter'],
          },
        },
        filter: {
          customNgramFilter: {
            type: 'edge_ngram',
            min_gram: '4',
            max_gram: '18',
            side: 'front',
          },
          customStopWordFilter: {
            type: 'stop',
            ignore_case: true,
            stopwords: [
              'ගත්කරු',
              'රචකයා',
              'ලියන්නා',
              'ලියන',
              'රචිත',
              'ලියපු',
              'ලියව්‌ව',
              'රචනා',
              'රචක',
              'ලියන්',
              'ලිවූ',
              'ගායකයා',
              'ගයනවා',
              'ගායනා',
              'ගායනා',
              'ගැයු',
              'ගයන',
              'කිව්',
              'කිවු',
              'සංගීත',
              'සංගීතවත්',
              'සංගීතය',
              'වර්ගය',
              'වර්‍ගයේ',
              'වර්ගයේම',
              'වර්ගයේ',
              'වැනි',
              'ඇතුලත්',
              'ඇතුලු',
              'විදියේ',
              'විදිහේ',
              'හොඳම',
              'ජනප්‍රිය',
              'ප්‍රචලිත',
              'ප්‍රසිද්ධම',
              'හොදම',
              'ජනප්‍රියම',
              'ලස්සනම',
              'ගීත',
              'සිංදු',
              'ගී',
              'සින්දු',
              'like',
              'about',
              'similar',
              'a',
              'an',
              'and',
              'the',
              'of',
              'to',
              'for',
              'in',
              'too',
              'to',
              'same',
              'song',
              'lyrics',
              'artist',
              'lyricist',
              'album',
              'singer',
              'songwriter',
              'composer',
              'metaphor',
              'meaning',
              'containing',
              'source',
              'target',
              'that',
              'this',
              'with',
              'by',
              'from',
              'on',
            ],
          },
        },
      },
    },
    mappings: {
      properties: {
        id: { type: 'keyword' },
        title: {
          type: 'text',
          fields: {
            raw: {
              type: 'keyword',
            },
          },
          analyzer: 'analyzerCaseInsensitive',
        },
        artist: {
          type: 'text',
          fields: {
            raw: {
              type: 'keyword',
            },
          },
          analyzer: 'analyzerCaseInsensitive',
        },
        album: {
          type: 'text',
          fields: {
            raw: {
              type: 'keyword',
            },
          },
          analyzer: 'analyzerCaseInsensitive',
        },
        releasedYear: { type: 'integer' },
        lyricist: {
          type: 'text',
          fields: {
            raw: {
              type: 'keyword',
            },
          },
          analyzer: 'analyzerCaseInsensitive',
        },
        lyrics: { type: 'text' },
        metaphor: { type: 'text' },
        meaning: {
          type: 'text',
          fields: {
            raw: {
              type: 'keyword',
            },
          },
          analyzer: 'analyzerCaseInsensitive',
        },
        source: {
          type: 'text',
          fields: {
            raw: {
              type: 'keyword',
            },
          },
          analyzer: 'analyzerCaseInsensitive',
        },
        target: {
          type: 'text',
          fields: {
            raw: {
              type: 'keyword',
            },
          },
          analyzer: 'analyzerCaseInsensitive',
        },
      },
    },
  },
};

async function run() {
  const exists = await client.indices.exists({ index: INDEX_NAME });
  if (exists) return;
  await client.indices.create(indexSettings, { ignore: [400] });

  const body = songsWithId.flatMap((doc) => [
    { index: { _index: INDEX_NAME } },
    doc,
  ]);

  const bulkResponse = await client.bulk({ refresh: true, body });

  if (bulkResponse.errors) {
    const erroredDocuments = [];
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0];
      if (action[operation].error) {
        erroredDocuments.push({
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1],
        });
      }
    });
    console.log(erroredDocuments);
  }

  const { count } = await client.count({ index: INDEX_NAME });
  console.log(count);
}

run().catch((err) => {
  console.log(err);
});
