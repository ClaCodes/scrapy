import {loadSchwingerFromFile} from "./load.js";

function wait(milliseconds) {
    console.log(`waiting ${milliseconds / 1000} seconds`);
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Normalizes the given string by removing all diacritics, e.g. 'ä' -> 'a', 'é' -> 'e', etc.
 * Note: This needed for alignment with the API, which treats 'ä' and 'a' as the same character.
 *
 * @param str
 * @returns {string}
 */
function normalizeString(str) {
    if (!str) {
        return '';
    }
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Filters the data by the given token and returns the first maxResults which match the sequence defined by the token.
 * Follows the filtering logic of the API. This means:
 * * The token is split into two sequences by the first space character. The space becomes part of the second sequence if there is more than one space.
 * * The number of leading spaces is reduced to one if there are two spaces. (sounds weird because it is)
 * * Sequences are searched like this:
 *     * if seq1 is in the last name, check if seq2 is in the first name
 *     * if seq1 is in the first name, check if seq2 is in the last name
 *
 * @param {Schwinger[]} data
 * @param {string} token
 * @param {number} maxResults
 *
 * @returns {Schwinger[]}
 */
export function filter(data, token, maxResults) {
    return data
        .filter(schwinger => {
            const normalizedFirstName = ' ' + normalizeString(schwinger.firstName?.toLowerCase());
            const normalizedLastName = normalizeString(schwinger.lastName?.toLowerCase());
            const spaceIndex = token.indexOf(' ');
            const firstSequence = token.substring(0, spaceIndex);
            const secondSequence = token.substring(spaceIndex).replace(' ', '');

            if (normalizedLastName.includes(firstSequence)) {
                return normalizedFirstName.includes(secondSequence);
            } else if (normalizedFirstName.includes(firstSequence)) {
                return normalizedLastName.includes(secondSequence);
            } else {
                return false;
            }
        })
        .sort((a, b) => a.lastName.localeCompare(b.lastName))
        .slice(0, maxResults);
}

function longestCommonSubstring(a, b) {
    var matrix = Array(b.length + 1)
        .fill(null)
        .map(() => Array(a.length + 1).fill(null));

    for (let letterInA = 0; letterInA <= a.length; letterInA += 1) {
        matrix[0][letterInA] = 0;
    }

    for (let letterInB = 0; letterInB <= b.length; letterInB += 1) {
        matrix[letterInB][0] = 0;
    }

    let longestSubstringLength = 0;
    let longestSubstringEndIndex = 0;

    for (let letterInB = 1; letterInB <= b.length; letterInB += 1) {
        for (let letterInA = 1; letterInA <= a.length; letterInA += 1) {
            if (a[letterInA - 1] === b[letterInB - 1]) {
                matrix[letterInB][letterInA] = matrix[letterInB - 1][letterInA - 1] + 1;
                if (matrix[letterInB][letterInA] > longestSubstringLength) {
                    longestSubstringLength = matrix[letterInB][letterInA];
                    longestSubstringEndIndex = letterInA;
                }
            } else {
                matrix[letterInB][letterInA] = 0;
            }
        }
    }

    if (longestSubstringLength === 0) {
        return '';
    }

    return a.slice(longestSubstringEndIndex - longestSubstringLength, longestSubstringEndIndex);
}

/**
 * Calculates the longest common subsequence of the given Schwinger data.
 *
 * @param {Schwinger[]} data
 * @returns {string}
 */
export function calculateLongestCommonSubsequence(data) {
    if (data.length < 2) {
        return data[0].lastName.toLowerCase().concat(' ' + data[0]?.firstName.toLowerCase())
    } else {
        let lcsLastName = longestCommonSubstring(
            data[0].lastName.toLowerCase(),
            data[1].lastName.toLowerCase()
        );
        // TODO: handle case where firstname is null
        let lcsFirstName = longestCommonSubstring(
            data[0].firstName.toLowerCase(),
            data[1].firstName.toLowerCase()
        );
        for (let i = 2; i < data.length - 1; i++) {
            lcsLastName = longestCommonSubstring(lcsLastName, !!data[i].lastName ? data[i].lastName.toLowerCase() : '');
            lcsFirstName = longestCommonSubstring(lcsFirstName, !!data[i]?.firstName ? data[i].firstName.toLowerCase() : '');
        }
        if (!lcsLastName && !lcsFirstName) {
            return null;
        }
        const lcs = lcsLastName.concat(' ' + lcsFirstName);
        if (lcs < 'a') {
            return 'a';
        }
        return lcs;
    }
}

/**
 * Checks if the two given arrays contain the same Schwinger in the same order.
 * The ids of the Schwinger are used to compare the arrays.
 *
 * @param {Schwinger[]} a
 * @param {Schwinger[]} b
 *
 * @returns {boolean} - true if the arrays contain the same Schwinger in the same order, false otherwise
 */
export function areSchwingerArraysEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i].id !== b[i].id) {
            return false;
        }
    }

    return true;
}

