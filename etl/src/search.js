/**
 * The state of a jump.
 * A jump can be in one of the following states:
 * * `jumped` - the jump was performed
 * * `exhausting` - the jump is being exhausted
 * * `exhausted` - the jump was exhausted
 *
 * The transition between states is as follows:
 * * `*` -> `jumped`
 * * `jumped` -> `calculate next value` -> `exhausting`
 * * `jumped` -> `calculate next value` -> `exhausted`
 * * `exhausting` -> `calculate next value` -> `exhausted`
 *
 * @readonly
 * @enum {string}
 *
 */
const JumpState = {
    jumped: 'jumped',
    exhausting: 'exhausting',
    exhausted: 'exhausted',
}

/**
 * The optimization strategy for the search.
 *
 * The search can be optimized for:
 * * `accuracy` - we search without any gaps in the search space, i.e. we can be sure to find all results
 * * `speed` - we search with gaps in the search space to speed up the search, but we might miss some results
 * * `mixed` - we search without any gaps but limit the number of letters in the query to 3
 *
 * The optimization strategy is used to determine the next search value.
 * * If we optimize for `accuracy` we increment the least significant letter of the search value resp. jump by one.
 * * If we optimize for `speed` we increment the search value when we exhaust a jump by incrementing the third letter by one.
 *   Furthermore, when jumping forward we do not use the last matching suggestion but instead the common prefix of all matching suggestions incremented by one.
 *
 * @readonly
 * @enum {string}
 *
 */
export const OptimizationStrategy = {
    speed: 'speed',
    mixed: 'mixed',
    accuracy: 'accuracy',
}

/**
 * @typedef {Object} Search
 * @property {Jump[]} jumps - the jumps of the search
 * @property {string} stopToken - the stop token of the search
 * @property {string} value - the current search value
 * @property {OptimizationStrategy} optimizationStrategy - the value to optimize for
 *
 * Creates a search object.
 *
 * Search is performed by strictly increasing the search token alphabetically until we reach the stop token.
 * To optimize search, we use the suggestions of the search result to update the search value.
 * We can leverage the suggestions if the search token is a prefix of at least one of the suggestions.
 * If we can leverage the suggestions we call this a "jump".
 * A jump is registered with the previous search token.
 * Jumps are searched to exhaustion, i.e. until the jump string ends in `z`.
 * After we exhaust the jump, we jump back to the previous search token.
 * From there we increment the search token and repeat the process.
 * To avoid clashes with previous jumps we skip any jumps ahead.
 * It is possible to jump ahead multiple times.
 *
 * @typedef {Object} Jump
 * @property {string} value - the value of the jump
 * @property {JumpState} state - the state of the jump
 *
 * @param {string} startToken - the start value of the search
 * @param {string} stopToken - the stop value of the search
 * @param {OptimizationStrategy} optimizationStrategy - the optimization strategy
 *
 * @returns {Search} the search object
 */
export function createSearch(startToken, stopToken, optimizationStrategy) {
    return {
        optimizationStrategy,
        jumps: [],
        stopToken,
        value: startToken,
    }
}

/**
 * Updates the search value based on the suggestions of the previous search.
 *
 * The rules for updating the search based on the suggestions are as follows if the optimization strategy is `accuracy`:
 * * If there are no suggestions, we can't leverage the suggestions to jump ahead and distinguish the following cases:
 *     * If there are jumps we set the state of the last one to `exhausting` if it's state is `jumped`
 *     * Otherwise, we do nothing
 * * If there are suggestions, we might be able to leverage the suggestions to jump ahead and distinguish the following cases:
 *     * If none of the suggestions is a prefix of the search value, we can't leverage the suggestions to jump ahead and thus:
 *         * If there are no jumps, we do nothing
 *         * Otherwise, we set the state of the last jump to `exhausting`
 *     * Otherwise, we can leverage the suggestions and jump ahead to the last suggestion that is a prefix of the search value
 *
 * The rules for updating the search based on the suggestions are as follows if the optimization strategy is `speed`:
 * * If there are no suggestions, we can't leverage the suggestions to jump ahead and distinguish the following cases:
 *     * If there are jumps we set the state of the last one to `exhausting` if it's state is `jumped`
 *     * Otherwise, we do nothing
 * * If there are suggestions, we might be able to leverage the suggestions to jump ahead and distinguish the following cases:
 *     * If none of the suggestions is a prefix of the search value, we can't leverage the suggestions to jump ahead and thus:
 *         * If there are no jumps, we do nothing
 *         * Otherwise, we set the state of the last jump to `exhausting`
 *     * Otherwise, we can leverage the suggestions and jump ahead to the common prefix of all suggestions incremented by one
 *
 * No suggestions are used if the optimization strategy is `mixed`.
 *
 * @param {Search} search - the search to update
 * @param {string[]} suggestions - the suggestions of the previous search
 *
 * @returns {Search} the updated search
 *
 */
