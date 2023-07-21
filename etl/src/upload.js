import {loadSchwingerToDatabase} from "./load.js";
import {database} from "./database.js";

/** @type {LoadConfig} */
const loadConfig = {
    path: './dist/data/2023-07-20T13:17:37.244Z_schwinger.json',
}

await loadSchwingerToDatabase(database, loadConfig);

