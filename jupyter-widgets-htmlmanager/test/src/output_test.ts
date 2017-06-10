
import { expect } from 'chai';

import { HTMLManager } from '../../lib/';
import { OutputModel, OutputView } from '../../lib/output';

import * as widgets from '@jupyter-widgets/controls'

describe('output', () => {

    let model: widgets.WidgetModel;
    let view;
    let manager: HTMLManager;

    beforeEach(async function() {
        const widgetTag = document.createElement('div');
        widgetTag.className = 'widget-subarea';
        document.body.appendChild(widgetTag);
        manager = new HTMLManager()
        const modelId = 'u-u-i-d';
        const modelCreate: widgets.ModelOptions = {
            model_name: 'OutputModel',
            model_id: modelId,
            model_module: '@jupyter-widgets/controls',
            model_module_version: '*'
        }
        const modelState = {
            outputs: [
                {
                    "output_type": "stream",
                    "name": "stdout",
                    "text": "this-is-a-test\n"
                }
            ],
        }
        model = await manager.new_model(modelCreate, modelState);
        view = await manager.display_model(
            undefined, model, { el: widgetTag }
        );
    })

    it('create the view', () => {
        expect(view).to.not.be.undefined
    });

    it('display the view', () => {
        const outputView = (view as OutputView);
        const el = view.el;
        expect(el.textContent).to.equal('this-is-a-test\n')
    });
})
