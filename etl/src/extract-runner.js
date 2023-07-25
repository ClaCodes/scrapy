import {extractSchwinger, fetchSchwinger} from './extract.js';
import {transformSchwinger} from "./transform.js";
import {storeSchwingerToDatabase, storeSchwingerToFile} from "./load.js";
import {createSearch, OptimizationStrategy} from "./search.js";


/** @type {LoadConfig} */
const loadConfig = {
    path: `./dist/data/${new Date().toISOString()}_schwinger_extract.json`,
}

await extractSchwinger(
    createSearch('aaa', 'zzz', OptimizationStrategy.mixed),
    fetchSchwinger,
    transformSchwinger,
    storeSchwingerToFile,
    loadConfig,
);

await storeSchwingerToDatabase(loadConfig);

process.exit(0);
