import {
    createSearch,
    incrementToken,
    applySuggestions,
    calculateNextSearch,
    currentSearchValue,
    isSearchExhausted, searchValueInternal, isBetween
} from "./search.js";

describe('The search', () => {

    it('should be possible to create a search with an initial value', () => {
        const initialSearch = createSearch('initial value', 'stop value');

        expect(initialSearch).toMatchObject({
            jumps: [],
            stopToken: 'stop value',
            value: 'initial value',
        });
    });

    describe('when checking if a letter is within a specific range', () => {

        it('should return true if the letter is within the range', () => {
            const letterBetweenStartAndEnd = [
                ['a', 'a', 'z'],
                ['a', 'b', 'z'],
                ['a', 'y', 'z'],
            ];

            letterBetweenStartAndEnd.forEach(([start, value, end]) => {
                expect(isBetween(start, value, end)).toBe(true);
            });
        });

        it('should return false if the letter is not within the range', () => {
            const letterNotBetweenStartAndEnd = [
                ['a', '!', 'z'],
                ['a', ' ', 'z'],
                ['a', 'z', 'z'],
            ];

            letterNotBetweenStartAndEnd.forEach(([start, value, end]) => {
                expect(isBetween(start, value, end)).toBe(false);
            });
        });
    });

    describe('when incrementing the search token', () => {

        it('should increment the last letter of the token by one if it is between "a" and "z"', () => {
            const tokens = [
                'a',
                'b',
                'y',
                'aa',
                'bb',
                'yy',
                'aaa',
                'bbb',
                'yyy',
            ];

            const expected = [
                'b',
                'c',
                'z',
                'ab',
                'bc',
                'yz',
                'aab',
                'bbc',
                'yyz',
            ];

            tokens.forEach((token, index) => {
                expect(incrementToken(token)).toEqual(expected[index]);
            })
        })

        it('should increment the token to "aa" if the length is 1 and it is not between "a" and "z"', () => {
            const tokens = [
                // before z
                '!',
                ' ',
                '1',
                'z',
                // after z
                '{',
                '|',
            ];

            tokens.forEach(
                (token) => expect(incrementToken(token)).toEqual('aa')
            );

            expect(incrementToken('z')).toEqual('aa');
        });

        it('should increment the second last letter by one and remove the last letter if the last letter is not between "a" and "z" and the second last letter is between "a" and "z"', () => {
            const tokens = [
                'az',
                'bz',
                'yz',
                'aaz',
                'bbz',
                'yyz',
                'aaaz',
                'bbbz',
                'yyyz',
            ];

            const expected = [
                'b',
                'c',
                'z',
                'ab',
                'bc',
                'yz',
                'aab',
                'bbc',
                'yyz',
            ];

            tokens.forEach((token, index) => {
                expect(incrementToken(token)).toEqual(expected[index]);
            })
        });

        it('should replace the last "z" by "aa" if both the last and second letter are not between "a" and "z" and the second last letter is not before "a"', () => {
            const tokens = [
                'zz',
                'zzz',
                'xzz',
                'zzzz',
                'zzzzz',
            ];

            const expected = [
                'zaa',
                'zzaa',
                'xzaa',
                'zzzaa',
                'zzzzaa',
            ];

            tokens.forEach((token, index) => {
                expect(incrementToken(token)).toEqual(expected[index]);
            });
        });

        it('should replace the last two letters by "aa" if both the last and second letter are not between "a" and "z" and the second last letter is before "a"', () => {
            const tokens = [
                ' z',
                'z!z',
                'x1z',
                'zz?z',
                'zzz]z',
            ];

            const expected = [
                'aa',
                'zaa',
                'xaa',
                'zzaa',
                'zzzaa',
            ];

            tokens.forEach((token, index) => {
                expect(incrementToken(token)).toEqual(expected[index]);
            });
        });
    })

    describe('when applying the resulting suggestions', () => {

        it('should do nothing if there are no suggestions and there are no jumps', () => {
            const initialSearch = createSearch('search token');

            const updatedSearch = applySuggestions(
                initialSearch,
                [
                    {value: 'does not match'},
                    {value: 'does not match either'},
                ]
            );

            expect(updatedSearch).toMatchObject({
                value: 'search token',
                jumps: [],
            });
        });

        it('should exhaust the jump if one exists and no suggestions matched it', () => {
            const initialSearch = createSearch('search token');
            const jumpedSearch = applySuggestions(
                initialSearch,
                [
                    {value: 'search token'},
                    {value: 'search token 1'},
                ]
            );

            const updatedSearch = applySuggestions(
                jumpedSearch,
                []
            );


            expect(updatedSearch).toMatchObject({
                value: 'search token',
                jumps: [
                    {
                        value: 'search token 1',
                        state: 'exhausting',
                    }
                ],
            });
        });

        it('should do nothing if there are suggestions but none of them is a prefix search value and there are no jumps', () => {
            const initialSearch = createSearch('search token');

            const updatedSearch = applySuggestions(
                initialSearch,
                [
                    {value: 'does not match'},
                    {value: 'does not match either'},
                ]
            );

            expect(updatedSearch).toMatchObject({
                ...initialSearch,
            });
        });

        it('should set the state of the last jump to "exhausting" if there are suggestions but none of them is a prefix search value and there are jumps', () => {
            const initialSearch = {
                ...createSearch('a search token'),
                jumps: [
                    {
                        value: 'b search token',
                        state: 'jumped',
                    },
                    {
                        value: 'c search token',
                        state: 'jumped',
                    },
                ]
            };

            const updatedSearch = applySuggestions(
                initialSearch,
                [
                    {value: 'does not match'},
                    {value: 'does not match either'},
                ]
            );

            expect(updatedSearch).toMatchObject({
                ...initialSearch,
                jumps: [
                    {
                        value: 'b search token',
                        state: 'jumped',
                    },
                    {
                        value: 'c search token',
                        state: 'exhausting',
                    },
                ]
            });
        });

        it('should jump if the search token is a prefix of at least one of the suggestions ', () => {
            const initialSearch = createSearch('search token');

            const updatedSearch = applySuggestions(
                initialSearch,
                [
                    {value: 'search token'},
                    {value: 'search token 1'},
                ]
            );

            expect(updatedSearch).toMatchObject({
                value: 'search token',
                jumps: [
                    {
                        value: 'search token 1',
                        state: 'jumped',
                    }
                ],
            });
        });

        it('should jump to the last suggestion that has the search token as a prefix', () => {
            const initialSearch = createSearch('search token');

            const updatedSearch = applySuggestions(
                initialSearch,
                [
                    {value: 'search token'},
                    {value: 'search token 1'},
                    {value: 'search token 2'},
                    {value: 't- prefix missmatch'}
                ]
            );

            expect(updatedSearch).toMatchObject({
                value: 'search token',
                jumps: [
                    {
                        value: 'search token 2',
                        state: 'jumped',
                    }
                ],
            });
        });
    });

    describe('when calculating the next search', () => {

        it('should increment the search value if no jump exists', () => {
            const search = {
                ...createSearch('a'),
                jumps: [],
            };

            const nextSearchValue = calculateNextSearch(search);

            expect(nextSearchValue).toMatchObject({
                value: 'b',
            });
        });

        it('should start exhausting the jump if there is only one jump in state "jumped"', () => {
            const search = {
                ...createSearch('a'),
                jumps: [
                    {
                        value: 'a',
                        state: 'jumped',
                    }
                ],
            };

            const nextSearchValue = calculateNextSearch(search);

            expect(nextSearchValue).toMatchObject({
                ...nextSearchValue,
                jumps: [
                    {
                        value: 'a',
                        state: 'exhausting',
                    }
                ],
            });
        });

        it('should start exhausting the last jump if there are multiple jumps in state "jumped"', () => {
            const search = {
                ...createSearch('a'),
                jumps: [
                    {
                        value: 'aa',
                        state: 'jumped',
                    },
                    {
                        value: 'aaa',
                        state: 'jumped',
                    }
                ],
            };

            const nextSearchValue = calculateNextSearch(search);

            expect(nextSearchValue).toMatchObject({
                ...nextSearchValue,
                jumps: [
                    {
                        value: 'aa',
                        state: 'jumped',
                    },
                    {
                        value: 'aaa',
                        state: 'exhausting',
                    }
                ],
            });
        });

        it('should increment the jump value and stay in state "exhausting" if the jump is in state "exhausting" and the incremented value does not end in "z"', () => {
            const search = {
                ...createSearch('a'),
                jumps: [
                    {
                        value: 'aa',
                        state: 'jumped',
                    },
                    {
                        value: 'aaa',
                        state: 'exhausting',
                    }
                ],
            };

            const nextSearchValue = calculateNextSearch(search);

            expect(nextSearchValue).toMatchObject({
                ...nextSearchValue,
                jumps: [
                    {
                        value: 'aa',
                        state: 'jumped',
                    },
                    {
                        value: 'aab',
                        state: 'exhausting',
                    }
                ],
            });
        });
    });

    it('should increment the jump value and transition to state "exhausted" if the jump is in state "exhausting" and the incremented value does end in "z"', () => {
        const search = {
            ...createSearch('a'),
            jumps: [
                {
                    value: 'aa',
                    state: 'jumped',
                },
                {
                    value: 'aay',
                    state: 'exhausting',
                }
            ],
        };

        const nextSearchValue = calculateNextSearch(search);

        expect(nextSearchValue).toMatchObject({
            ...nextSearchValue,
            jumps: [
                {
                    value: 'aa',
                    state: 'jumped',
                },
                {
                    value: 'aaz',
                    state: 'exhausted',
                }
            ],
        });
    });

    it('should apply the jump value to the search and remove the jump if there is only one jump and it is in state "exhausted"', () => {
        const search = {
            ...createSearch('a'),
            jumps: [
                {
                    value: 'az',
                    state: 'exhausted',
                },
            ],
        };

        const nextSearchValue = calculateNextSearch(search);

        expect(nextSearchValue).toMatchObject({
            ...nextSearchValue,
            value: 'b',
            jumps: [],
        });
    });

    it('should apply the jump value to the previous jump, set the state of the previous jump to "exhausting" and remove the exhausted jump if there are multiple jumps and the last jump is in state "exhausted"', () => {
        const search = {
            ...createSearch('a'),
            jumps: [
                {
                    value: 'aa',
                    state: 'jumped',
                },
                {
                    value: 'aaaz',
                    state: 'exhausted',
                },
            ],
        };

        const nextSearchValue = calculateNextSearch(search);

        expect(nextSearchValue).toMatchObject({
            ...nextSearchValue,
            value: 'a',
            jumps: [
                {
                    value: 'aab',
                    state: 'exhausting',
                },
            ],
        });
    });

    describe('when retrieving the next search value', () => {

        it('should return the search value if no jump exists', () => {
            const initialSearch = createSearch('a');

            const value = currentSearchValue(initialSearch);

            expect(value).toBe('a');
        });

        it('should return the jump value if one jump exists', () => {
            const jumpedSearch = {
                ...createSearch('a'),
                jumps: [
                    {
                        value: 'b',
                        state: 'exhausting',
                    }
                ],
            };

            const value = currentSearchValue(jumpedSearch);

            expect(value).toBe('b');
        });

        it('should throw if the jump is in state "jumped"', () => {
            const invalidJumpedSearch = {
                ...createSearch('a'),
                jumps: [
                    {
                        value: 'b',
                        state: 'jumped',
                    }
                ],
            };

            expect(() => currentSearchValue(invalidJumpedSearch)).toThrow();
        });

        it('should throw if the jump is in state "jumped"', () => {
            const invalidJumpedSearch = {
                ...createSearch('a'),
                jumps: [
                    {
                        value: 'b',
                        state: 'jumped',
                    }
                ],
            };

            expect(() => currentSearchValue(invalidJumpedSearch)).toThrow();
        });
    });

    describe('when being applied to a predefined search space', () => {

        describe('and the search space is empty', () => {

            it('should produce the expected sequence of search states', () => {
                const searchSpace = [];
                const filteredSearchSpace = (allValues, token) => {
                    return allValues
                        .filter(suggestion => suggestion.startsWith(token))
                        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                        .slice(0, 3)
                }
                let search = createSearch('a', 'c');
                const expectedSearchStates = [
                    {
                        value: 'a',
                        jumps: [],
                    },
                    {
                        value: 'b',
                        jumps: [],
                    },
                    {
                        value: 'c',
                        jumps: [],
                    },
                ];

                for (let initialState = 0; initialState < expectedSearchStates.length; initialState++) {
                    const expectedInitialState = expectedSearchStates[initialState];
                    expect(search).toMatchObject(expectedInitialState);
                    search = applySuggestions(search, filteredSearchSpace(searchSpace, search.value));
                    search = calculateNextSearch(search);
                    const expectedNextState = expectedSearchStates[initialState + 1];
                    if (expectedNextState) {
                        expect(search).toMatchObject(expectedNextState);
                    }
                }
                expect(isSearchExhausted(search)).toBe(true);
            });
        });

        describe('and the search space has to be searched incrementally', () => {
            const filteredSearchSpace = (allValues, token) => {
                return allValues
                    .filter(suggestion => suggestion.value.startsWith(token))
                    .slice(0, 3)
            }

            it('should produce the expected sequence of search states', () => {
                let search = createSearch('a', 'c');
                const allValues = [
                    {value: 'a'},
                    {value: 'b'},
                    {value: 'c'},
                ];
                const expectedSearchStates = [
                    {
                        value: 'a',
                        jumps: [],
                    },
                    {
                        value: 'b',
                        jumps: [],
                    },
                    {
                        value: 'c',
                        jumps: [],
                    },
                ];

                for (let initialState = 0; initialState < expectedSearchStates.length; initialState++) {
                    const expectedInitialState = expectedSearchStates[initialState];
                    expect(search).toMatchObject(expectedInitialState);
                    search = applySuggestions(search, filteredSearchSpace(allValues, search.value));
                    search = calculateNextSearch(search);
                    const expectedNextState = expectedSearchStates[initialState + 1];
                    if (expectedNextState) {
                        expect(search).toMatchObject(expectedNextState);
                    }
                }
                expect(isSearchExhausted(search)).toBe(true);
            });
        });

        describe('and the search space has to be searched incrementally', () => {
            const filteredSearchSpace = (allValues, token) => {
                return allValues
                    .filter(suggestion => suggestion.value.startsWith(token))
                    .slice(0, 3)
            }

            it('should produce the expected sequence of search states', () => {
                let search = createSearch('a', 'aac');
                const allValues = [
                    {value: 'a'},
                    {value: 'aa'},
                    {value: 'aaa'},
                ];
                const expectedSearchStates = [
                    {
                        value: 'a',
                        stopToken: 'aac',
                        jumps: [],
                    },
                    {
                        value: 'a',
                        stopToken: 'aac',
                        jumps: [
                            {
                                value: 'aaa',
                                state: 'exhausting',
                            }
                        ],
                    },
                    {
                        value: 'a',
                        stopToken: 'aac',
                        jumps: [
                            {
                                value: 'aab',
                                state: 'exhausting',
                            }
                        ],
                    },
                    {
                        value: 'a',
                        stopToken: 'aac',
                        jumps: [
                            {
                                value: 'aac',
                                state: 'exhausting',
                            }
                        ],
                    },
                ];

                for (let initialState = 0; initialState < expectedSearchStates.length; initialState++) {
                    const expectedInitialState = expectedSearchStates[initialState];
                    expect(search).toMatchObject(expectedInitialState);
                    const value = searchValueInternal(search);
                    search = applySuggestions(
                        search,
                        filteredSearchSpace(allValues, value)
                    );
                    search = calculateNextSearch(search);
                    const expectedNextState = expectedSearchStates[initialState + 1];
                    if (expectedNextState) {
                        expect(search).toMatchObject(expectedNextState);
                    }
                }
                expect(isSearchExhausted(search)).toBe(true);
            });
        });

        describe('and the search space requires an increment after a jump', () => {
            const filteredSearchSpace = (allValues, token) => {
                return allValues
                    .filter(suggestion => suggestion.value.startsWith(token))
                    .slice(0, 3)
            }

            it('should produce the expected sequence of search states', () => {
                let search = createSearch('jump', 'jumq');
                const allValues = [
                    {value: 'jump'},
                    {value: 'jumpy'},
                    {value: 'jumq'},
                ];
                const expectedSearchStates = [
                    {
                        value: 'jump',
                        stopToken: 'jumq',
                        jumps: [],
                    },
                    {
                        value: 'jump',
                        stopToken: 'jumq',
                        jumps: [
                            {
                                value: 'jumpy',
                                state: 'exhausting',
                            }
                        ],
                    },
                    {
                        value: 'jump',
                        stopToken: 'jumq',
                        jumps: [
                            {
                                value: 'jumpz',
                                state: 'exhausted',
                            }
                        ],
                    },
                    {
                        value: 'jumq',
                        stopToken: 'jumq',
                        jumps: [],
                    },
                ];

                for (let initialState = 0; initialState < expectedSearchStates.length; initialState++) {
                    const expectedInitialState = expectedSearchStates[initialState];
                    expect(search).toMatchObject(expectedInitialState);
                    const value = searchValueInternal(search);
                    search = applySuggestions(
                        search,
                        filteredSearchSpace(allValues, value)
                    );
                    search = calculateNextSearch(search);
                    const expectedNextState = expectedSearchStates[initialState + 1];
                    if (expectedNextState) {
                        expect(search).toMatchObject(expectedNextState);
                    }
                }
                expect(isSearchExhausted(search)).toBe(true);
            });
        });


        describe('and the search space requires multiple jumps', () => {
            const filteredSearchSpace = (allValues, token) => {
                return allValues
                    .filter(suggestion => suggestion.value.startsWith(token))
                    .slice(0, 3)
            }

            it('should produce the expected sequence of search states', () => {
                let search = createSearch('jump', 'jump c');
                const allValues = [
                    {value: 'jump a'},
                    {value: 'jump a'},
                    {value: 'jump a'},
                    {value: 'jump b'},
                    {value: 'jump b'},
                    {value: 'jump b'},
                    {value: 'jump c'},
                ];
                const expectedSearchStates = [
                    {
                        value: 'jump',
                        stopToken: 'jump c',
                        jumps: [],
                    },
                    {
                        value: 'jump',
                        stopToken: 'jump c',
                        jumps: [
                            {
                                value: 'jump a',
                                state: 'exhausting',
                            }
                        ],
                    },
                    {
                        value: 'jump',
                        stopToken: 'jump c',
                        jumps: [
                            {
                                value: 'jump b',
                                state: 'exhausting',
                            }
                        ],
                    },
                    {
                        value: 'jump',
                        stopToken: 'jump c',
                        jumps: [
                            {
                                value: 'jump c',
                                state: 'exhausting',
                            }
                        ],
                    },
                ];

                for (let initialState = 0; initialState < expectedSearchStates.length; initialState++) {
                    const expectedInitialState = expectedSearchStates[initialState];
                    expect(search).toMatchObject(expectedInitialState);
                    const value = searchValueInternal(search);
                    search = applySuggestions(
                        search,
                        filteredSearchSpace(allValues, value)
                    );
                    search = calculateNextSearch(search);
                    const expectedNextState = expectedSearchStates[initialState + 1];
                    if (expectedNextState) {
                        expect(search).toMatchObject(expectedNextState);
                    }
                }
                expect(isSearchExhausted(search)).toBe(true);
            });
        });

        describe('and the search space requires exhausting a jump', () => {
            const filteredSearchSpace = (allValues, token) => {
                return allValues
                    .filter(suggestion => suggestion.value.startsWith(token))
                    .slice(0, 3)
            }
            const fillJumpSequenceToExhaustion = (search) => {
                const fillStart = search.jumps[search.jumps.length - 1]
                let nextValue = fillStart.value;
                const filledJumpSequence = [];
                while (nextValue[nextValue.length - 1] < 'z') {
                    filledJumpSequence.push({
                        ...search,
                        jumps: [
                            {
                                value: nextValue,
                                state: 'exhausting',
                            }
                        ],
                    });
                    nextValue = incrementToken(nextValue);
                }
                return filledJumpSequence;
            }
            const fillSearchValueToExhaustion = (search) => {
                const filledSearchValue = [];
                let nextValue = search.value;
                while (nextValue[nextValue.length - 1] < 'z') {
                    filledSearchValue.push({
                        ...search,
                        value: nextValue,
                    });
                    nextValue = incrementToken(nextValue);
                }
                return filledSearchValue;
            }

            it('should produce the expected sequence of search states', () => {
                let search = createSearch('a', 'achermano');
                const allValues = [
                    {value: 'achermann'},
                    {value: 'achermann a'},
                    {value: 'achermann z'},
                    {value: 'achermano'},
                ];
                const expectedSearchStates = [
                    {
                        value: 'a',
                        stopToken: 'achermano',
                        jumps: [],
                    },
                    {
                        value: 'a',
                        stopToken: 'achermano',
                        jumps: [
                            {
                                value: 'achermann z',
                                state: 'exhausting',
                            }
                        ],
                    },
                    ...fillJumpSequenceToExhaustion({
                        value: 'a',
                        stopToken: 'achermano',
                        jumps: [
                            {
                                value: 'achermannaa',
                                state: 'exhausting',
                            }
                        ],
                    }),
                    {
                        stopToken: 'achermano',
                        value: 'a',
                        jumps: [
                            {
                                value: 'achermannaz',
                                state: 'exhausted'
                            }
                        ]
                    },
                    ...fillSearchValueToExhaustion({

                        value: 'achermannb',
                        stopToken: 'achermano',
                        jumps: [],
                    }),
                    {
                        stopToken: 'achermano',
                        value: 'achermannz',
                        jumps: [],
                    },
                    {
                        stopToken: 'achermano',
                        value: 'achermano',
                        jumps: [],
                    },
                ];

                for (let initialState = 0; initialState < expectedSearchStates.length; initialState++) {
                    const expectedInitialState = expectedSearchStates[initialState];
                    expect(search).toMatchObject(expectedInitialState);
                    const value = searchValueInternal(search);
                    search = applySuggestions(
                        search,
                        filteredSearchSpace(allValues, value)
                    );
                    search = calculateNextSearch(search);
                    const expectedNextState = expectedSearchStates[initialState + 1];
                    if (expectedNextState) {
                        console.log(search);
                        expect(search).toMatchObject(expectedNextState);
                    }
                }
                expect(isSearchExhausted(search)).toBe(true);
            });
        });
    });
});
