import {calculateLongestCommonSubsequence, filter, updateSchwinger} from "./update.js";
import {existingSchwinger} from "./test-data.js";

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
                    null,
                ],
                [
                    [
                        {lastName: 'a', firstName: 'c',},
                        {lastName: 'a', firstName: 'bc',},
                        {lastName: 'a', firstName: 'dc',},
                    ],
                    'a c',
                ],
                [
                    [
                        {lastName: 'abc', firstName: 'bde',},
                        {lastName: 'xa', firstName: 'cbde',},
                        {lastName: 'eaiiaewba', firstName: 'cbde',},
                    ],
                    'a bde',
                ],
            ];

            specs.forEach(([data, longestCommonSubsequence]) => {
                const subsequence = calculateLongestCommonSubsequence(data);
                expect(subsequence).toEqual(longestCommonSubsequence);
            })
        });
    });

    describe('when updating the existing data with the current data from the API', () => {

        it('should iterate over the existing data and update it if it does not matches the data of the API', async () => {
            /** @type {UpdateConfig} */
            const updateConfig = {chunkSize: 14};
            /** @type {LoadConfig} */
            const loadConfig = {
                path: `./dist/data/${new Date().toISOString()}_schwinger.json`,
            }
            const loadAllSchwingerFake = Promise.resolve(existingSchwinger);
            const fetchSchwingerFake = (longestCommonSubsequence) => Promise.resolve(
                filter(existingSchwinger, longestCommonSubsequence, updateConfig.chunkSize)
            );
            const transformSchwingerFake = (alreadyTransformed) => alreadyTransformed;
            const storeSchwingerToFileFake = () => ({success: true, numberOfRecords: 0});
            const storeSchwingerToDatabaseFake = () => Promise.resolve();

            // expect updateSchwinger not to throw, it is ansync use resolves.not.toThrow
            await expect(
                updateSchwinger(
                    loadAllSchwingerFake,
                    fetchSchwingerFake,
                    transformSchwingerFake,
                    storeSchwingerToFileFake,
                    storeSchwingerToDatabaseFake,
                    updateConfig,
                    loadConfig,
                )
            )
                .resolves.not.toThrow();
        });
    });
});
