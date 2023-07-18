import {extractSchwinger, fetchSchwinger} from './extract.js';
import {transformSchwinger} from "./transform.js";
import {loadSchwingerToFile} from "./load.js";

await extractSchwinger({
        expanding: 'lastName',
        firstNameToken: '',
        lastNameStopToken: 'acj',
        lastNameToken: 'a',
        maximumNumberOfSuggestions: 15,
        totalOfEvaluatedSearchTokens: 0
    },
    fetchSchwinger,
    transformSchwinger,
    loadSchwingerToFile
);
