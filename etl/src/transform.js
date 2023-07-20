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
 * @property {string} id
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
        const [lastName, firstName] = value.split(' ');
        transformedSchwinger.push({
            id,
            firstName,
            lastName
        });
    }
    return transformedSchwinger;
}
