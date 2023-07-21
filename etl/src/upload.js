import {loadSchwingerToDatabase} from "./load.js";
import {database} from "./database.js";

/** @type {LoadConfig} */
const loadConfig = {
    path: './dist/data/2023-07-21T17:00:18.035Z_schwinger.json',
}

await loadSchwingerToDatabase(database, loadConfig);

