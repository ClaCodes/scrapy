import {fetchSchwinger, updateSchwinger} from "./update.js";
import {loadAllSchwinger} from "./database.js";
import {transformSchwinger} from "./transform.js";
import {storeSchwingerToDatabase, storeSchwingerToFile} from "./load.js";

/** @type {UpdateConfig} */
const updateConfig = {chunkSize: 14};
/** @type {LoadConfig} */
const loadConfig = {
    path: `./dist/data/${new Date().toISOString()}_schwinger_update.json`,
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

process.exit(0);
