import {applySuggestions, calculateNextSearch, currentSearchValue, OptimizationStrategy} from "./search.js";

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
        const searchValue = search.optimizationStrategy === OptimizationStrategy.mixed ? currentSearchValue(search).substring(0, 2) + ' ' + currentSearchValue(search).substring(2) : currentSearchValue(search);
        const response = await fetchSchwinger(
            `https://zwilch.ch/api/v2/schwinger/${encodeURIComponent(searchValue)}`
        );
        // wait because of rate limit
        if (response == null) {
            await wait(3000);
        } else {
            const transformedSchwinger = transformSchwinger(response);
            console.log(`Extracted ${transformedSchwinger.length} Schwinger for search ${searchValue}`);
            const loadStats = await loadSchwinger(transformedSchwinger, loadConfig);
            console.log(loadStats);
            const suggestions = response['suggestions'] || [];
            search = applySuggestions(search, suggestions);
            search = calculateNextSearch(search);
        }
    }
    return search;
}
