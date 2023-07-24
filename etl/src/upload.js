import {storeSchwingerToDatabase} from "./load.js";

/** @type {LoadConfig} */
const loadConfig = {
    path: './dist/data/2023-07-21T17:00:18.035Z_schwinger.json',
}

await storeSchwingerToDatabase(loadConfig);