export const fetchSchwinger = async (longestCommonSubsequence) => {
    return fetch(`https://zwilch.ch/api/v2/schwinger/${encodeURIComponent(longestCommonSubsequence)}`)
        .then(response => {
            if (response.status === 429) {
                return null;
            } else if (response.status === 200) {
                return response.json()
            } else {
                throw new Error('unexpected response status: ' + response.status)
            }
        });
}

/**
 * Updates the Schwinger data by fetching the latest data from the API.
 *
 * Note: Since we have to fetch all data to ensure the data is complete we override the existing data with the latest data.
 *
 * @typedef {Object} UpdateConfig
 * @property {number} chunkSize - The maximum number of Schwinger to be updated at once, this is limited by the fact that the API only returns 15 results per query
 *
 * @param {function} loadAllSchwinger - A function that loads all Schwinger data from the database
 * @param {function} fetchSchwinger - A function that fetches the Schwinger data from the API
 * @param {function} transformSchwinger - A function that transforms the Schwinger data from the API into the Schwinger data that is used in the application
 * @param {function} storeSchwingerToFile - A function that stores the Schwinger data in a file
 * @param {function} storeSchwingerToDatabase - A function that stores the Schwinger data in a database
 * @param {UpdateConfig} updateConfig
 * @param {function} loadConfig - The configuration for loading the Schwinger into the database
 *
 */
