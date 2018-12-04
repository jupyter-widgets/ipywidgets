import {
    DummyManager, MockComm
} from './dummy-manager';

import {
    expect
} from 'chai';

import {} from "mocha";


import * as widgets from '../src';
let WidgetModel = widgets.WidgetModel;

import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as chai_string from 'chai-string';
chai.use(sinonChai);
chai.use(chai_string);


describe('DOMWidgetModel', function() {
    before(async function() {
        this.manager = new DummyManager();
        // this.comm = new MockComm();
        this.widget = await this.manager.new_widget({
            model_name: 'TestDOMWidget',
            model_module: 'test-widgets',
            model_module_version: '1.0.0',
            view_name: 'TestDOMWidgetView',
            view_module: 'test-widgets',
            view_module_version: '1.0.0',
            model_id: 'widgetA',
        });
    });

    describe('capture', async function() {
        beforeEach(async function() {
            this.view = await this.manager.create_view(this.widget, {});
        });

        it('basics', async function() {
            this.manager.display_view(null, this.view)
            let data = await this.view.captureImage('image/png');
            expect(data).to.startsWith('data:image/png;base64')
        });

        it('before display', async function() {
            let dataPromise = this.view.captureImage('image/png')
            this.manager.display_view(null, this.view)
            let data = await dataPromise;
            expect(data).to.startsWith('data:image/png;base64')
        });

    });

});
