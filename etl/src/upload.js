import {loadSchwingerFromFile, storeSchwingerToDatabase, storeSchwingerToFile} from "./load.js";

// change to your local files
const filesToMerge = [
    {path: './dist/data/2023-07-24T19:04:47.807Z_schwinger_extract.json'},
    {path: './dist/data/2023-07-24T19:55:22.103Z_schwinger_extract.json'},
    {path: './dist/data/2023-07-24T20:01:18.372Z_schwinger_extract.json'},
];

let mergedData = loadSchwingerFromFile(filesToMerge[0]);
for (let i = 1; i < filesToMerge.length; i++) {
    const dataToMerge = loadSchwingerFromFile(filesToMerge[i]);
    const existingIds = new Set(mergedData.map(obj => obj.id));
    mergedData = [
        ...mergedData,
        ...dataToMerge.filter(obj => !existingIds.has(obj.id))
    ];
}


/** @type {LoadConfig} */
const uploadFileConfig = {
    path: `./dist/data/${new Date().toISOString()}_schwinger_upload.json`,
};

console.log(`Loaded ${mergedData.length} Schwinger from the specified files`);

storeSchwingerToFile(mergedData, uploadFileConfig);


// comment out if you only want to merge files
/** @type {LoadConfig} */
await storeSchwingerToDatabase(uploadFileConfig);

