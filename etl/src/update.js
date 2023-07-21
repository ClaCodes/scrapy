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
            const name = schwinger.lastName.toLowerCase().concat(schwinger.firstName.toLowerCase())
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

/**
 * Calculates the longest common subsequence of the given Schwinger data.
 *
 * @param {Schwinger[]} data
 * @returns {any|string}
 */
export function calculateLongestCommonSubsequence(data) {
    const names = data.map(
        schwinger => schwinger.lastName.toLowerCase().concat(schwinger.firstName.toLowerCase())
    );
    let firstFullSchwingerName = names[0];
    let subsequences = calculateAllSubsequences(firstFullSchwingerName);

    let sortedSubsequences = Array.from(subsequences)
        .sort((a, b) => b.length - a.length);

    for (let subsequence of sortedSubsequences) {
        let regex = new RegExp(subsequence.split('').join('.*'));
        if (names.every(name => regex.test(name))) {
            return subsequence;
        }
    }

    return '';
}

export function updateSchwinger() {
    // basic idea:
    // 1. get all Schwinger from the database
    // 2. take a subset of the Schwinger of size 14, e.g. 0-14
    // 3. calculate the longest common subsequence of the subset
    // 3.1 if the longest common subsequence is empty, decrease the subset size by 1 and go to 3. keep track of the subset size.
    // 3.2 if the longest common subsequence is the same as the previous longest common subsequence, decrease the subset size by 1 and go to 3. keep track of the subset size.
    // 4. query the API with the longest common subsequence
    // 5. check if the API response is the same as the subset
    // 5.1 if the API response is the same as the subset, go to 3 and continue based on the tracked subset size. start again with a subset of size 14.
    // 5.2 if the API response is not the same as the subset, identify the new Schwinger and update the data and keep track of the data to be updated in the database
    // 6. do the above steps until the end of the data is reached
    // 7. update the database with the new data
}
