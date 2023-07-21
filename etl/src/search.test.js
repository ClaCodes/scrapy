import {
    applySuggestions,
    calculateNextSearch,
    createSearch,
    currentSearchValue,
    incrementToken,
    isBetween,
    isSearchExhausted,
    OptimizationStrategy
} from "./search.js";

describe('The search', () => {

    it('should be possible to create a search with an initial value', () => {
        const initialSearch = createSearch('initial value', 'stop value', OptimizationStrategy.accuracy);

        expect(initialSearch).toEqual({
            jumps: [],
            optimizationStrategy: 'accuracy',
            stopToken: 'stop value',
            value: 'initial value',
        });
    });

    it('should be possible to create a search with an initial value and optimization strategy', () => {
        const initialSearch = createSearch('initial value', 'stop value', OptimizationStrategy.speed);

        expect(initialSearch).toEqual({
            jumps: [],
            optimizationStrategy: 'speed',
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

        describe('and the optimization strategy is accuracy', () => {

            it('should increment the last letter of the token by one if it is between "a" and "z"', () => {
                const incrementSpecs = [
                    ['a', 'b'],
                    ['b', 'c'],
                    ['y', 'z'],
                    ['aa', 'ab'],
                    ['bb', 'bc'],
                    ['yy', 'yz'],
                    ['aaa', 'aab'],
                    ['bbb', 'bbc'],
                    ['yyy', 'yyz'],
                ];

                incrementSpecs.forEach(([token, expectedIncrement]) => {
                    expect(incrementToken(token, OptimizationStrategy.accuracy))
                        .toEqual(expectedIncrement);
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

                tokens.forEach((token) => {
                    expect(incrementToken(token, OptimizationStrategy.accuracy))
                        .toEqual('aa');
                });
            });

            it('should increment the second last letter by one and remove the last letter if the last letter is not between "a" and "z" and the second last letter is between "a" and "z"', () => {
                const incrementSpecs = [
                    ['az', 'b'],
                    ['bz', 'c'],
                    ['yz', 'z'],
                    ['aaz', 'ab'],
                    ['bbz', 'bc'],
                    ['yyz', 'yz'],
                    ['aaaz', 'aab'],
                    ['bbbz', 'bbc'],
                    ['yyyz', 'yyz'],
                ];

                incrementSpecs.forEach(([token, expectedIncrement]) => {
                    expect(incrementToken(token, OptimizationStrategy.accuracy))
                        .toEqual(expectedIncrement);
                })
            });


            it('should replace the last "z" by "aa" if both the last and second letter are not between "a" and "z" and the second last letter is not before "a"', () => {
                const incrementSpecs = [
                    ['zz', 'zaa'],
                    ['zzz', 'zzaa'],
                    ['xzz', 'xzaa'],
                    ['zzzz', 'zzzaa'],
                    ['zzzzz', 'zzzzaa'],
                ];

                incrementSpecs.forEach(([token, expectedIncrement]) => {
                    expect(incrementToken(token, OptimizationStrategy.accuracy))
                        .toEqual(expectedIncrement);
                });
            });

            it('should replace the last two letters by "aa" if both the last and second letter are not between "a" and "z" and the second last letter is before "a"', () => {
                const incrementSpecs = [
                    [' z', 'aa'],
                    ['z!z', 'zaa'],
                    ['x1z', 'xaa'],
                    ['zz?z', 'zzaa'],
                    ['zzz]z', 'zzzaa'],
                ];

                incrementSpecs.forEach(([token, expectedIncrement]) => {
                    expect(incrementToken(token, OptimizationStrategy.accuracy))
                        .toEqual(expectedIncrement);
                });
            });
        });


        describe('and the optimization strategy is speed', () => {

            it('should throw an error if there is only one letters and it is after "z"', () => {
                const tokensThatShouldThrow = [
                    'z',
                    '{',
                    // ... and all other letters after "z"
                ];

                tokensThatShouldThrow.forEach((token) => {
                    expect(() => incrementToken(token, OptimizationStrategy.speed))
                        .toThrow('Implementation defect: wrap around is not allowed for single letter tokens');
                });
            });

            it('should increment the last letter if there are <3 letters and the letter is before "z"', () => {
                const incrementSpecs = [
                    ['1', 'a'], // before a
                    ['a', 'b'],
                    ['b', 'c'],
                    ['x', 'y'],
                    ['y', 'z'],
                    ['aa', 'ab'],
                    ['bb', 'bc'],
                    ['cd', 'ce'],
                    ['xx', 'xy'],
                    ['yy', 'yz'],
                ];

                incrementSpecs.forEach(([token, expectedIncrement]) => {
                    expect(incrementToken(token, OptimizationStrategy.speed)).toEqual(expectedIncrement);
                });
            });

            it('should increment the second last letter and remove the rest if there are >=4 letters', () => {
                const incrementSpecs = [
                    ['aa1a', 'aaa'],
                    ['abaa', 'abb'],
                    ['acab', 'acb'],
                    ['adbz', 'adc'],
                    ['aec{', 'aed'],
                ];

                incrementSpecs.forEach(([token, expectedIncrement]) => {
                    expect(incrementToken(token, OptimizationStrategy.speed)).toEqual(expectedIncrement);
                });
            });
        });

        describe('and the optimization strategy is mixed', () => {

            it('should throw an error the input is not of length 3', () => {
                const tokensThatShouldThrow = [
                    'a',
                    'bb',
                    'dddd',
                ];

                tokensThatShouldThrow.forEach((token) => {
                    expect(() => incrementToken(token, OptimizationStrategy.mixed))
                        .toThrow('Implementation defect: mixed optimization strategy is only supported for 3 letter tokens');
                });
            });

            it('should throw an error the input is "zzz"', () => {
                expect(() => incrementToken("zzz", OptimizationStrategy.mixed))
                    .toThrow('Implementation defect: wrap around is not allowed');
            });

            it('should increment alphabetically if the token is in range', () => {
                const incrementSpecs = [
                    ['aaa', 'aab'],
                    ['aab', 'aac'],
                    ['aac', 'aad'],
                    ['bbx', 'bby'],
                    ['bby', 'bbz'],
                    ['bbz', 'bca'],
                    ['bzz', 'caa'],
                    ['zzy', 'zzz'],
                ];

                incrementSpecs.forEach(([token, expectedIncrement]) => {
                    expect(incrementToken(token, OptimizationStrategy.mixed)).toEqual(expectedIncrement);
                });
            });
        });
    })

    describe('when applying the resulting suggestions', () => {

        describe('independent of the optimization strategy', () => {

            it('should do nothing if there are no suggestions and there are no jumps', () => {
                const strategies = [
                    OptimizationStrategy.accuracy,
                    OptimizationStrategy.speed,
                ];

                strategies.forEach((strategy) => {
                    const updatedSearch = applySuggestions(
                        createSearch('search token', 'stop token', strategy),
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
            });

            it('should exhaust the jump if one exists and no suggestions matched it', () => {
                const strategies = [
                    OptimizationStrategy.accuracy,
                    OptimizationStrategy.speed,
                ];

                strategies.forEach((strategy) => {
                    const jumpedSearch = {
                        ...createSearch('search token', 'stop token', strategy),
                        jumps: [
                            {
                                value: 'search token 1',
                                state: 'jumped',
                            }
                        ],
                    };

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
            });

            it('should do nothing if there are suggestions but none of them is a prefix search value and there are no jumps', () => {
                const strategies = [
                    OptimizationStrategy.accuracy,
                    OptimizationStrategy.speed,
                ];

                strategies.forEach((strategy) => {
                    const initialSearch = createSearch('search token', 'stop token', strategy);

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
            });

            it('should set the state of the last jump to "exhausting" if there are suggestions but none of them is a prefix search value and there are jumps', () => {
                const strategies = [
                    OptimizationStrategy.accuracy,
                    OptimizationStrategy.speed,
                ];

                strategies.forEach((strategy) => {
                    const initialSearch = {
                        ...createSearch('a search token', 'stop token', strategy),
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
            });


        });


        describe('and the optimization strategy is accuracy', () => {

            it('should jump if the search token is a prefix of at least one of the suggestions ', () => {
                const updatedSearch = applySuggestions(
                    createSearch('search token', 'stop token', OptimizationStrategy.accuracy),
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
                const updatedSearch = applySuggestions(
                    createSearch('search token', 'stop token', OptimizationStrategy.accuracy),
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

        describe('and the optimization strategy is speed', () => {

            it('should jump and use up to 3 letters of the target suggestion if the search token is a prefix of exactly one of the suggestions', () => {
                const suggestionApplicationSpec = [
                    [{value: 'ab'}, {value: 'ab', state: 'jumped'}],
                    [{value: 'abc'}, {value: 'abc', state: 'jumped'}],
                    [{value: 'abcd'}, {value: 'abc', state: 'jumped'}],
                    [{value: 'abcde'}, {value: 'abc', state: 'jumped'}],
                ];

                suggestionApplicationSpec.forEach(([suggestion, expectedJump]) => {
                    const updatedSearch = applySuggestions(
                        createSearch('a', 'z', OptimizationStrategy.speed),
                        [
                            suggestion,
                        ]
                    );

                    expect(updatedSearch).toMatchObject({
                        value: 'a',
                        jumps: [
                            expectedJump,
                        ],
                    });
                });
            });

            it('should jump and increment the first three letters of the last suggestion if the search token is a prefix of more than one suggestion', () => {
                const suggestionApplicationSpec = [
                    [
                        [{value: 'ab'}, {value: 'abc'}], {value: 'abd', state: 'jumped'},
                        [{value: 'ax'}, {value: 'ay'}], {value: 'az', state: 'jumped'},
                        [{value: 'ay'}, {value: 'az'}], {value: 'b', state: 'jumped'},
                    ]
                ];

                suggestionApplicationSpec.forEach(([suggestions, expectedJump]) => {
                    const updatedSearch = applySuggestions(
                        createSearch('a', 'z', OptimizationStrategy.speed),
                        suggestions,
                    );

                    expect(updatedSearch).toMatchObject({
                        value: 'a',
                        jumps: [
                            expectedJump,
                        ],
                    });
                });
            });
        });
    });


    describe('when calculating the next search', () => {

        it('should increment the search value if no jump exists', () => {
            const search = {
                ...createSearch('a', 'stop token', OptimizationStrategy.accuracy),
                jumps: [],
            };

            const nextSearchValue = calculateNextSearch(search);

            expect(nextSearchValue).toMatchObject({
                value: 'b',
            });
        });

        it('should start exhausting the jump if there is only one jump in state "jumped"', () => {
            const search = {
                ...createSearch('a', 'stop token', OptimizationStrategy.accuracy),
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
                ...createSearch('a', 'stop token', OptimizationStrategy.accuracy),
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
                ...createSearch('a', 'z', OptimizationStrategy.accuracy),
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

        it('should increment the jump value and transition to state "exhausted" if the jump is in state "exhausting" and the incremented value does end in "z"', () => {
            const search = {
                ...createSearch('a', 'z', OptimizationStrategy.accuracy),
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
                ...createSearch('a', 'z', OptimizationStrategy.accuracy),
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
                ...createSearch('a', 'z', OptimizationStrategy.accuracy),
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
    });

    describe('when retrieving the next search value', () => {

        it('should return the search value if no jump exists', () => {
            const initialSearch = createSearch('a', 'z', OptimizationStrategy.accuracy);

            const value = currentSearchValue(initialSearch);

            expect(value).toBe('a');
        });

        it('should return the jump value if one jump exists', () => {
            const jumpedSearch = {
                ...createSearch('a', 'b', OptimizationStrategy.accuracy),
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
    });

    describe('when being applied to a predefined search space', () => {
        const assertSearchSequence = (search, searchSpace, expectedSearchStates, pageSize = 3) => {
            let searchToTest = {...search};
            for (let stateIndex = 0; stateIndex < expectedSearchStates.length; stateIndex++) {
                const expectedInitialState = expectedSearchStates[stateIndex];
                expect(searchToTest).toMatchObject(expectedInitialState);
                const searchValue = currentSearchValue(searchToTest);
                searchToTest = applySuggestions(searchToTest, filteredSearchSpace(searchSpace, searchValue, pageSize));
                searchToTest = calculateNextSearch(searchToTest);
                const expectedNextState = expectedSearchStates[stateIndex + 1];
                if (expectedNextState) {
                    expect(searchToTest).toMatchObject(expectedNextState);
                }
            }
            expect(isSearchExhausted(searchToTest)).toBe(true);
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
                nextValue = incrementToken(nextValue, OptimizationStrategy.accuracy);
            }
            return filledJumpSequence;
        }
        const fillSearchValueTo = (search, end = 'z') => {
            const filledSearchValue = [];
            let nextValue = search.value;
            while (nextValue[nextValue.length - 1] < end) {
                filledSearchValue.push({
                    ...search,
                    value: nextValue,
                });
                nextValue = incrementToken(nextValue, OptimizationStrategy.accuracy);
            }
            return filledSearchValue;
        }
        const filteredSearchSpace = (allValues, token, pageSize = 3) => {
            return allValues
                .filter(suggestion => suggestion.value.toLowerCase().startsWith(token))
                .sort((a, b) => a.value.toLowerCase().localeCompare(b.value.toLowerCase()))
                .slice(0, pageSize);
        }

        describe('and the search strategy is "accuracy"', () => {

            describe('and the search space is empty', () => {

                it('should produce the expected sequence of search states', () => {
                    const searchSpace = [];
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

                    const search = createSearch('a', 'c', OptimizationStrategy.accuracy);

                    assertSearchSequence(search, searchSpace, expectedSearchStates);
                });
            });

            describe('and the search space has to be searched incrementally', () => {

                it('should produce the expected sequence of search states', () => {
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

                    let search = createSearch('a', 'c', OptimizationStrategy.accuracy);

                    assertSearchSequence(search, allValues, expectedSearchStates);
                });
            });

            describe('and the search space has to be searched incrementally', () => {

                it('should produce the expected sequence of search states', () => {
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

                    const search = createSearch('a', 'aac', OptimizationStrategy.accuracy);

                    assertSearchSequence(search, allValues, expectedSearchStates);
                });
            });

            describe('and the search space requires an increment after a jump', () => {

                it('should produce the expected sequence of search states', () => {
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

                    const search = createSearch('jump', 'jumq', OptimizationStrategy.accuracy);

                    assertSearchSequence(search, allValues, expectedSearchStates);
                });
            });

            describe('and the search space requires multiple jumps', () => {

                it('should produce the expected sequence of search states', () => {
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

                    const search = createSearch('jump', 'jump c', OptimizationStrategy.accuracy);

                    assertSearchSequence(search, allValues, expectedSearchStates);
                });
            });

            describe('and the search space requires exhausting a jump', () => {

                it('should produce the expected sequence of search states', () => {
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
                        ...fillSearchValueTo({

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

                    const search = createSearch('a', 'achermano', OptimizationStrategy.accuracy);

                    assertSearchSequence(search, allValues, expectedSearchStates);
                });
            });
        });

        describe('and the search strategy is speed', () => {

            describe('and the search space is empty', () => {

                it('should produce the expected sequence of search states', () => {
                    const searchSpace = [];
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

                    const search = createSearch('a', 'c', OptimizationStrategy.speed);

                    assertSearchSequence(search, searchSpace, expectedSearchStates);
                });
            });

            describe('and the search space has to be searched incrementally', () => {

                it('should produce the expected sequence of search states', () => {
                    const allValues = [
                        {value: 'a'},
                        {value: 'aa'},
                        {value: 'aaa'},
                    ];
                    const expectedSearchStates = [
                        {
                            value: 'a',
                            stopToken: 'ac',
                            jumps: [],
                        },
                        {
                            value: 'a',
                            stopToken: 'ac',
                            jumps: [
                                {
                                    value: 'aab',
                                    state: 'exhausting',
                                }
                            ],
                        },
                        ...fillJumpSequenceToExhaustion({
                            value: 'a',
                            stopToken: 'ac',
                            jumps: [
                                {
                                    value: 'aac',
                                    state: 'exhausting',
                                }
                            ],
                        }),
                        {
                            value: 'a',
                            stopToken: 'ac',
                            jumps: [
                                {
                                    value: 'aaz',
                                    state: 'exhausted',
                                }
                            ],
                        },
                        {
                            value: 'ab',
                            stopToken: 'ac',
                            jumps: [],
                        },
                    ];

                    const search = createSearch('a', 'ac', OptimizationStrategy.speed);

                    assertSearchSequence(search, allValues, expectedSearchStates);
                });
            });

            describe('and the search space requires an increment after a jump', () => {

                it('should produce the expected sequence of search states', () => {
                    const allValues = [
                        {value: 'jump'},
                        {value: 'jumpx'},
                        {value: 'jumpy'},
                        {value: 'jun'},
                        {value: 'junz'},
                        {value: 'juqa'},
                        {value: 'juqb'},
                        {value: 'jw'},
                    ];
                    const expectedSearchStates = [
                        {
                            value: 'jump',
                            stopToken: 'jw',
                            jumps: [],
                        },
                        {
                            value: 'jump',
                            stopToken: 'jw',
                            jumps: [
                                {
                                    value: 'jun',
                                    state: 'exhausting',
                                }
                            ],
                        },
                        {
                            value: 'juo',
                            stopToken: 'jw',
                            jumps: [],
                        },
                        {
                            value: 'jup',
                            stopToken: 'jw',
                            jumps: [],
                        },
                        {
                            value: 'juq',
                            stopToken: 'jw',
                            jumps: [],
                        },
                        {
                            value: 'juq',
                            stopToken: 'jw',
                            jumps: [
                                {
                                    value: 'jur',
                                    state: 'exhausting',
                                }
                            ],
                        },
                        ...fillJumpSequenceToExhaustion({
                            value: 'juq',
                            stopToken: 'jw',
                            jumps: [
                                {
                                    value: 'jus',
                                    state: 'exhausting',
                                }
                            ],
                        }),
                        {
                            value: 'juq',
                            stopToken: 'jw',
                            jumps: [
                                {
                                    value: 'juz',
                                    state: 'exhausted',
                                }
                            ],
                        },
                        {
                            value: 'jv',
                            stopToken: 'jw',
                            jumps: [],
                        },
                        {
                            value: 'jw',
                            stopToken: 'jw',
                            jumps: [],
                        },
                    ];

                    const search = createSearch('jump', 'jw', OptimizationStrategy.speed);

                    assertSearchSequence(search, allValues, expectedSearchStates);
                });
            });
            describe('and the search space requires all search operations', () => {

                it('should produce the expected sequence of search states', () => {
                    const allValues = [
                        {value: "Ab\u00e4cherli Fabio",},
                        {value: "Ab\u00e4cherli Lars",},
                        {value: "Ab\u00e4cherli Marco",},
                        {value: "Abaya Jasin",},
                        {value: "Abb\u00fchl Janik",},
                        {value: "Abb\u00fchl Jonas",},
                        {value: "Abb\u00fchl Levin",},
                        {value: "Abb\u00fchl Marc",},
                        {value: "Abb\u00fchl Mike",},
                        {value: "Abderhalden Adrian",},
                        {value: "Abderhalden Beat",},
                        {value: "Abderhalden Deon",},
                        {value: "Abderhalden J\u00f6rg",},
                        {value: "Abderhalden Lukas",},
                        {value: "Abderhalden Maurice",},
                        {value: "Abegg Robin",},
                        {value: "Abegg Silvan",},
                        {value: "Abegglen Markus",},
                        {value: "Aberle Linus",},
                        {value: "Egli Isabel",},
                        {value: "Feierabend Rolf",},
                        {value: "Gaber Karim",},
                        {value: "Gilabert Gervais",},
                        {value: "Graber Alfred",},
                        {value: "Graber Andreas",},
                        {value: "Graber B\u00e4nz",},
                        {value: "Graber Bruno",},
                        {value: "Graber Colin",},
                        {value: "Graber Daniel",},
                        {value: "Graber Felix",},
                        {value: "Ablanalp David",},
                        {value: "Ablondi Mike",},
                        {value: "B\u00e4bler Dominik",},
                        {value: "B\u00e4bler Sandro",},
                        {value: "B\u00e4bler Severin",},
                        {value: "Bably Maleek",},
                        {value: "Chabloz R\u00e9my",},
                        {value: "Chabloz Timoth\u00e9e",},
                        {value: "Gubbi Pablo",},
                        {value: "Matthey Pablo",},
                        {value: "Untern\u00e4hrer Pablo",}
                    ];
                    const expectedSearchStates = [
                        {
                            value: 'a',
                            stopToken: 'ac',
                            jumps: [],
                        },
                        {
                            value: 'a',
                            stopToken: 'ac',
                            jumps: [
                                {
                                    value: 'abe',
                                    state: 'exhausting',
                                }
                            ],
                        },
                        ...fillSearchValueTo(
                            {
                                value: 'abf',
                                stopToken: 'ac',
                                jumps: [],
                            },
                            'm'
                        ),
                        ...fillJumpSequenceToExhaustion({
                                value: 'abl',
                                stopToken: 'ac',
                                jumps: [
                                    {
                                        value: 'abm',
                                        state: 'exhausting',
                                    }
                                ],
                            },
                        ),
                        {
                            value: 'abl',
                            stopToken: 'ac',
                            jumps: [
                                {
                                    value: 'abz',
                                    state: 'exhausted',
                                }
                            ],
                        },
                        {
                            value: 'ac',
                            stopToken: 'ac',
                            jumps: [],
                        },
                    ];

                    const search = createSearch('a', 'ac', OptimizationStrategy.speed);

                    assertSearchSequence(search, allValues, expectedSearchStates, 15);
                });
            });
        })
    });
})
;



