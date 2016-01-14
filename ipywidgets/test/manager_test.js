const ManagerBase = require('../index.js').ManagerBase;

describe("ManagerBase", function() {
    beforeEach(function() {
        this.managerBase = new ManagerBase();
    });

    it('comm_target_name', function() {
        expect(ManagerBase.comm_target_name).to.be.undefined;
        expect(this.managerBase.comm_target_name).to.equal('jupyter.widget');
    });

    it('register_widget_model', function() {
        expect(ManagerBase.register_widget_model).to.not.be.undefined;
        expect(() => ManagerBase.register_widget_model('test', {})).to.not.throw(Error);
    });

    it('register_widget_view', function() {
        expect(ManagerBase.register_widget_view).to.not.be.undefined;
        expect(() => ManagerBase.register_widget_view('test', {})).to.not.throw(Error);
    });

    it('_create_comm', function() {
        expect(this.managerBase._create_comm).to.not.be.undefined;
        return this.managerBase._create_comm().then(() => {
            assert.ok(false, 'Promise should fail');
        }).catch(err => {});
    });

    it('_get_comm_info', function() {
        expect(this.managerBase._get_comm_info).to.not.be.undefined;
        return this.managerBase._get_comm_info().then(() => {
            assert.ok(false, 'Promise should fail');
        }).catch(err => {});
    });

    it('get_state', function() {
        expect(this.managerBase.get_state).to.not.be.undefined;
    });

    it('set_state', function() {
        expect(this.managerBase.set_state).to.not.be.undefined;
    });

    it('new_model', function() {
        expect(this.managerBase.new_model).to.not.be.undefined;
    });

    it('new_widget', function() {
        expect(this.managerBase.new_widget).to.not.be.undefined;
    });

    it('handle_comm_open', function() {
        expect(this.managerBase.handle_comm_open).to.not.be.undefined;
    });

    it('get_model', function() {
        expect(this.managerBase.get_model).to.not.be.undefined;
    });

    it('callbacks', function() {
        expect(this.managerBase.callbacks).to.not.be.undefined;
        expect(this.managerBase.callbacks).to.not.throw(Error);
        
        // Cell-less call
        let c = this.managerBase.callbacks();
        expect(c).to.be.an('object');
        expect(c.iopub).to.be.undefined;
        
        // Spoof a call with a cell
        c = this.managerBase.callbacks({ options: { cell: true } });
        expect(c).to.be.an('object');
        expect(c.iopub).to.be.an('object');
        expect(c.iopub.output).to.not.be.undefined;
        expect(c.iopub.clear_output).to.not.be.undefined;
        expect(c.iopub.get_cell).to.be.an('function');
    });

    it('create_view', function() {
        expect(this.managerBase.create_view).to.not.be.undefined;
    });

    it('loadClass', function() {
        expect(this.managerBase.loadClass).to.not.be.undefined;
    });

    it('display_view', function() {
        expect(this.managerBase.display_view).to.not.be.undefined;
        expect(this.managerBase.display_view).to.throw(Error);
    });

    it('display_model', function() {
        expect(this.managerBase.loadClass).to.not.be.undefined;
    });
});