export async function updateSchwinger(loadAllSchwinger, fetchSchwinger, transformSchwinger, storeSchwingerToFile, storeSchwingerToDatabase, updateConfig, loadConfig) {
    // const existingData = await loadSchwingerFromFile({
    //     path: './dist/data/2023-07-24T21:40:03.160Z_schwinger_upload.json'
    // })
    const dataToBeUpdated = loadSchwingerFromFile({
        path: './dist/data/2023-07-25T06:44:54.270Z_schwinger_upload.json'
    }).sort(
        (a, b) => a.lastName.concat(' ' + a.firstName).toLowerCase().localeCompare(b.lastName.concat(' ' + b.firstName).toLowerCase())
    );

    const index = dataToBeUpdated.findIndex(obj => obj.id === 7240);
    console.log(`Index was ${index} of ${dataToBeUpdated.length} elements.`)


    let startOfChunkToBeUpdated = 0;
    while (startOfChunkToBeUpdated <= dataToBeUpdated.length - 1) {
        let numberOfElementsInChunkToBeUpdated = updateConfig.chunkSize;
        let chunkToBeUpdated = dataToBeUpdated.slice(startOfChunkToBeUpdated, startOfChunkToBeUpdated + numberOfElementsInChunkToBeUpdated);
        let longestCommonSubsequence = calculateLongestCommonSubsequence(chunkToBeUpdated);
        let filteredData;
        if (!longestCommonSubsequence) {
            filteredData = [];
        } else {
            filteredData = filter(dataToBeUpdated, longestCommonSubsequence, updateConfig.chunkSize);
        }
        while (!areSchwingerArraysEqual(chunkToBeUpdated, filteredData)) {
            if (numberOfElementsInChunkToBeUpdated === 1) {
                // we can not formulate a more specific query, so it is ok to continue with the update if
                // the superfluous elements are lexically larger than the element to be updated
                // this constraint can not be upheld because of e.g. the case where we query "bucher janik" but there is also "bucher nik" in the data
                // const targetElement = normalizeSchwingerName(chunkToBeUpdated[0]);
                // for (let i = 1; i < filteredData.length; i++) {
                //     const superfluousElements = normalizeSchwingerName(filteredData[i]);
                //     if (superfluousElements < targetElement) {
                //         throw new Error(`Implementation defect: Query "${longestCommonSubsequence}" contains "${superfluousElements}" which is lexically smaller than the target element "${targetElement}".`)
                //     }
                // }
                // we can not formulate a more specific query
                break;
            }
            numberOfElementsInChunkToBeUpdated--;
            chunkToBeUpdated = dataToBeUpdated.slice(startOfChunkToBeUpdated, startOfChunkToBeUpdated + numberOfElementsInChunkToBeUpdated);
            longestCommonSubsequence = calculateLongestCommonSubsequence(chunkToBeUpdated);
            if (!longestCommonSubsequence) {
                filteredData = [];
            } else {
                filteredData = filter(dataToBeUpdated, longestCommonSubsequence, updateConfig.chunkSize);
            }
        }
        console.log(`Using "${longestCommonSubsequence}" as the next query. Expecting ${filteredData.length} results and the ids [${filteredData.map(schwinger => schwinger.id).join(', ')}]`)

        let response = await fetchSchwinger(longestCommonSubsequence);
        while (response == null) {
            await wait(3000);
            response = await fetchSchwinger(longestCommonSubsequence);
        }

        const latestSchwinger = transformSchwinger(response);
        console.log(`Got ${latestSchwinger.length} results for "${longestCommonSubsequence}".`)
        if (latestSchwinger.length < chunkToBeUpdated.length) {
            throw new Error(`Got ${latestSchwinger.length} results for "${longestCommonSubsequence}" but expected at least ${chunkToBeUpdated.length} results.`);
        } else if (latestSchwinger.length === chunkToBeUpdated.length) {
            if (!areSchwingerArraysEqual(latestSchwinger, chunkToBeUpdated)) {
                throw new Error(`Got ${latestSchwinger.length} results for "${longestCommonSubsequence}" but expected the same results as before.`);
            }
            console.log(`There are no new elements for "${longestCommonSubsequence}". Replacing the existing elements with the latest elements.`);
            dataToBeUpdated.splice(startOfChunkToBeUpdated, numberOfElementsInChunkToBeUpdated, ...latestSchwinger);
            startOfChunkToBeUpdated += numberOfElementsInChunkToBeUpdated;
        } else {
            // the commented out block does not work because there are cases where the source data has elements where the frist name of some element is equal to the last name of another and and vice versa
            // const lexicographicallySmallestSchwingerName = normalizeSchwingerName(chunkToBeUpdated[0]);
            // for (let i = 0; i < latestSchwinger.length; i++) {
            //     const latestSchwingerName = normalizeSchwingerName(latestSchwinger[i]);
            //     if (latestSchwingerName < lexicographicallySmallestSchwingerName) {
            //         throw new Error(`Implementation defect: Query "${longestCommonSubsequence}" contains "${latestSchwingerName}" which is lexically smaller than the lexically smallest in the chunk to update "${lexicographicallySmallestSchwingerName}".`)
            //     }
            // }
            const idsInChunk = new Set(chunkToBeUpdated.map(obj => obj.id));
            const allExistingIds = new Set(dataToBeUpdated.map(obj => obj.id));
            const itemsToUpdate = latestSchwinger.filter(obj => idsInChunk.has(obj.id));
            console.log(`Updating ${itemsToUpdate.length} elements in the chunk to update with the ids [${itemsToUpdate.map(obj => obj.id).join(', ')}]`);
            for (const itemToUpdate of itemsToUpdate) {
                const index = dataToBeUpdated.findIndex(obj => obj.id === itemToUpdate.id);
                dataToBeUpdated[index] = itemToUpdate;
            }
            const itemsToAdd = latestSchwinger.filter(obj => !allExistingIds.has(obj.id));
            if (itemsToAdd.length === 0) {
                console.log(`Query returned more elements than expected for "${longestCommonSubsequence}" but the unexpected elements are known already. Ignoring the known elements because they will be updated later.`);
            } else {
                console.log(`Adding ${itemsToAdd.length} elements with the ids [${itemsToAdd.map(obj => obj.id).join(', ')}]`);
                dataToBeUpdated.splice(startOfChunkToBeUpdated + numberOfElementsInChunkToBeUpdated, 0, ...itemsToAdd);
                dataToBeUpdated.sort(
                    (a, b) => a.lastName.concat(' ' + a.firstName).toLowerCase().localeCompare(b.lastName.concat(' ' + b.firstName).toLowerCase())
                );
            }
            startOfChunkToBeUpdated += numberOfElementsInChunkToBeUpdated;
        }
    }

    storeSchwingerToFile(dataToBeUpdated, loadConfig);
    await storeSchwingerToDatabase(loadConfig);
}
