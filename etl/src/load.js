import fs from "fs";
import path from "path";
import {writeBatch, doc} from "firebase/firestore";

/**
 * Loads the transformed Schwinger into a file.
 *
 * @typedef {Object} LoadConfig
 * @property {string} path - The path to the file to store the Schwinger in
 *
 * @typedef {Object} LoadStats
 * @property {boolean} success - Whether the loading was successful
 * @property {string} location - The location of the file where the Schwinger are stored
 * @property {number} totalNumberOfRecords - The number of records that are stored in the file after the current load
 * @property {number} numberOfRecordsAdded - The number of records that were added to the file
 *
 * @typedef {Object} PartialLoadStats
 * @property {boolean} success - Whether the loading was successful
 * @property {number} numberOfRecords - The number of records that were added to the file
 *
 * @param {Schwinger[]} transformedSchwinger - An array of Schwinger to be stored in the file
 * @param {LoadConfig} config - The configuration for storing the Schwinger
 * @returns {{LoadStats}|{PartialLoadStats}} - The statistics of the load
 */
export function loadSchwingerToFile(transformedSchwinger, config) {
    if (!Array.isArray(transformedSchwinger)) {
        throw new Error('input must be an array');
    }
    if (transformedSchwinger.length === 0) {
        return {
            success: true,
            numberOfRecords: 0
        }
    }

    const pathToStoreSchwingerFile = path.join(process.cwd(), config.path);
    const schwingerFileDir = path.dirname(pathToStoreSchwingerFile)

    if (!fs.existsSync(schwingerFileDir)) {
        fs.mkdirSync(schwingerFileDir);
    }

    let newData;
    let combinedData = [];
    if (fs.existsSync(pathToStoreSchwingerFile)) {
        const existingData = JSON.parse(fs.readFileSync(pathToStoreSchwingerFile, 'utf8'));
        const existingIds = new Set(existingData.map(obj => obj.id));
        newData = transformedSchwinger.filter(obj => !existingIds.has(obj.id));
        combinedData = [...existingData, ...newData];
        fs.writeFileSync(
            config.path,
            JSON.stringify(combinedData, null, 2),
            (err) => {
                if (err) throw err;
            },
        );
    } else {
        newData = transformedSchwinger;
        fs.writeFileSync(
            pathToStoreSchwingerFile,
            JSON.stringify(newData, null, 2),
            (err) => {
                if (err) throw err;
            },
        );
    }

    return {
        success: true,
        location: pathToStoreSchwingerFile,
        numberOfRecordsAdded: newData.length,
        totalNumberOfRecords: combinedData.length
    }
}


/**
 * Loads the transformed Schwinger into the database.
 *
 * Uploads all Schwinger of the specified file to the database using batch writes.
 * Since batch writes are limited to 500 operations, the Schwinger are split into chunks of 500.
 *
 *
 * @param {Firestore} database
 * @param {LoadConfig} config
 *
 */
// TODO: check if this should be done with the server client lib: https://firebase.google.com/docs/firestore/client/libraries#server_client_libraries
export async function loadSchwingerToDatabase(database, config) {
    const pathToStoreSchwingerFile = path.join(process.cwd(), config.path);
    if (!fs.existsSync(pathToStoreSchwingerFile)) {
        throw new Error('Implementation defect: file to upload does not exist');
    }

    /** @type {Schwinger[]} */
    const dataToBeUploaded = JSON.parse(fs.readFileSync(pathToStoreSchwingerFile, 'utf8'));
    console.log(`Loaded ${dataToBeUploaded.length} Schwinger from the specified file`);

    const chunkSize = 500;
    /** @type {Schwinger[][]} */
    const chunks = [];
    for (let i = 0; i < dataToBeUploaded.length; i += chunkSize) {
        chunks.push(dataToBeUploaded.slice(i, i + chunkSize));
    }
    console.log(`Split the Schwinger into ${chunks.length} chunks of ${chunkSize} Schwinger each`);

    let chunkCounter = 1;
    for (const chunk of chunks) {
        const batch = writeBatch(database);
        for (const schwinger of chunk) {
            const schwingerRef = doc(database, "schwinger", String(schwinger.id));
            batch.set(schwingerRef, schwinger);
        }
        await batch.commit();
        console.log(`Uploaded chunk ${chunkCounter++} of ${chunks.length}`);
    }

    console.log(`Successfully uploaded ${dataToBeUploaded.length} Schwinger to the database`);
}
