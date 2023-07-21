import {extractSchwinger} from "./extract.js";

import {
    response_for_a, response_for_abderhalden_maurice,
} from "./test-data.js";
import {createSearch} from "./search.js";

describe('When extracting data', () => {

    describe('extracting schwinger', () => {
        const fakeSchwingerFetcher = (url) => {
            switch (url) {
                case 'https://zwilch.ch/api/v2/schwinger/a':
                    return Promise.resolve(response_for_a);
                case 'https://zwilch.ch/api/v2/schwinger/abderhalden%20maurice':
                    return Promise.resolve(response_for_abderhalden_maurice);
                default:
                    throw new Error(`Unexpected url: ${url}`);
            }
        }
        const fakeTransformer = () => [];
        const fakeLoader = () => ({
            success: true,
            numberOfRecords: null,
        });


        it('should be possible to search from "a " to "abd "', async () => {
            const search = await extractSchwinger(
                createSearch('a', 'abd'),
                fakeSchwingerFetcher,
                fakeTransformer,
                fakeLoader,
            );

            expect(search).toEqual({
                value: 'a',
                stopToken: 'abd',
                jumps: [
                    {
                        value: 'abderhalden maurice',
                        state: 'exhausting',
                    }
                ]
            });
        })

        it('should be possible to search from "a " to "abderhalden mauricf"', async () => {
            const search = await extractSchwinger(
                createSearch('a', 'abderhalden mauricf'),
                fakeSchwingerFetcher,
                fakeTransformer,
                fakeLoader,
            );

            expect(search).toEqual({
                value: 'a',
                stopToken: 'abderhalden mauricf',
                jumps: [
                    {
                        value: 'abderhalden mauricf',
                        state: 'exhausting',
                    }
                ]
            });
        })
    });
});
