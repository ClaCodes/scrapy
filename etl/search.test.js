import {createSearch, updateSearch} from "./search.js";

describe('The search strategy', () => {

    it('should be possible to create a search with an initial value', () => {
        const initialSearch = createSearch('initial value');

        expect(initialSearch).toMatchObject({
            origin: null,
            value: 'initial value',
            jump: null,
        });
    });

    describe('when updating it based on suggestions', () => {

        it('should jump if the search token is a prefix of at least one of the suggestions ', () => {
            const initialSearch = createSearch('search token');

            const updatedSearch = updateSearch(
                initialSearch,
                [
                    'search token',
                    'search token 1',
                    'search token 2',
                ]
            );

            expect(updatedSearch).toMatchObject({
                origin: initialSearch,
                value: 'search token 1',
                jump: null,
            });
        });
    });
})
