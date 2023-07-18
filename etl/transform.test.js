import {transformSchwinger} from "./transform.js";
import {response_for_a_} from "./test-data.js";

describe('When transforming data', () => {

    it('should transform a schwinger response into the target object', () => {
        const transformed = transformSchwinger(response_for_a_);

        transformed.forEach(transformedSchwinger => {
            expect(transformedSchwinger).toMatchObject(
                {
                    id: expect.any(Number),
                    firstName: expect.any(String),
                    lastName: expect.any(String)
                }
            );
        });
    });
});
