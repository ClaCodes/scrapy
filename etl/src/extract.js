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
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function numberOfSuggestions(allSuggestions) {
    if (allSuggestions == null) {
        return 0;
    }
    return allSuggestions.length;
}

export function numberOfSuggestionsStartingWithLastNameToken(allSuggestions, searchState) {
    if (!allSuggestions) {
        return 0;
    }
    const relevantSuggestions = allSuggestions.filter(suggestion => suggestion.value.toLowerCase().startsWith(searchState.lastNameToken));
    return relevantSuggestions.length;
}

export function determineWhatToExpand(suggestions, searchState) {
    const lastSuggestion = suggestions[14]
    const lastNameOfLastSuggestion = lastSuggestion["value"].split(' ')[0];
    const otherLastNames = suggestions.filter(suggestion => {
        const lastName = suggestion["value"].split(' ')[0];
        return lastNameOfLastSuggestion !== lastName;
    });

    if (otherLastNames.length === 0) {
        return updateSearchState(searchState, (searchState) => {
            searchState.expanding = 'firstName';
        });
    } else {
        return updateSearchState(searchState, (searchState) => {
            searchState.expanding = 'lastName';
        });
    }
}

export function updateSearchState(searchState, mutate) {
    let updatedSearchState = {
        ...searchState,
    }
    mutate(updatedSearchState);
    return updatedSearchState;
}

export function appendAlphabeticallyToFirstName(allSuggestions, searchState) {
    if (!allSuggestions || allSuggestions.length === 0) {
        throw new Error('no suggestions to append to first name');
    }
    const relevantSuggestions = allSuggestions.filter(suggestion => suggestion.value.toLowerCase().startsWith(searchState.lastNameToken));
    const lastSuggestion = relevantSuggestions[relevantSuggestions.length - 1]
    const lastNameOfLastSuggestion = lastSuggestion["value"].split(' ')[0];
    const firstName = lastSuggestion["value"].split(' ')[1].toLowerCase();
    const newSearchTokenBasedOnFullLastName = lastNameOfLastSuggestion + ' ' + firstName[0];
    return updateSearchState(searchState, (searchState) => {
        searchState.expanding = 'firstName';
        searchState.firstNameToken = newSearchTokenBasedOnFullLastName.toLowerCase();
    });
}

function incrementToken(token) {
    const lastLetterOfToken = token[token.length - 1];
    let nextLetterOfToken = String.fromCharCode(lastLetterOfToken.charCodeAt(0) + 1);
    if (nextLetterOfToken > 'z') {
        nextLetterOfToken = 'a';
    }
    return token.slice(0, -1) + nextLetterOfToken;
}

export function incrementSearchToken(searchState, token) {
    if (token === 'firstName') {
        return updateSearchState(searchState, (searchState) => {
            searchState.firstNameToken = incrementToken(searchState.firstNameToken);
        });
    } else if (token === 'lastName') {
        return updateSearchState(searchState, (searchState) => {
            searchState.lastNameToken = incrementToken(searchState.lastNameToken);
        });
    } else {
        throw new Error('unknown token: ' + token);
    }
}

export function appendAlphabeticallyToLastName(allSuggestions, searchState) {
    if (!allSuggestions || allSuggestions.length === 0) {
        throw new Error('no suggestions to append to last name');
    }
    const relevantSuggestions = allSuggestions.filter(suggestion => suggestion.value.toLowerCase().startsWith(searchState.lastNameToken));
    const lastSuggestion = relevantSuggestions[relevantSuggestions.length - 1]
    const lastNameOfLastSuggestion = lastSuggestion["value"].split(' ')[0];
    let indexOfPreviousSuggestion = Math.max(relevantSuggestions.length - 2, 0);
    // more than one distinct last name
    while (indexOfPreviousSuggestion >= 0) {
        const previousSuggestion = relevantSuggestions[indexOfPreviousSuggestion]
        const lastNameOfPreviousSuggestion = previousSuggestion["value"].split(' ')[0];
        if (lastNameOfPreviousSuggestion === lastNameOfLastSuggestion) {
            indexOfPreviousSuggestion--;
        } else {
            let newSearchTokenBasedOnNameDiff = '';
            for (let i = 0; i < lastNameOfLastSuggestion.length; i++) {
                if (lastNameOfLastSuggestion[i] === lastNameOfPreviousSuggestion[i]) {
                    newSearchTokenBasedOnNameDiff += lastNameOfLastSuggestion[i];
                } else {
                    newSearchTokenBasedOnNameDiff += lastNameOfLastSuggestion[i]
                    return updateSearchState(searchState, (searchState) => {
                        searchState.expanding = 'lastName';
                        searchState.lastNameToken = newSearchTokenBasedOnNameDiff.toLowerCase();
                    });
                }
            }
        }
    }
    // only one distinct last name
    return updateSearchState(searchState, (searchState) => {
        searchState.expanding = 'lastName';
        searchState.lastNameToken = searchState.lastNameToken + lastNameOfLastSuggestion[searchState.lastNameToken.length];
    });
}

export function reachedEndOfAlphabet(searchState, token) {
    if (token === 'firstName') {
        return searchState.firstNameToken[searchState.firstNameToken.length - 1] === 'z';
    } else if (token === 'lastName') {
        return searchState.lastNameToken[searchState.lastNameToken.length - 1] === 'z';
    } else {
        throw new Error('unknown token: ' + token);
    }
}

