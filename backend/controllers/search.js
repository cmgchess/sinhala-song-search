const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');

const keywords = require('../data/keywords.json');
const entities = require('../data/entities.json');

const client = new Client({
    node: process.env.ELASTIC_NODE_URL,
    auth: {
      username: process.env.ELASTIC_USERNAME,
      password: process.env.ELASTIC_PASSWORD,
    },
    tls: {
      ca: fs.readFileSync(process.env.ELASTIC_TLS_CERT_PATH),
      rejectUnauthorized: false
    }
  });

const INDEX_NAME = process.env.INDEX_NAME;

const search = async (req, res) => {
    const { query } = req.body; 
    console.log(query) 
    const searchParams = {
      index: INDEX_NAME,
      body: {
        query: {
          match_all: {}
        }
      }
    }

    const response = await client.search(searchParams);
    return res.status(200).json({hits: response.hits.hits}); 
}

module.exports = {
    search,
  };