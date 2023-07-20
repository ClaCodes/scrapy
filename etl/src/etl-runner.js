import {extractSchwinger, fetchSchwinger} from './extract.js';
import {transformSchwinger} from "./transform.js";
import {loadSchwingerToFile} from "./load.js";
import {createSearch} from "./search.js";

await extractSchwinger(
    createSearch('a', 'zz'),
    fetchSchwinger,
    transformSchwinger,
    loadSchwingerToFile,
    {
        path: `./dist/data/${new Date().toISOString()}_schwinger.json`,
    }
);
