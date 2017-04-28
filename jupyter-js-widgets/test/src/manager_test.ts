import {
    DummyManager
} from './dummy-manager';

import {
    expect
} from 'chai';

// test ManagerBase by creating a simple derived class
// and testing it.

describe("ManagerBase", () => {
    beforeEach(() => {
        this.managerBase = new DummyManager();
    });

    it('comm_target_name', () => {
        expect(this.managerBase.comm_target_name).to.equal('jupyter.widget');
    });

    it('get_state', () => {
        expect(this.managerBase.get_state).to.not.be.undefined;
    });

    it('set_state', () => {
        expect(this.managerBase.set_state).to.not.be.undefined;
    });

    it('new_model', () => {
        expect(this.managerBase.new_model).to.not.be.undefined;
    });

    it('new_widget', () => {
        expect(this.managerBase.new_widget).to.not.be.undefined;
    });

    it('handle_comm_open', () => {
        expect(this.managerBase.handle_comm_open).to.not.be.undefined;
    });

    it('get_model', () => {
        expect(this.managerBase.get_model).to.not.be.undefined;
    });

    it('callbacks', () => {

        // Cell-less call
        let c = this.managerBase.callbacks();
        expect(c).to.be.an('object');
        expect(c.iopub).to.be.undefined;

        // Spoof a call with a cell
        c = this.managerBase.callbacks({ options: { cell: true } });
        expect(c).to.be.an('object');
    });

    it('create_view', () => {
        expect(this.managerBase.create_view).to.not.be.undefined;
    });
});
