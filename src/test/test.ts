/// <reference path="../../typings/index.d.ts" />

import * as assert from 'power-assert';
import Hello from '../Hello';

describe('Test', () => {
    describe('Hello', () => {
        it('hello world!!', () => {
            let test:Hello = new Hello();
            assert.equal(test.hello(), 'hello world!!');
        });
    });
});