export function applySuggestions(search, suggestions) {
    if (search.optimizationStrategy === OptimizationStrategy.mixed) {
        return search;
    }
    if (
        suggestions.length === 0 &&
        search.jumps.length === 0
    ) {
        return search;
    } else if (
        suggestions.length === 0 &&
        search.jumps.length > 0 &&
        search.jumps[search.jumps.length - 1].state === JumpState.jumped
    ) {
        return {
            ...search,
            jumps: [
                ...search.jumps.slice(0, search.jumps.length - 1),
                {
                    ...search.jumps[search.jumps.length - 1],
                    state: JumpState.exhausting,

                }
            ],
        }
    } else if (
        suggestions.length === 0 &&
        search.jumps.length > 0 &&
        search.jumps[search.jumps.length - 1].state !== JumpState.jumped
    ) {
        return search;
    }

    const matchingSuggestions = suggestions
        .filter(suggestion => suggestion.value.toLowerCase() !== currentSearchValue(search))
        .filter(suggestion => suggestion.value.toLowerCase().startsWith(currentSearchValue(search)))
    if (matchingSuggestions.length === 0 && search.jumps.length === 0) {
        return search;
    }

    switch (search.optimizationStrategy) {
        case OptimizationStrategy.accuracy:
            if (matchingSuggestions.length === 0 && search.jumps.length > 0) {
                return {
                    ...search,
                    jumps: [
                        ...search.jumps.slice(0, -1),
                        {
                            ...search.jumps[search.jumps.length - 1],
                            state: JumpState.exhausting,

                        }
                    ],
                }
            }
            if (matchingSuggestions.length > 0) {
                const lastMatchingSuggestion = matchingSuggestions[matchingSuggestions.length - 1];
                return {
                    ...search,
                    jumps: [
                        ...search.jumps,
                        {
                            value: lastMatchingSuggestion.value.toLowerCase(),
                            state: JumpState.jumped,
                        }
                    ],
                };
            }
            throw new Error('Implementation defect: should not be reachable')
        case OptimizationStrategy.speed:
            if (matchingSuggestions.length === 0) {
                return {
                    ...search,
                    jumps: [
                        ...search.jumps.slice(0, -1),
                        {
                            ...search.jumps[search.jumps.length - 1],
                            state: JumpState.exhausting,
                        }
                    ],
                }
            }
            const lastMatchingSuggestion = matchingSuggestions[matchingSuggestions.length - 1];
            const lastJump = search.jumps[search.jumps.length - 1];
            if (lastJump && lastMatchingSuggestion.value.toLowerCase().startsWith(lastJump.value)) {
                return {
                    ...search,
                    jumps: [
                        ...search.jumps.slice(0, -1),
                        {
                            ...search.jumps[search.jumps.length - 1],
                            state: JumpState.exhausted,
                        }
                    ],
                }
            }
            let nextJumpValue;
            if (matchingSuggestions.length === 1) {
                nextJumpValue = matchingSuggestions[0].value.toLowerCase().slice(0, 3);
            } else {
                const lastMatchingSuggestion = matchingSuggestions[matchingSuggestions.length - 1];
                nextJumpValue = incrementToken(lastMatchingSuggestion.value.toLowerCase().slice(0, 3), search.optimizationStrategy);
            }
            return {
                ...search,
                jumps: [
                    ...search.jumps,
                    {
                        value: nextJumpValue,
                        state: JumpState.jumped,
                    }
                ],
            };
            throw new Error('Implementation defect: should not be reachable')
        default:
            throw new Error(`Unknown optimization strategy: ${search.optimizationStrategy}`);
    }
}

