
import { expect } from 'chai';

import { Selection } from '../../../lib/phosphor/currentselection'

describe('Selection with items', function() {
    let selection;
    beforeEach(function() {
        selection = new Selection(['value-0', 'value-1'])
        selection.index = null;
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
});
