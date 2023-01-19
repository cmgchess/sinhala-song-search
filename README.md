## Sinhala Song Search
 CS4642 - Data Mining & Information Retrieval

### Use cases
<hr></hr>  

 - Searching songs using the Title, Artist, Lyricist, Album
 - Limiting search ( ex :- 2 songs of .... )
 - Search songs by metaphors ( ex :- metaphors for girl )
 - Search songs by metaphor meaning ( ex :- meaning beautiful girl )

### Techniques
<hr></hr>  

 - **Tokenization**
	 -  *Whitespace tokenizer* - The text being analyzed will be split into tokens (individual words) based on whitespace. It means that any sequence of whitespace characters (such as spaces, tabs, or line breaks) will be used as delimiters between tokens in the text.
	 - *Edge n-gram tokenizer* - Breaks the text down into n-grams of a given size, with n-grams created from the start  (`front`) of the text. Here, the `min_gram` is set to 4 and `max_gram` is set to 18. This means that the tokenizer will break down the text into n-grams of size 4 to 18 and only create n-grams from the start (front) of the text. This filter can be used to improve search performance for prefix matching queries.
 - **Stop word filtering**
	 - A custom filter is used for stop word handling. Apart from the default english stop words used by Elasticsearch it is customized to remove stop words that are relevant to the application. he `ignore_case` option is set to `true` which means that the filter will match the words in the `stopwords` array regardless of the case.
- **Field boosting**
	- Certain keywords have been used to boost the relevant fields such that they count more towards the relevance score of the query.
		- Using words like 'written' in the search will boost the `lyricist` field.
		- Using words like 'sung', 'performed' will boost the `artist` field.
		- Using words like 'metaphors' in the search will boost the `source` and the `target` fields.
		- Using words like 'meaning' will boost the `meaning` field.
