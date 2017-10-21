// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';
import { spy } from 'sinon';

import { ArrayExt } from '@phosphor/algorithm';

import { Selection } from '../../../lib/phosphor/currentselection';

function getLastMessage(subscriber) {
    const [_, message] = subscriber.getCall(0).args;
    return message;
}

describe('Selection with items', function() {
    let selection;
    let subscriber; // subscribe to signals from selection
    let sequence;

    beforeEach(function() {
        sequence = ['value-0', 'value-1'];
        selection = new Selection(sequence);
        selection.index = null;
        subscriber = spy();
        selection.selectionChanged.connect(subscriber);
    });

    it('be unselected', function() {
        expect(selection.index).to.be.null;
        expect(selection.value).to.be.null;
    });

    it('set an item', function() {
        selection.index = 1;
        expect(selection.index).to.equal(1);
        expect(selection.value).to.equal('value-1');
    });

    it('dispatch a signal when setting an item', function() {
        selection.index = 1;
        expect(subscriber.calledOnce).to.be.true;
        const message = getLastMessage(subscriber);
        expect(message).to.deep.equal({
            previousIndex: null,
            previousValue: null,
            currentIndex: 1,
            currentValue: 'value-1'
        });
    });

    it('set a value', function() {
        selection.value = 'value-0';
        expect(selection.value).to.equal('value-0');
        expect(selection.index).to.equal(0);
    });

    it('dispatch a signal when setting a value', function() {
        selection.value = 'value-0';
        expect(subscriber.calledOnce).to.be.true;
        const [_, message] = subscriber.getCall(0).args;
        expect(message).to.deep.equal({
            previousIndex: null,
            previousValue: null,
            currentIndex: 0,
            currentValue: 'value-0'
        });
    });

    it('set to null if the index is out of bounds', function() {
        selection.index = 22;
        expect(selection.index).to.be.null;
        expect(selection.value).to.be.null;
    });

    it('set to null if the value is not present', function() {
        selection.value = 'not-a-value';
        expect(selection.index).to.be.null;
        expect(selection.value).to.be.null;
    });

    it('adjust after inserting an item', function() {
        const insertedValue = 'value-before-1';
        ArrayExt.insert(sequence, 1, insertedValue);
        // sequence is now [value-0, value-before-1, value-1]
        selection.adjustSelectionForInsert(1, insertedValue);
        expect(selection.index).to.equal(1);
        expect(selection.value).to.equal(insertedValue);
    });

    it('adjust after an item move', function() {
        ArrayExt.reverse(sequence);
        selection.adjustSelectionForMove(0, 1);
        expect(selection.index).to.be.null;
        expect(selection.value).to.be.null;
    });

    it('adjust after removing an item', function() {
        ArrayExt.removeAt(sequence, 0);
        selection.adjustSelectionForRemove(0, 'value-0');
        expect(selection.index).to.be.null;
        expect(selection.value).to.be.null;
    });

    it('clear the selection', function() {
        selection.clearSelection();
        expect(selection.index).to.be.null;
        expect(selection.value).to.be.null;
    });
});


describe('Selection with items with an item selected', function() {
    let selection;
    let subscriber; // subscribe to signals from selection
    let sequence;

    beforeEach(function() {
        sequence = ['value-0', 'value-1'];
        selection = new Selection(sequence);
        selection.index = 1;
        subscriber = spy();
        selection.selectionChanged.connect(subscriber);
    });

    it('set another item', function() {
        selection.index = 0;
        expect(selection.index).to.equal(0);
        expect(selection.value).to.equal('value-0');
        const message = getLastMessage(subscriber);
        expect(message).to.deep.equal({
            previousIndex: 1,
            previousValue: 'value-1',
            currentIndex: 0,
            currentValue: 'value-0'
        });
    });

    it('adjust after inserting an item', function () {
        const insertedValue = 'value-before-1';
        ArrayExt.insert(sequence, 1, insertedValue);
        selection.adjustSelectionForInsert(1, insertedValue);
        expect(selection.index).to.equal(2);
        expect(selection.value).to.equal('value-1');
    });

    it('adjust after removing an item', function() {
        ArrayExt.removeAt(sequence, 0);
        selection.adjustSelectionForRemove(0, 'value-0');
        expect(selection.index).to.equal(0);
        expect(selection.value).to.equal('value-1');
    });

    it('adjust after removing the selected item', function() {
        ArrayExt.removeAt(sequence, 1);
        selection.adjustSelectionForRemove(1, 'value-1');
        expect(selection.index).to.equal(0);
        expect(selection.value).to.equal('value-0');
        const message = getLastMessage(subscriber);
        expect(message).to.deep.equal({
            previousIndex: 1,
            previousValue: 'value-1',
            currentIndex: 0,
            currentValue: 'value-0'
        });
    });
});
