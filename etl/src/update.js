import {existingSchwinger} from "./test-data.js";

function wait(milliseconds) {
    console.log(`waiting ${milliseconds / 1000} seconds`);
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Filters the data by the given token and returns the first maxResults which match the sequence defined by the token
 *
 * e.g. token = 'ba' and maxResults = 2 will return the first two Schwinger where `lastName``firstName` match the sequence 'ba'.
 * The sequence in this case can be expressed as a regular expression: /b.*a/
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
            let search = new RegExp(token.split('').join('.*'));
            const name = schwinger.lastName.toLowerCase().concat(' ' + schwinger.firstName.toLowerCase())
            return search.test(name)
        })
        .sort((a, b) => a.lastName.localeCompare(b.lastName))
        .slice(0, maxResults);
}

/**
 * Calculates all subsequences of the given name.
 *
 * @param {string} name
 * @returns {string[]}
 */
function calculateAllSubsequences(name) {
    if (name.length === 0) {
        return [''];
    }

    const firstChar = name[0];
    const restOfString = name.slice(1);

    const subsequencesOfRest = calculateAllSubsequences(restOfString);

    let result = [];
    subsequencesOfRest.forEach(subsequence => {
        result.push(subsequence);
        result.push(firstChar + subsequence);
    });
    return result;
}

function longestCommonSubsequence(a, b) {
    var lcsMatrix = Array(b.length + 1)
        .fill(null)
        .map(() => Array(a.length + 1).fill(null));

    for (let letterInA = 0; letterInA <= a.length; letterInA += 1) {
        lcsMatrix[0][letterInA] = 0;
    }

    for (let letterInB = 0; letterInB <= b.length; letterInB += 1) {
        lcsMatrix[letterInB][0] = 0;
    }

    for (let letterInB = 1; letterInB <= b.length; letterInB += 1) {
        for (let letterInA = 1; letterInA <= a.length; letterInA += 1) {
            if (a[letterInA - 1] === b[letterInB - 1]) {
                lcsMatrix[letterInB][letterInA] = lcsMatrix[letterInB - 1][letterInA - 1] + 1;
            } else {
                lcsMatrix[letterInB][letterInA] = Math.max(lcsMatrix[letterInB - 1][letterInA], lcsMatrix[letterInB][letterInA - 1]);
            }
        }
    }
    let lcs = '';
    let i = b.length;
    let j = a.length;
    while (i > 0 && j > 0) {
        if (a[j - 1] === b[i - 1]) {
            lcs = a[j - 1] + lcs;
            i -= 1;
            j -= 1;
        } else if (lcsMatrix[i - 1][j] > lcsMatrix[i][j - 1] || (lcsMatrix[i - 1][j] === lcsMatrix[i][j - 1] && a[j - 1] > b[i - 1])) {
            i -= 1;
        } else {
            j -= 1;
        }
    }
    return lcs;
}

/**
 * Calculates the longest common subsequence of the given Schwinger data.
 *
 * @param {Schwinger[]} data
 * @returns {any|string}
 */
export function calculateLongestCommonSubsequence(data) {
    const names = data.map(
        schwinger => schwinger.lastName.toLowerCase().concat(' ' + schwinger.firstName.toLowerCase())
    )

    if (names.length < 2) {
        return names[0];
    }

    let lcs = longestCommonSubsequence(names[0], names[1]);
    for (let i = 2; i < names.length - 1; i++) {
        lcs = longestCommonSubsequence(lcs, names[i]);
    }

    return lcs;
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
    // const existingData = await loadAllSchwinger();
    const dataToBeUpdated = existingSchwinger
        .sort((a, b) => a.lastName.concat(' ' + a.firstName).toLowerCase().localeCompare(b.lastName.concat(' ' + b.firstName).toLowerCase()));

    let startOfChunkToBeUpdated = 0;
    while (startOfChunkToBeUpdated <= dataToBeUpdated.length - 1) {
        let numberOfElementsInChunkToBeUpdated = updateConfig.chunkSize;
        let chunkToBeUpdated = dataToBeUpdated.slice(startOfChunkToBeUpdated, startOfChunkToBeUpdated + numberOfElementsInChunkToBeUpdated);
        let longestCommonSubsequence = calculateLongestCommonSubsequence(chunkToBeUpdated);
        let filteredData;
        if (!longestCommonSubsequence) {
            filteredData = [];
        } else {
            filteredData = filter(dataToBeUpdated, longestCommonSubsequence, numberOfElementsInChunkToBeUpdated);
        }
        while (!areSchwingerArraysEqual(chunkToBeUpdated, filteredData)) {
            if (numberOfElementsInChunkToBeUpdated === 2) {
                console.log('foo')
            }
            numberOfElementsInChunkToBeUpdated--;
            if (numberOfElementsInChunkToBeUpdated === 0) {
                throw new Error('Could not find a common subsequence for the given chunk');
            }
            chunkToBeUpdated = dataToBeUpdated.slice(startOfChunkToBeUpdated, startOfChunkToBeUpdated + numberOfElementsInChunkToBeUpdated);
            longestCommonSubsequence = calculateLongestCommonSubsequence(chunkToBeUpdated);
            if (!longestCommonSubsequence) {
                filteredData = [];
            } else {
                filteredData = filter(dataToBeUpdated, longestCommonSubsequence, numberOfElementsInChunkToBeUpdated);
            }
        }
        console.log(`Using "${longestCommonSubsequence}" as the next query. Expecting ${filteredData.length} results and the ids [${filteredData.map(schwinger => schwinger.id).join(', ')}]`)

        let response = await fetchSchwinger(longestCommonSubsequence);
        while (response == null) {
            await wait(3000);
            response = await fetchSchwinger(longestCommonSubsequence);
        }

        const latestSchwinger = transformSchwinger(response);
        if (latestSchwinger[latestSchwinger.length - 1] === dataToBeUpdated[startOfChunkToBeUpdated + latestSchwinger.length - 1] && !areSchwingerArraysEqual(chunkToBeUpdated, latestSchwinger)) {
            console.log(`Got ${latestSchwinger.length} results for "${longestCommonSubsequence}". Updating the chunk with the ids [${latestSchwinger.map(schwinger => schwinger.id).join(', ')}]`)
        } else {
            console.log(`Got ${latestSchwinger.length} results for "${longestCommonSubsequence}". The chunk is already up to date.`)
        }
        dataToBeUpdated.splice(startOfChunkToBeUpdated, numberOfElementsInChunkToBeUpdated, ...latestSchwinger);
        startOfChunkToBeUpdated += latestSchwinger.length;
    }

    storeSchwingerToFile(dataToBeUpdated, loadConfig);
    await storeSchwingerToDatabase(loadConfig);
}
