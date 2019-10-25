import {
    expect
} from 'chai';

import * as utils from '../../src/utils';

import * as chai from 'chai';
import sinon from 'sinon';
void sinon;
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe('remove_buffers', function() {
    const floatArray = new Float32Array([1.2, 3.14, 2.78, 5, 77.0001]);

    const uintArray = new Uint8Array([1, 2, 3, 4, 5]);

    it('extracts a Float32Array', function() {
        const rawState = {
            buffer: floatArray,
        };
        const {state, buffers, buffer_paths} = utils.remove_buffers(rawState);
        expect(state).to.eql({});
        expect(buffers).to.deep.equal([floatArray.buffer]);
        expect(buffer_paths).to.deep.equal([['buffer']]);
    });

    it('extracts a Uint8Array', function() {
        const rawState = {
            buffer: uintArray,
        };
        const {state, buffers, buffer_paths} = utils.remove_buffers(rawState);
        expect(state).to.eql({});
        expect(buffers).to.deep.equal([uintArray.buffer]);
        expect(buffer_paths).to.deep.equal([['buffer']]);
    });

    it('extracts a DataView', function() {
        const rawState = {
            buffer: new DataView(floatArray.buffer),
        };
        const {state, buffers, buffer_paths} = utils.remove_buffers(rawState);
        expect(state).to.eql({});
        expect(buffers).to.deep.equal([floatArray.buffer]);
        expect(buffer_paths).to.deep.equal([['buffer']]);
    });

    it('extracts an ArrayBuffer', function() {
        const rawState = {
            buffer: floatArray.buffer,
        };
        const {state, buffers, buffer_paths} = utils.remove_buffers(rawState);
        expect(state).to.eql({});
        expect(buffers).to.deep.equal([floatArray.buffer]);
        expect(buffer_paths).to.deep.equal([['buffer']]);
    });

    it('extracts buffers from an array', function() {
        const rawState = [uintArray, floatArray.buffer];
        const {state, buffers, buffer_paths} = utils.remove_buffers(rawState);
        expect(state).to.deep.equal([null, null]);
        expect(buffers).to.deep.equal([uintArray.buffer, floatArray.buffer]);
        expect(buffer_paths).to.deep.equal([[0], [1]]);
    });

    describe('nested structures', function() {

        it('array in object', function() {
            let rawState = {
                buffers: [uintArray, floatArray.buffer]
            };
            let {state, buffers, buffer_paths} = utils.remove_buffers(rawState);
            expect(state).to.deep.equal({buffers: [null, null]});
            expect(buffers).to.deep.equal([uintArray.buffer, floatArray.buffer]);
            expect(buffer_paths).to.deep.equal([['buffers', 0], ['buffers', 1]]);
        });

        it('object in array', function() {
            let rawState = [
                { buffer: uintArray },
                { buffer: floatArray.buffer },
            ];
            let {state, buffers, buffer_paths} = utils.remove_buffers(rawState);
            expect(state).to.deep.equal([{}, {}]);
            expect(buffers).to.deep.equal([uintArray.buffer, floatArray.buffer]);
            expect(buffer_paths).to.deep.equal([[0, 'buffer'], [1, 'buffer']]);
        });

        it('array in array', function() {
            let rawState = ['string', 45, [uintArray, floatArray.buffer]];
            let {state, buffers, buffer_paths} = utils.remove_buffers(rawState);
            expect(state).to.deep.equal(['string', 45, [null, null]]);
            expect(buffers).to.deep.equal([uintArray.buffer, floatArray.buffer]);
            expect(buffer_paths).to.deep.equal([[2, 0], [2, 1]]);
        });

        it('object in object', function() {
            let rawState = {
                a: 'string',
                b: 45,
                buffers: {
                    bufferA: uintArray,
                    bufferB: floatArray.buffer,
                },
            };
            let {state, buffers, buffer_paths} = utils.remove_buffers(rawState);
            expect(state).to.deep.equal({a: 'string', b: 45, buffers: {}});
            expect(buffers).to.deep.equal([uintArray.buffer, floatArray.buffer]);
            expect(buffer_paths).to.deep.equal(
                [['buffers', 'bufferA'], ['buffers', 'bufferB']]
            );
        });

    });

});
