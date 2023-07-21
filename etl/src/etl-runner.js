import {extractSchwinger, fetchSchwinger} from './extract.js';
import {transformSchwinger} from "./transform.js";
import {loadSchwingerToDatabase, loadSchwingerToFile} from "./load.js";
import {createSearch, OptimizationStrategy} from "./search.js";
import {database} from "./database.js";


/** @type {LoadConfig} */
const loadConfig = {
    path: `./dist/data/${new Date().toISOString()}_schwinger.json`,
}

await extractSchwinger(
    createSearch('a', 'z', OptimizationStrategy.speed),
    fetchSchwinger,
    transformSchwinger,
    loadSchwingerToFile,
    loadConfig,
);

await loadSchwingerToDatabase(database, loadConfig);
