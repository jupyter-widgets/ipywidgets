import {
    DummyManager
} from './dummy-manager';

import {
    expect
} from 'chai';

// test ManagerBase by creating a simple derived class
// and testing it.

describe("ManagerBase", function() {
    beforeEach(function() {
        this.managerBase = new DummyManager();
    });

    it('comm_target_name', function() {
        expect(this.managerBase.comm_target_name).to.equal('jupyter.widget');
    });

    it('display_model', function() {
      expect(this.managerBase.display_model).to.not.be.undefined;
    });

    it('setViewOptions', function() {
      expect(this.managerBase.setViewOptions).to.not.be.undefined;
    });

    it('create_view', function() {
      expect(this.managerBase.create_view).to.not.be.undefined;
    });

    it('callbacks', function() {
      // Cell-less call
      let c = this.managerBase.callbacks();
      expect(c).to.be.an('object');
      expect(c.iopub).to.be.undefined;
    });

    it('get_model', function() {
      expect(this.managerBase.get_model).to.not.be.undefined;
    });

    it('handle_comm_open', function() {
      expect(this.managerBase.handle_comm_open).to.not.be.undefined;
    });

    it('new_widget', function() {
      expect(this.managerBase.new_widget).to.not.be.undefined;
    });

    it('new_model', function() {
      expect(this.managerBase.new_model).to.not.be.undefined;
    });

    it('clear_state', function() {
      expect(this.managerBase.clear_state).to.not.be.undefined;
    });

    it('get_state', function() {
      expect(this.managerBase.get_state).to.not.be.undefined;
    });

    it('set_state', function() {
      expect(this.managerBase.set_state).to.not.be.undefined;
    });
});

