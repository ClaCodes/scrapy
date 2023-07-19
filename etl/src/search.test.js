import {createSearch, incrementToken, updateSearch} from "./search.js";

describe('The search', () => {

    it('should be possible to create a search with an initial value', () => {
        const initialSearch = createSearch('initial value');

        expect(initialSearch).toMatchObject({
            origin: 'root',
            value: 'initial value',
            jump: null,
        });
    });

    describe('when incrementing the search token', () => {

        it('should increment the last letter of the token by one if it is not z', () => {
            const tokens = [
                'a',
                'b',
                'y',
                'aa',
                'bb',
                'yy',
                'aaa',
                'bbb',
                'yyy',
            ];

            const expected = [
                'b',
                'c',
                'z',
                'ab',
                'bc',
                'yz',
                'aab',
                'bbc',
                'yyz',
            ];

            tokens.forEach((token, index) => {
                expect(incrementToken(token)).toEqual(expected[index]);
            })
        })

        it('should increment the token to "aa" if the length is 1 and it is  "z"', () => {
            expect(incrementToken('z')).toEqual('aa');
        });

        it('should increment the second last letter by one and remove the last letter if the last letter is "z" and the second last letter is not "z"', () => {
            const tokens = [
                'az',
                'bz',
                'yz',
                'aaz',
                'bbz',
                'yyz',
                'aaaz',
                'bbbz',
                'yyyz',
            ];

            const expected = [
                'b',
                'c',
                'z',
                'ab',
                'bc',
                'yz',
                'aab',
                'bbc',
                'yyz',
            ];

            tokens.forEach((token, index) => {
                expect(incrementToken(token)).toEqual(expected[index]);
            })
        });

        it('should replace the last "z" by "aa" if the last letter is "z" and the second last letter is "z"', () => {
            const tokens = [
                'zz',
                'zzz',
                'xzz',
                'zzzz',
                'zzzzz',
            ];

            const expected = [
                'zaa',
                'zzaa',
                'xzaa',
                'zzzaa',
                'zzzzaa',
            ];

            tokens.forEach((token, index) => {
                expect(incrementToken(token)).toEqual(expected[index]);
            });
        });
    })

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