/**
 * Determines whether the provided value is between the start and end value.
 * The start is inclusive and the end is exclusive.
 *
 * @param start
 * @param end
 * @param value
 * @returns {boolean}
 */
export function isBetween(start, value, end) {
    return start <= value && value < end;
}

/**
 * Increments a token alphabetically.
 *
 * If the optimization strategy is `accuracy`, the incrementation rules are as follows:
 * * if the last letter is between `a` and `z` increment it by one
 *      * e.g. a -> b, b -> c, ..., x -> y; aa -> ab, ab -> ac, ..., ax -> ay
 * * if the last letter is not between `a` and `z` and the token length is 1, increment it to aa
 *     * i.e. z -> aa
 * * if the last letter is not between `a` and `z` and the second last letter is between `a` and `z`, increment the second last letter by one and remove the last letter
 *     * e.g. az -> b, bz -> c, ..., xz -> y
 * * if both the last and second last letter are not between `a` and `z`,
 *     * if the second last letter is before `a`, set both the last and second last letter to `a` e.g. ` z` -> aa, `!z` -> aa, `@z` -> aa
 *     * otherwise, replace the last z by aa e.g. zz -> zaa, zzz -> zzaa, ..., xzz -> xzaa
 *
 * If the optimization strategy is `speed`, the incrementation rules are as follows:
 * * if there are 4 or more letters, remove all but the first two letters
 * * if there are less than 4 letters, increment the last letter
 * the incrementation rules are as follows:
 * * if the token length is 1 or the last letter is between `a` and `z` increment it by one
 *     * e.g. a -> b, b -> c, ..., x -> y; aa -> ab, ab -> ac, ..., ax -> ay
 * * if the token length is 1 and the last letter is not between `a` and `z`, throw an error
 * * if the token length is >1 and last letter is not between `a` and `z` increment the second last letter by one and remove the last letter
 *    * e.g. az -> b, bz -> c, ..., xz -> y
 *
 * @param {string} token - the token to increment
 * @param {OptimizationStrategy} optimizationStrategy - the optimization strategy to use
 *
 * @returns {string} the incremented token
 */
export function incrementToken(token, optimizationStrategy) {
    switch (optimizationStrategy) {
        case OptimizationStrategy.accuracy:
            const lastLetter = token[token.length - 1];
            const secondLastLetter = token[token.length - 2];

            if (isBetween('a', lastLetter, 'z')) {
                return token.slice(0, -1) + String.fromCharCode(lastLetter.charCodeAt(0) + 1);
            } else if (!isBetween('a', lastLetter, 'z') && token.length === 1) {
                return token.slice(0, -1) + 'aa';
            } else if (!isBetween('a', lastLetter, 'z') && isBetween('a', secondLastLetter, 'z')) {
                return token.slice(0, -2) + String.fromCharCode(secondLastLetter.charCodeAt(0) + 1);
            } else if (!isBetween('a', lastLetter, 'z') && !isBetween('a', secondLastLetter, 'z')) {
                if (secondLastLetter < 'a') {
                    return token.slice(0, -2) + 'aa';
                } else {
                    return token.slice(0, -1) + 'aa';
                }
            } else {
                throw new Error('Implementation defect: token incrementation failed for token ' + token);
            }
        case OptimizationStrategy.speed:
            if (token.length === 1 && token >= 'z') {
                throw new Error('Implementation defect: wrap around is not allowed for single letter tokens');
            }

            let incremented = token;
            if (incremented.length >= 4) {
                incremented = incremented.slice(0, 3);
            }
            if (incremented[incremented.length - 1] < 'a') {
                return incremented.slice(0, -1) + 'a';
            } else if (incremented[incremented.length - 1] < 'z') {
                return incremented.slice(0, -1) + String.fromCharCode(incremented.charCodeAt(incremented.length - 1) + 1);
            } else if (incremented[incremented.length - 1] === 'z') {
                return incremented.slice(0, -2) + String.fromCharCode(incremented[incremented.length - 2].charCodeAt(0) + 1);
            } else {
                throw new Error('Implementation defect: token incrementation failed for token ' + token);
            }
        case OptimizationStrategy.mixed:
            if (token.length !== 3) {
                throw new Error('Implementation defect: mixed optimization strategy is only supported for 3 letter tokens');
            }
            const firstChar = token.charAt(0);
            const secondLastChar = token.charAt(1);
            const thirdChar = token.charAt(2);

            if (thirdChar !== 'z') {
                return token.substring(0, 2) + String.fromCharCode(thirdChar.charCodeAt(0) + 1);
            } else if (secondLastChar !== 'z') {
                return token.substring(0, 1) + String.fromCharCode(secondLastChar.charCodeAt(0) + 1) + 'a';
            } else if (firstChar !== 'z') {
                return String.fromCharCode(firstChar.charCodeAt(0) + 1) + 'aa';
            } else {
                throw new Error('Implementation defect: wrap around is not allowed');
            }
        default:
            throw new Error(`Implementation defect: Unknown optimization strategy: "${optimizationStrategy}"`);
    }
}

