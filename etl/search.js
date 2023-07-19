export function createSearch(value) {
    return {
        origin: null,
        value,
        jump: null,
    }
}

/**
 * Increments a token alphabetically.
 * The incrementation rules are as follows:
 * * if the last letter is not z, increment it by one
 *      * e.g. a -> b, b -> c, ..., x -> y; aa -> ab, ab -> ac, ..., ax -> ay
 * * if the last letter is z and the token length is 1, increment it to aa
 *     * i.e. z -> aa
 * * if the last letter is z and the second last letter is not z, increment the second last letter by one and remove the last letter
 *     * e.g. az -> b, bz -> c, ..., xz -> y
 * * if the last letter is z and the second last letter is z, replace the last z by aa
 *     * e.g. zz -> zaa, zzz -> zzaa, ..., xzz -> xzaa
 *
 * @param token - the token to increment
 *
 * @returns {string} the incremented token
 */
export function incrementToken(token) {
    let index = token.length - 1;
    while (index > 0) {
        const currentToken = token[index];
        if (currentToken > 'z') {
            if (token.length > 1) {
                const lookAhead = token[index - 1];
                // look is after z
                if (lookAhead > 'z') {
                    String.fromCharCode(lastLetterOfToken.charCodeAt(0) + 1)
                } else {

                }
            }
        }
        let nextLetter = String.fromCharCode(lastLetterOfToken.charCodeAt(0) + 1);
        // z -> a, az -> b
        if (nextLetter > 'z') {
            nextLetter = 'a';
        }
        index--;
    }

    return token;
}

export function updateSearch(search, suggestions) {
    const possibleJumps = suggestions
        .filter(suggestion => suggestion !== search.value)
        .filter(suggestion => suggestion.startsWith(search.value))

    if (possibleJumps.length === 0) {
        // base case is to increment value
        search.value

    }

    const jump = possibleJumps[0]
    return {
        origin: search,
        value: jump,
        jump: null,
    }
}
