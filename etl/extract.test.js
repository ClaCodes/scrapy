import {
    appendAlphabeticallyToFirstName,
    appendAlphabeticallyToLastName,
    determineWhatToExpand,
    extractSchwinger,
    numberOfSuggestionsStartingWithLastNameToken,
    reachedEndOfAlphabet,
    updateSearchState
} from "./extract.js";

import {
    response_for_a_,
    response_for_abd_,
    response_for_abe_,
    response_for_abf_,
    response_for_ac_, response_for_ach_
} from "./extract-test-data.js";

describe('When extracting data', () => {

    const emptyResponse = [];
    const allStartWithA = [
        {"value": "Abächerli Fabio", "data": {"_id": 1}},
        {"value": "Abächerli Lars", "data": {"_id": 2}},
        {"value": "Abächerli Marco", "data": {"_id": 3}},
        {"value": "Abaya Jasin", "data": {"_id": 4}},
        {"value": "Abbühl Janik", "data": {"_id": 5}},
        {"value": "Abbühl Jonas", "data": {"_id": 6}},
        {"value": "Abbühl Levin", "data": {"_id": 7}},
        {"value": "Abbühl Marc", "data": {"_id": 8}},
        {"value": "Abbühl Mike", "data": {"_id": 9}},
        {"value": "Abderhalden Adrian", "data": {"_id": 10}},
        {"value": "Abderhalden Beat", "data": {"_id": 11}},
        {"value": "Abderhalden Deon", "data": {"_id": 12}},
        {"value": "Abderhalden Jörg", "data": {"_id": 13}},
        {"value": "Abderhalden Lukas", "data": {"_id": 14}},
        {"value": "Abderhalden Maurice", "data": {"_id": 15}}
    ];
    const fourStartWithA = [
        {"value": "Abegg Robin", "data": {"_id": 19}},
        {"value": "Abegg Silvan", "data": {"_id": 20}},
        {"value": "Abegglen Markus", "data": {"_id": 21}},
        {"value": "Aberle Linus", "data": {"_id": 22}},
        {"value": "Egli Isabel", "data": {"_id": 3013}},
        {"value": "Feierabend Rolf", "data": {"_id": 3437}},
        {"value": "Gaber Karim", "data": {"_id": 3886}},
        {"value": "Gilabert Gervais", "data": {"_id": 4256}},
        {"value": "Graber Alfred", "data": {"_id": 4479}},
        {"value": "Graber Andreas", "data": {"_id": 4480}},
        {"value": "Graber B\u00e4nz", "data": {"_id": 4481}},
        {"value": "Graber Bruno", "data": {"_id": 4482}},
        {"value": "Graber Colin", "data": {"_id": 4483}},
        {"value": "Graber Daniel", "data": {"_id": 4484}},
        {"value": "Graber Felix", "data": {"_id": 4485}}
    ]

    describe('the number of relevant suggestions in the response', () => {
        it('should be 0 for an empty response', () => {
            const initialSearchState = {
                expanding: "lastName",
                firstNameStopToken: 'zzz',
                firstNameToken: "",
                lastNameStopToken: 'zzz',
                lastNameToken: "",
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 0
            }

            expect(numberOfSuggestionsStartingWithLastNameToken(emptyResponse, initialSearchState))
                .toBe(0);
        });

        it('should be 15 for if all start with "a" and last name token is "a"', () => {
            const initialSearchState = {
                expanding: "lastName",
                firstNameStopToken: 'zzz',
                firstNameToken: "",
                lastNameStopToken: 'zzz',
                lastNameToken: "a",
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 0
            }

            expect(numberOfSuggestionsStartingWithLastNameToken(allStartWithA, initialSearchState))
                .toBe(15);
        });

        it('should be 4 if only 4 suggestions start with "a" and last name token is "a"', () => {
            const initialSearchState = {
                expanding: "lastName",
                firstNameStopToken: 'zzz',
                firstNameToken: "",
                lastNameStopToken: 'zzz',
                lastNameToken: "a",
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 0
            }

            expect(numberOfSuggestionsStartingWithLastNameToken(fourStartWithA, initialSearchState))
                .toBe(4);
        });
    });

    describe('the search state', () => {
        const initialSearchState = {
            expanding: "lastName",
            firstNameStopToken: 'zzz',
            firstNameToken: "",
            lastNameStopToken: 'zzz',
            lastNameToken: "",
            maximumNumberOfSuggestions: 15,
            totalOfEvaluatedSearchTokens: 0
        }

        it('should be possible to patch the search state by e.g. updating the lastNameToken', () => {
            const updatedSearchState = updateSearchState(initialSearchState, (searchState) => {
                searchState.lastNameToken = "patchedLastNameToken";
            });

            expect(updatedSearchState).toMatchObject({
                ...initialSearchState,
                lastNameToken: "patchedLastNameToken"
            })
        });
    });

    describe('the determination of what should be expanded', () => {

        it('should be "lastName" if not all the suggestions start with the same last name', () => {
            const sameLastNameForAllSuggestions = [
                {"value": "Abächerli Fabio", "data": {"_id": 1}},
                {"value": "Abächerli Lars", "data": {"_id": 2}},
                {"value": "Abächerli Marco", "data": {"_id": 3}},
                {"value": "Abächerli Jasin", "data": {"_id": 4}},
                {"value": "Abächerli Janik", "data": {"_id": 5}},
                {"value": "Abächerli Jonas", "data": {"_id": 6}},
                {"value": "Abächerli Levin", "data": {"_id": 7}},
                {"value": "Abächerli Marc", "data": {"_id": 8}},
                {"value": "Abächerli Mike", "data": {"_id": 9}},
                {"value": "Abächerli Adrian", "data": {"_id": 10}},
                {"value": "Abächerli Beat", "data": {"_id": 11}},
                {"value": "Abächerli Deon", "data": {"_id": 12}},
                {"value": "Abächerli Jörg", "data": {"_id": 13}},
                {"value": "Abächerli Lukas", "data": {"_id": 14}},
                {"value": "Different Maurice", "data": {"_id": 15}}
            ]
            const initialSearchState = {};

            const searchState = determineWhatToExpand(sameLastNameForAllSuggestions, initialSearchState);

            expect(searchState.expanding).toBe('lastName');
        });

        it('should be "firstName" if all the suggestions start with the same last name', () => {
            const sameLastNameForAllSuggestions = [
                {"value": "Abächerli Fabio", "data": {"_id": 1}},
                {"value": "Abächerli Lars", "data": {"_id": 2}},
                {"value": "Abächerli Marco", "data": {"_id": 3}},
                {"value": "Abächerli Jasin", "data": {"_id": 4}},
                {"value": "Abächerli Janik", "data": {"_id": 5}},
                {"value": "Abächerli Jonas", "data": {"_id": 6}},
                {"value": "Abächerli Levin", "data": {"_id": 7}},
                {"value": "Abächerli Marc", "data": {"_id": 8}},
                {"value": "Abächerli Mike", "data": {"_id": 9}},
                {"value": "Abächerli Adrian", "data": {"_id": 10}},
                {"value": "Abächerli Beat", "data": {"_id": 11}},
                {"value": "Abächerli Deon", "data": {"_id": 12}},
                {"value": "Abächerli Jörg", "data": {"_id": 13}},
                {"value": "Abächerli Lukas", "data": {"_id": 14}},
                {"value": "Abächerli Maurice", "data": {"_id": 15}}
            ]
            const initialSearchState = {};

            const searchState = determineWhatToExpand(sameLastNameForAllSuggestions, initialSearchState);

            expect(searchState.expanding).toBe('firstName');
        });

    });

    describe('updating the search token by expanding the last name', () => {

        it('should return null for empty suggestions', () => {
            const emptySuggestions = [];
            const initialSearchState = {};

            expect(() => appendAlphabeticallyToLastName(emptySuggestions, initialSearchState)).toThrow();
        });

        it('should return "abd" for maxiumum number of suggestions because "d" is the first letter that differs between Abderhalden and Abbühl', () => {
            const fullSuggestions = [
                {"value": "Abächerli Fabio", "data": {"_id": 1}},
                {"value": "Abächerli Lars", "data": {"_id": 2}},
                {"value": "Abächerli Marco", "data": {"_id": 3}},
                {"value": "Abaya Jasin", "data": {"_id": 4}},
                {"value": "Abbühl Janik", "data": {"_id": 5}},
                {"value": "Abbühl Jonas", "data": {"_id": 6}},
                {"value": "Abbühl Levin", "data": {"_id": 7}},
                {"value": "Abbühl Marc", "data": {"_id": 8}},
                {"value": "Abbühl Mike", "data": {"_id": 9}},
                {"value": "Abderhalden Adrian", "data": {"_id": 10}},
                {"value": "Abderhalden Beat", "data": {"_id": 11}},
                {"value": "Abderhalden Deon", "data": {"_id": 12}},
                {"value": "Abderhalden Jörg", "data": {"_id": 13}},
                {"value": "Abderhalden Lukas", "data": {"_id": 14}},
                {"value": "Abderhalden Maurice", "data": {"_id": 15}}
            ]
            const initialSearchState = {
                lastNameToken: "ab"
            };

            const searchState = appendAlphabeticallyToLastName(fullSuggestions, initialSearchState);

            expect(searchState.lastNameToken).toBe("abd");
        });

    });

    describe('updating the search token by expanding the first name', () => {
        it('should throw an error for empty suggestions', () => {
            const emptySuggestions = [];
            const initialSearchState = {};

            expect(() => appendAlphabeticallyToFirstName(emptySuggestions, initialSearchState)).toThrow();
        });

        it('should return full last name and first letter of first name of last suggestion if it is the same for all suggestions', () => {
            const sameLastNameForAllSuggestions = [
                {"value": "Abächerli Fabio", "data": {"_id": 1}},
                {"value": "Abächerli Lars", "data": {"_id": 2}},
                {"value": "Abächerli Marco", "data": {"_id": 3}},
                {"value": "Abächerli Jasin", "data": {"_id": 4}},
                {"value": "Abächerli Janik", "data": {"_id": 5}},
                {"value": "Abächerli Jonas", "data": {"_id": 6}},
                {"value": "Abächerli Levin", "data": {"_id": 7}},
                {"value": "Abächerli Marc", "data": {"_id": 8}},
                {"value": "Abächerli Mike", "data": {"_id": 9}},
                {"value": "Abächerli Adrian", "data": {"_id": 10}},
                {"value": "Abächerli Beat", "data": {"_id": 11}},
                {"value": "Abächerli Deon", "data": {"_id": 12}},
                {"value": "Abächerli Jörg", "data": {"_id": 13}},
                {"value": "Abächerli Lukas", "data": {"_id": 14}},
                {"value": "Abächerli Maurice", "data": {"_id": 15}}
            ]
            const initialSearchState = {
                lastNameToken: 'ab'
            };

            const searchState = appendAlphabeticallyToFirstName(sameLastNameForAllSuggestions, initialSearchState);

            expect(searchState.firstNameToken).toBe("abächerli m");
        });
    });

    describe('checking if the search token reached the end of the alphabet', () => {
        describe('for the last name', () => {
            it('should return true if the search token ends with "z"', () => {
                const lastNameTokensEndingWithZ = [
                    "z",
                    "az",
                    "abz",
                    "abcz",
                ];

                lastNameTokensEndingWithZ.forEach(lastNameToken => {
                    const searchState = {
                        lastNameToken,
                    }

                    expect(reachedEndOfAlphabet(searchState, 'lastName')).toBe(true);
                })
            });

            it('should return false if the search token does not end with "z"', () => {
                const lastNameTokensNotEndingWithZ = [
                    "a",
                    "bb",
                    "ccc",
                    "dddd",
                    "za",
                    "bzb",
                ];

                lastNameTokensNotEndingWithZ.forEach(lastNameToken => {
                    const searchState = {
                        lastNameToken,
                    }

                    expect(reachedEndOfAlphabet(searchState, 'lastName')).toBe(false);
                })
            });
        });

        describe('for the fist name', () => {
            it('should return true if the search token ends with "z"', () => {
                const firstNameTokensEndingWithZ = [
                    "z",
                    "az",
                    "abz",
                    "abcz",
                ];

                firstNameTokensEndingWithZ.forEach(firstNameToken => {
                    const searchState = {
                        firstNameToken,
                    }

                    expect(reachedEndOfAlphabet(searchState, 'firstName')).toBe(true);
                })
            });

            it('should return false if the search token does not end with "z"', () => {
                const firstNameTokensNotEndingWithZ = [
                    "a",
                    "bb",
                    "ccc",
                    "dddd",
                    "za",
                    "bzb",
                ];

                firstNameTokensNotEndingWithZ.forEach(firstNameToken => {
                    const searchState = {
                        firstNameToken,
                    }

                    expect(reachedEndOfAlphabet(searchState, 'firstName')).toBe(false);
                })
            });
        });
    })

    describe('extracting schwinger', () => {
        const schwingerFetcher = (url) => {
            switch (url) {
                case 'https://zwilch.ch/api/v2/schwinger/a%20':
                    return Promise.resolve(response_for_a_);
                case 'https://zwilch.ch/api/v2/schwinger/abd%20':
                    return Promise.resolve(response_for_abd_);
                case 'https://zwilch.ch/api/v2/schwinger/abe%20':
                    return Promise.resolve(response_for_abe_);
                case 'https://zwilch.ch/api/v2/schwinger/abf%20':
                    return Promise.resolve(response_for_abf_);
                case 'https://zwilch.ch/api/v2/schwinger/abg%20':
                    return Promise.resolve(response_for_abg_);
                case 'https://zwilch.ch/api/v2/schwinger/ac%20':
                    return Promise.resolve(response_for_ac_);
                case 'https://zwilch.ch/api/v2/schwinger/ach%20':
                    return Promise.resolve(response_for_ach_);
                default:
                    throw new Error(`Unexpected url: ${url}`);
            }
        }

        it('should be possible to search from "a " to "abd "', async () => {
            const initialSearchState = {
                expanding: 'lastName',
                firstNameStopToken: '',
                firstNameToken: '',
                lastNameStopToken: 'abd',
                lastNameToken: 'a',
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 0
            }

            const searchState = await extractSchwinger(initialSearchState, schwingerFetcher);

            expect(searchState).toEqual({
                expanding: 'lastName',
                firstNameStopToken: '',
                firstNameToken: '',
                lastNameStopToken: 'abd',
                lastNameToken: 'abd',
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 1
            });
        })

        it('should be possible to search from "abd " to "abe "', async () => {
            const initialSearchState = {
                expanding: 'lastName',
                firstNameStopToken: '',
                firstNameToken: '',
                lastNameStopToken: 'abe',
                lastNameToken: 'abd',
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 0
            }

            const searchState = await extractSchwinger(initialSearchState, schwingerFetcher);

            expect(searchState).toEqual({
                expanding: 'lastName',
                firstNameStopToken: '',
                firstNameToken: '',
                lastNameStopToken: 'abe',
                lastNameToken: 'abe',
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 1
            });
        })

        it('should be possible to search from "abe " to "abf "', async () => {
            const initialSearchState = {
                expanding: 'lastName',
                firstNameStopToken: '',
                firstNameToken: '',
                lastNameStopToken: 'abf',
                lastNameToken: 'abe',
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 0
            }

            const searchState = await extractSchwinger(initialSearchState, schwingerFetcher);

            expect(searchState).toEqual({
                expanding: 'lastName',
                firstNameStopToken: '',
                firstNameToken: '',
                lastNameStopToken: 'abf',
                lastNameToken: 'abf',
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 1
            });
        })

        it('should be possible to search from "abf " to "abg "', async () => {
            const initialSearchState = {
                expanding: 'lastName',
                firstNameStopToken: '',
                firstNameToken: '',
                lastNameStopToken: 'abg',
                lastNameToken: 'abf',
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 0
            }

            const searchState = await extractSchwinger(initialSearchState, schwingerFetcher);

            expect(searchState).toEqual({
                expanding: 'lastName',
                firstNameStopToken: '',
                firstNameToken: '',
                lastNameStopToken: 'abg',
                lastNameToken: 'abg',
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 1
            });
        })

        it('should be possible to search from "ac " to "ach "', async () => {
            const initialSearchState = {
                expanding: 'lastName',
                firstNameStopToken: '',
                firstNameToken: '',
                lastNameStopToken: 'ach',
                lastNameToken: 'ac',
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 0
            }

            const searchState = await extractSchwinger(initialSearchState, schwingerFetcher);

            expect(searchState).toEqual({
                expanding: 'lastName',
                firstNameStopToken: '',
                firstNameToken: '',
                lastNameStopToken: 'ach',
                lastNameToken: 'ach',
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 1
            });
        })

        it('should be possible to search from "ach " to "ache "', async () => {
            const initialSearchState = {
                expanding: 'lastName',
                firstNameStopToken: '',
                firstNameToken: '',
                lastNameStopToken: 'ache',
                lastNameToken: 'ach',
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 0
            }

            const searchState = await extractSchwinger(initialSearchState, schwingerFetcher);

            expect(searchState).toEqual({
                expanding: 'lastName',
                firstNameStopToken: '',
                firstNameToken: '',
                lastNameStopToken: 'ache',
                lastNameToken: 'ache',
                maximumNumberOfSuggestions: 15,
                totalOfEvaluatedSearchTokens: 1
            });
        })
    });
});
