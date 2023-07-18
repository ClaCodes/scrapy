import {extractSchwinger, fetchSchwinger} from './extract.js';
import {transformSchwinger} from "./transform.js";

await extractSchwinger({
        expanding: 'lastName',
        firstNameStopToken: 'zzz',
        firstNameToken: '',
        lastNameStopToken: 'abd',
        lastNameToken: 'a',
        maximumNumberOfSuggestions: 15,
        totalOfEvaluatedSearchTokens: 0
    },
    fetchSchwinger,
    transformSchwinger
);
