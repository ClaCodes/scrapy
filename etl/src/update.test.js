import {calculateLongestCommonSubsequence, filter} from "./update.js";

describe('The update', () => {

    describe('when filtering the existing data based on some token', () => {

        it('should return all records match the sequence of the search token', () => {
            const specs = [
                [
                    [
                        {lastName: '', firstName: 'a',},
                        {lastName: '', firstName: 'ba',},
                        {lastName: 'a', firstName: '',},
                        {lastName: 'ba', firstName: '',},
                    ],
                    'a',
                    [
                        {lastName: '', firstName: 'a',},
                        {lastName: '', firstName: 'ba',},
                        {lastName: 'a', firstName: '',},
                        {lastName: 'ba', firstName: '',},
                    ]
                ],
                [
                    [
                        {lastName: '', firstName: 'ba',},
                        {lastName: 'ab', firstName: '',},
                        {lastName: 'b', firstName: 'a',},
                        {lastName: 'ba', firstName: '',},
                        {lastName: 'c', firstName: 'ab',},
                    ],
                    'ba',
                    [
                        {lastName: '', firstName: 'ba',},
                        {lastName: 'b', firstName: 'a',},
                        {lastName: 'ba', firstName: '',},
                    ]
                ],
                [
                    [
                        {lastName: 'a', firstName: '1',},
                        {lastName: 'a', firstName: '2',},
                        {lastName: 'a', firstName: '3',},
                        {lastName: 'a', firstName: '4',},
                        {lastName: 'a', firstName: '5',},
                    ],
                    'a',
                    [
                        {lastName: 'a', firstName: '1',},
                        {lastName: 'a', firstName: '2',},
                        {lastName: 'a', firstName: '3',},
                        {lastName: 'a', firstName: '4',},
                    ]
                ],
            ];

            specs.forEach(([allRecords, token, expected]) => {
                const actual = filter(allRecords, token, 4);
                expect(actual).toEqual(expected);
            });
        })
    });


    describe('when calculating the longest common subsequence for a list of Schwinger', () => {

        it('should return the longest common subsequence', () => {
            const specs = [
                [
                    [
                        {lastName: '', firstName: 'a',},
                        {lastName: '', firstName: 'ba',},
                        {lastName: 'a', firstName: '',},
                        {lastName: 'ba', firstName: '',},
                    ],
                    'a',
                ],
                [
                    [
                        {lastName: 'abc', firstName: '',},
                        {lastName: '', firstName: 'adc',},
                        {lastName: 'ae', firstName: 'c',},
                    ],
                    'ac',
                ],
                [
                    [
                        {lastName: 'abc', firstName: '',},
                        {lastName: 'axyzbefgbx', firstName: 'c',},
                        {lastName: 'yeaiiewba', firstName: 'c',},
                    ],
                    'abc',
                ],
            ];

            specs.forEach(([data, longestCommonSubsequence]) => {
                const subsequence = calculateLongestCommonSubsequence(data);
                expect(subsequence).toEqual(longestCommonSubsequence);
            })
        });
    });

    describe('when updating the existing data with the current data from the API', () => {

        it.todo('test updateSchwinger and the functions required to implement it',)
    });
});
