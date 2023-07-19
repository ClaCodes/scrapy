import {loadSchwingerToFile} from "./load.js";

describe('When loading data', () => {

    describe('to a file', () => {

        it('should throw an error if the input is not an array', () => {
            const loadConfig = {
                path: `./dist/${new Date().toISOString()}_schwinger.json`,
            }

            const transformed = 'not an array';

            expect(() => loadSchwingerToFile(transformed, loadConfig))
                .toThrow('input must be an array');
        });

        it('should be able to load transformed schwinger', () => {
            const loadConfig = {
                path: `./dist/${new Date().toISOString()}_schwinger.json`,
            }
            const transformed = [
                {id: 1, firstName: 'Fabio', lastName: 'Abächerli'},
                {id: 2, firstName: 'Lars', lastName: 'Abächerli'},
                {id: 3, firstName: 'Marco', lastName: 'Abächerli'},
            ];

            const result = loadSchwingerToFile(transformed, loadConfig);

            expect(result).toEqual({
                location: expect.any(String),
                success: true,
                numberOfRecordsAdded: 3,
                totalNumberOfRecords: 0,
            })
        });
    });
});