function resetFirstNameToken(searchState) {
    return updateSearchState(searchState, (searchState) => {
        searchState.expanding = 'lastName';
        searchState.firstNameToken = '';
    });
}

function removeLastLetterFromLastNameToken(searchState) {
    return updateSearchState(searchState, (searchState) => {
        searchState.expanding = 'lastName';
        searchState.lastNameToken = searchState.lastNameToken.slice(0, -1);
    });
}

function lastSuggestionStartsWithLastNameToken(suggestions, searchState) {
    const lastSuggestion = suggestions[suggestions.length - 1];
    const lastNameOfLastSuggestion = lastSuggestion["value"].split(' ')[0];
    return lastNameOfLastSuggestion.toLowerCase().startsWith(searchState.lastNameToken);
}

function createSearchToken(searchState) {
    if (searchState.expanding === 'firstName') {
        return encodeURIComponent(searchState.firstNameToken);
    } else if (searchState.expanding === 'lastName') {
        return encodeURIComponent(searchState.lastNameToken);
    } else {
        throw new Error('unknown expanding: ' + searchState.expanding);
    }
}

export async function extractSchwinger(initialSearchState, fetchSchwinger, transformSchwinger, loadSchwinger) {
    let searchState = initialSearchState;
    const loadConfig = {
        path: `./dist/data/${new Date().toISOString()}_schwinger.json`,
    }
    while (searchState.lastNameToken < searchState.lastNameStopToken) {
        const searchToken = createSearchToken(searchState);
        const response = await fetchSchwinger(
            `https://zwilch.ch/api/v2/schwinger/${searchToken}`
        );
        // wait because of rate limit
        if (response == null) {
            console.log('rate limit reached, waiting 2 seconds');
            await wait(3000);
        } else {
            const transformedSchwinger = transformSchwinger(response);
            const result = await loadSchwinger(transformedSchwinger, loadConfig);
            console.log(result);
            /**
             * We have the max number of suggestions.
             * This means we have to distinguish between the following cases:
             * 1. all suggestions start with the same last name -> expand first name
             * 2.not all suggestions start with the same last name -> expand last name
             * */
            if (numberOfSuggestions(response['suggestions']) === searchState.maximumNumberOfSuggestions) {
                const suggestions = response['suggestions'];
                searchState = determineWhatToExpand(suggestions, searchState)
                if (searchState.expanding === 'firstName') {
                    searchState = appendAlphabeticallyToFirstName(suggestions, searchState)
                } else if (searchState.expanding === 'lastName') {
                    // we have the max number of suggestions but we need to check the following:
                    // 1. all suggestions start with the search token for the last name -> append alphabetically to last name
                    // 2. not all suggestions start with the search token for the last name but the last suggestion does -> append alphabetically to last name
                    // 3. not all suggestions start with the search token for the last name and the last suggestion does not -> increment last name token
                    if (numberOfSuggestionsStartingWithLastNameToken(suggestions, searchState) === searchState.maximumNumberOfSuggestions) {
                        searchState = appendAlphabeticallyToLastName(suggestions, searchState)
                    } else if (lastSuggestionStartsWithLastNameToken(suggestions, searchState)) {
                        searchState = appendAlphabeticallyToLastName(suggestions, searchState)
                    } else {
                        searchState = incrementSearchToken(searchState, 'lastName');
                    }
                } else {
                    throw new Error('unexpected expanding state: ' + searchState.expanding)
                }
                searchState = updateSearchState(searchState, (searchState) => {
                    searchState.totalOfEvaluatedSearchTokens = searchState.totalOfEvaluatedSearchTokens + 1;
                });

            }
            /**
             * We have less than the max number of suggestions.
             * This means we have to distinguish between the following cases:
             * 1. we were expanding the first name
             *      a. we did not reach the end of the alphabet -> expand last first name
             *      b. we reached the end of the alphabet -> determine next search token based on last name
             * 2. we were expanding the last name
             *      a. we did not reach the end of the alphabet -> expand last name
             *      b. we reached the end of the alphabet -> determine next search token based on last name
             * */
            else {
                if (searchState.expanding === 'firstName') {
                    if (reachedEndOfAlphabet(searchState, 'firstName')) {
                        searchState = resetFirstNameToken(searchState);
                        searchState = incrementSearchToken(searchState, 'lastName');
                    } else {
                        searchState = incrementSearchToken(searchState, 'firstName');
                    }
                } else if (searchState.expanding === 'lastName') {
                    if (reachedEndOfAlphabet(searchState, 'lastName')) {
                        searchState = removeLastLetterFromLastNameToken(searchState);
                        searchState = incrementSearchToken(searchState, 'lastName');
                    } else {
                        searchState = incrementSearchToken(searchState, 'lastName');
                    }
                } else {
                    throw new Error('unexpected expanding state: ' + searchState.expanding)
                }
                searchState = updateSearchState(searchState, (searchState) => {
                    searchState.totalOfEvaluatedSearchTokens = searchState.totalOfEvaluatedSearchTokens + 1;
                });
            }
        }
    }
    return searchState;
}
