import { ChakraProvider } from '@chakra-ui/react';
import {
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Spinner,
  List,
  ListItem,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import axios from 'axios';
import React, { useState } from 'react';
import SongCard from './Card';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [albumAgg, setAlbumAgg] = useState([]);
  const [artistAgg, setArtistAgg] = useState([]);
  const [lyricistAgg, setLyricistAgg] = useState([]);
  const [sourceAgg, setSourceAgg] = useState([]);
  const [targetAgg, setTargetAgg] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);

  const getSearchResults = async (query) => {
    const response = await axios.post('http://localhost:8000/search', {
      query,
    });
    return response.data;
  };

  const handleChange = (e) => {
    e.preventDefault();
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.length > 0) {
      setLoading(true);
      getSearchResults(searchTerm).then((data) => {
        setHits(data?.response?.hits?.hits);
        setAlbumAgg(data?.response?.aggregations?.album_filter?.buckets);
        setArtistAgg(data?.response?.aggregations?.artist_filter?.buckets);
        setLyricistAgg(data?.response?.aggregations?.lyricist_filter?.buckets);
        setSourceAgg(data?.response?.aggregations?.source_filter?.buckets);
        setTargetAgg(data?.response?.aggregations?.target_filter?.buckets);
        console.log(data);
        setLoading(false);
      });
    }
  };

  return (
    <ChakraProvider>
      <React.Fragment>
        <div className="heading">
          <h1 className="remove-inherit">Sinhala Song Search</h1>
        </div>
        <br></br>
        <hr></hr>
        <br></br>
        <div className="search-container">
          <InputGroup size="lg">
            <InputLeftElement
              pointerEvents="none"
              children={<SearchIcon color="gray.300" />}
            />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={handleChange}
            />
          </InputGroup>
          <Button
            onClick={handleSubmit}
            className="search-button"
            colorScheme="green"
            size="lg"
          >
            Search
          </Button>
        </div>
        <br></br>
        <hr></hr>
        <br></br>
        {loading && (
          <div>
            <Spinner
              className="spinner-position"
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </div>
        )}
        {hits.length > 0 && !loading && (
          <React.Fragment>
            <List spacing="1rem">
              {hits.map((hit) => (
                <ListItem key={`li-${hit._source.id}`}>
                  <SongCard hit={hit} />
                </ListItem>
              ))}
            </List>
          </React.Fragment>
        )}
      </React.Fragment>
    </ChakraProvider>
  );
}

export default App;
