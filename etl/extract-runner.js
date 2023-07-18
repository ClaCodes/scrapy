import {extractSchwinger, schwingerFetcher} from './extract.js';

await extractSchwinger({
        expanding: 'lastName',
        firstNameStopToken: 'zzz',
        firstNameToken: '',
        lastNameStopToken: 'zzz',
        lastNameToken: 'a',
        maximumNumberOfSuggestions: 15,
        totalOfEvaluatedSearchTokens: 0
    },
    schwingerFetcher
);
