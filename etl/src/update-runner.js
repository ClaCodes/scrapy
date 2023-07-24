import {fetchSchwinger, updateSchwinger} from "./update.js";
import {loadAllSchwinger} from "./database.js";
import {transformSchwinger} from "./transform.js";
import {storeSchwingerToDatabase, storeSchwingerToFile} from "./load.js";

/** @type {UpdateConfig} */
const updateConfig = {chunkSize: 14};
/** @type {LoadConfig} */
const loadConfig = {
    path: `./dist/data/2023-07-24T16:34:18.224Z_schwinger_extract.json`,
}
await updateSchwinger(
    loadAllSchwinger,
    fetchSchwinger,
    transformSchwinger,
    storeSchwingerToFile,
    storeSchwingerToDatabase,
    updateConfig,
    loadConfig,
);
