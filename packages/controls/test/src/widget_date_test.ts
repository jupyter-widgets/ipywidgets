import {
    DummyManager
} from './dummy-manager';

import {
    expect
} from 'chai';

import * as sinon from 'sinon';

import * as widgets from '../../lib';

function getDatepicker(parent: Element): HTMLInputElement {
    const elem = parent.querySelector('input[type="date"]');
    return <HTMLInputElement>elem;
}

describe('DatePickerView', function() {
    beforeEach(async function() {
        this.manager = new DummyManager();
        const modelId = 'u-u-i-d';
        this.model = await this.manager.new_model({
            model_name: 'DatePickerModel',
            model_module: '@jupyter-widgets/controls',
            model_module_version: '1.0.0',
            model_id: modelId,
        }, { description: 'test-date-model'} );
    });

    it('construction', function() {
        const options = { model: this.model };
        const view = new widgets.DatePickerView(options);
        expect(view).to.not.be.undefined;
    });

    it('initial date value', function() {
        const testDate = new Date('2017-02-25');
        this.model.set('value', testDate);
        const options = { model: this.model };
        const view = new widgets.DatePickerView(options);
        view.render();
        expect(getDatepicker(view.el).valueAsDate.getTime())
            .to.equal(testDate.getTime());
    });

    it('no initial value', function() {
        this.model.set('value', null);
        const options = { model: this.model };
        const view = new widgets.DatePickerView(options);
        view.render();
        expect(getDatepicker(view.el).valueAsDate).to.be.a('null');
    });

    it('set the model date', function() {
        this.model.set('value', null);
        const options = { model: this.model };
        const view = new widgets.DatePickerView(options);
        view.render();

        // Simulate setting the date in the datepicker
        const testDate = new Date('2015-02-22');
        const datepicker = getDatepicker(view.el);
        datepicker.valueAsDate = testDate;
        datepicker.dispatchEvent(new Event('change', {'bubbles':true}));

        expect(this.model.get('value').getTime())
            .to.equal(testDate.getTime());
    });

    it('update when the model changes', function() {
        this.model.set('value', null);
        const options = { model: this.model };
        const view = new widgets.DatePickerView(options);
        view.render();

        const testDate = new Date('2015-02-22');
        this.model.set('value', testDate);
        const datepicker = getDatepicker(view.el);
        expect(datepicker.valueAsDate.getTime())
            .to.equal(testDate.getTime());
    });

});

describe('serialize_date', function() {
    it('null date', function() {
        expect(widgets.serialize_date(null)).to.be.a('null');
    });

    it('UTC date', function() {
        const date = new Date('Sat May 13 2017 00:00:00 UTC');
        const expectedSerialization = {
            year: 2017,
            month: 4,
            date: 13
        };
        expect(widgets.serialize_date(date))
            .to.deep.equal(expectedSerialization);
    });

    it('date in other locale as UTC', function() {
        const date = new Date('Sat May 13 2017 00:00:00 GMT+0100 (BST)');
        const expectedSerialization = {
            year: 2017,
            month: 4,
            date: 12 // still on 12th May in UTC
        };
        expect(widgets.serialize_date(date))
            .to.deep.equal(expectedSerialization);
    });

    it('date before 100AD', function() {
        const date = new Date('0005-04-28');
        const expectedSerialization = {
            year: 5,
            month: 3,
            date: 28
        };
        expect(widgets.serialize_date(date))
            .to.deep.equal(expectedSerialization);
    });
});

describe('deserialize_date', function() {
    it('null date', function() {
        expect(widgets.deserialize_date(null)).to.be.a('null');
    });

    it('valid date', function() {
        const serialized = {
            year: 2017,
            month: 4,
            date: 12
        };
        const expectedDate = new Date('2017-05-12');
        expect(widgets.deserialize_date(serialized).getTime())
            .to.equal(expectedDate.getTime());
    });
});
