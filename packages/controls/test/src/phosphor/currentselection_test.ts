
import { expect } from 'chai';
import { spy } from 'sinon';

import { Selection } from '../../../lib/phosphor/currentselection'

describe('Selection with items', function() {
    let selection;
    let subscriber; // subscribe to signals from selection

    beforeEach(function() {
        selection = new Selection(['value-0', 'value-1'])
        selection.index = null;
        subscriber = spy()
        selection.selectionChanged.connect(subscriber);
    });

    it('be unselected', function() {
        expect(selection.index).to.be.null;
        expect(selection.value).to.be.null;
    })

    it('set an item', function() {
        selection.index = 1;
        expect(selection.index).to.equal(1);
        expect(selection.value).to.equal('value-1')
    })

    it('dispatch a signal when setting an item', function() {
        selection.index = 1;
        expect(subscriber.calledOnce).to.be.true;
        const [_, message] = subscriber.getCall(0).args
        expect(message).to.deep.equal({
            previousIndex: null,
            previousValue: null,
            currentIndex: 1,
            currentValue: 'value-1'
        })
    })
});
