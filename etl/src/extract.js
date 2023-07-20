import {applySuggestions, calculateNextSearch, currentSearchValue} from "./search.js";

export const fetchSchwinger = async (url) => {
    return fetch(url)
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

function wait(milliseconds) {
    console.log(`waiting ${milliseconds / 1000} seconds`);
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export async function extractSchwinger(initialSearch, fetchSchwinger, transformSchwinger, loadSchwinger, loadConfig) {
    let search = initialSearch;
    while (currentSearchValue(search) < search.stopToken) {
        console.log('Current search is: \n', JSON.stringify(search));
        const response = await fetchSchwinger(
            `https://zwilch.ch/api/v2/schwinger/${encodeURIComponent(currentSearchValue(search))}`
        );
        // wait because of rate limit
        if (response == null) {
            await wait(3000);
        } else {
            const transformedSchwinger = transformSchwinger(response);
            const loadStats = await loadSchwinger(transformedSchwinger, loadConfig);
            console.log(loadStats);
            const suggestions = response['suggestions'] || [];
            search = applySuggestions(search, suggestions);
            search = calculateNextSearch(search);
        }
    }
    return search;
}
