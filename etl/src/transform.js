/**
 * Transforms the response from the API to an entity that can be loaded into the database.
 *
 * The response from the API looks like this:
 *
 * @typedef {Object} Suggestion
 * @property {string} value - The name of the Schwinger in the form `<firstName> <lastName>`
 * @property {Object} data
 * @property {number} data._id - The ID of the Schwinger
 *
 * @typedef {Object} SchwingerResponse
 * @property {Suggestion[]} suggestions
 *
 * @typedef {Object} Schwinger
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 *
 * @param {SchwingerResponse} response
 * @returns {Schwinger[]}
 */
export function transformSchwinger(response) {
    const transformedSchwinger = [];
    for (const suggestion of response.suggestions) {
        const {value, data: {_id: id}} = suggestion;
        const lastSpaceIndex = value.lastIndexOf(' ');
        let lastName;
        let firstName;
        // On very rare occasions, the source data has a schwinger without a first name
        if (lastSpaceIndex === -1) {
            lastName = value;
        }
            // on very rare occasions, the source data has multiple identical first and last name combinations which are
            // differentiated by a digit appended to the first name
        else if (/\d/.test(value)) {
            lastName = value.substring(0, lastSpaceIndex - 1);
            firstName = value.substring(lastSpaceIndex - 1);

        } else {
            lastName = value.substring(0, lastSpaceIndex);
            firstName = value.substring(lastSpaceIndex + 1);
        }
        transformedSchwinger.push({
            id,
            firstName,
            lastName
        });
    }
    return transformedSchwinger;
}