/**
 * Calculates the next search value.
 * The calculation does not depend on the optimization strategy.
 *
 * * if the search is not jumping, increment the search value
 * * if the search is jumping and the last jump is exhausting, increment the jump value and transition to exhausted if the incremented jump value ends in `z`
 * * if the search is jumping and the last jump is exhausted, apply the jump value to either the previous jump or the search value and remove the jump
 *     * if there is no previous jump, apply the jump value to the search value
 *     * if there is a previous jump, apply the jump value to the previous jump and set the state of the previous jump to exhausting
 *
 * @param {Search} search - the search to calculate the next search for
 *
 */
export function calculateNextSearch(search) {
    let updatedSearch = {
        ...search,
    }
    if (updatedSearch.jumps.length === 0) {
        return {
            ...updatedSearch,
            value: incrementToken(updatedSearch.value, search.optimizationStrategy),
        }
    } else {
        const lastJump = updatedSearch.jumps[updatedSearch.jumps.length - 1];
        if (lastJump.state === JumpState.jumped) {
            return {
                ...updatedSearch,
                jumps: [
                    ...updatedSearch.jumps.slice(0, -1),
                    {
                        ...lastJump,
                        state: JumpState.exhausting,
                    }
                ],
            }
        } else if (lastJump.state === JumpState.exhausting) {
            const incrementedJumpValue = incrementToken(lastJump.value, search.optimizationStrategy);
            if (incrementedJumpValue.endsWith('z')) {
                return {
                    ...updatedSearch,
                    jumps: [
                        ...updatedSearch.jumps.slice(0, -1),
                        {
                            ...lastJump,
                            value: incrementedJumpValue,
                            state: JumpState.exhausted,
                        }
                    ],
                }
            } else {
                return {
                    ...updatedSearch,
                    jumps: [
                        ...updatedSearch.jumps.slice(0, -1),
                        {
                            ...lastJump,
                            value: incrementedJumpValue,
                        }
                    ],
                }
            }
        } else if (lastJump.state === JumpState.exhausted) {
            const previousJump = updatedSearch.jumps[updatedSearch.jumps.length - 2];
            if (previousJump) {
                return {
                    ...updatedSearch,
                    jumps: [
                        ...updatedSearch.jumps.slice(0, -2),
                        {
                            ...previousJump,
                            value: incrementToken(lastJump.value, search.optimizationStrategy),
                            state: JumpState.exhausting,
                        }
                    ],
                }
            } else {
                return {
                    ...updatedSearch,
                    value: incrementToken(lastJump.value, search.optimizationStrategy),
                    jumps: [
                        ...updatedSearch.jumps.slice(0, -1),
                    ],
                }
            }
        } else {
            throw new Error('Implementation defect: Unknown jump state');
        }
    }
}

/**
 * Retrieves the next search value.
 *
 * The state of the search determines how the next search value is retrieved:
 * * if the search is not jumping, return the search value
 * * otherwise, return the jump value
 *
 * @param {Search} search - the search to retrieve the next search value for
 *
 * @returns {string} the next search value
 */
export function currentSearchValue(search) {
    if (search.jumps.length === 0) {
        return search.value;
    } else {
        return search.jumps[search.jumps.length - 1].value;
    }
}

/**
 * Checks if the search is exhausted.
 *
 * The search is exhausted if the current search value is equal or larger than the stop token.
 *
 * @param {Search} search - the search to check
 */
export function isSearchExhausted(search) {
    return currentSearchValue(search) >= search.stopToken;
}
