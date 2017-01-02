import {
    DummyManager
} from './dummy-manager';

import expect = require('expect.js');

// test ManagerBase by creating a simple derived class
// and testing it.

describe("ManagerBase", function() {
    beforeEach(function() {
        this.managerBase = new DummyManager();
    });

    it('comm_target_name', function() {
        expect(this.managerBase.comm_target_name).to.equal('jupyter.widget');
    });

    it('version_comm_target_name', function() {
        expect(this.managerBase.version_comm_target_name).to.equal('jupyter.widget.version');
    });

    it('get_state', function() {
        expect(this.managerBase.get_state).to.not.be(void 0);
    });

    it('set_state', function() {
        expect(this.managerBase.set_state).to.not.be(void 0);
    });

    it('new_model', function() {
        expect(this.managerBase.new_model).to.not.be(void 0);
    });

    it('new_widget', function() {
        expect(this.managerBase.new_widget).to.not.be(void 0);
    });

    it('handle_comm_open', function() {
        expect(this.managerBase.handle_comm_open).to.not.be(void 0);
    });

    it('get_model', function() {
        expect(this.managerBase.get_model).to.not.be(void 0);
    });

    it('callbacks', function() {

        // Cell-less call
        let c = this.managerBase.callbacks();
        expect(c).to.be.an('object');
        expect(c.iopub).to.be(void 0);

        // Spoof a call with a cell
        c = this.managerBase.callbacks({ options: { cell: true } });
        expect(c).to.be.an('object');
    });

    it('create_view', function() {
        expect(this.managerBase.create_view).to.not.be(void 0);
    });
});
