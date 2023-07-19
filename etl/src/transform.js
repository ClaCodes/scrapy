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
