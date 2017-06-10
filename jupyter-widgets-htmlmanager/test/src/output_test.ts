
import { expect } from 'chai';

import { HTMLManager } from '../../lib/';
import { OutputModel, OutputView } from '../../lib/output';

import * as widgets from '@jupyter-widgets/controls'

const newWidget = async (modelState) => {
    const widgetTag = document.createElement('div');
    widgetTag.className = 'widget-subarea';
    document.body.appendChild(widgetTag);
    const manager = new HTMLManager()
    const modelId = 'u-u-i-d';
    const modelCreate: widgets.ModelOptions = {
        model_name: 'OutputModel',
        model_id: modelId,
        model_module: '@jupyter-widgets/controls',
        model_module_version: '*'
    }
    const model = await manager.new_model(modelCreate, modelState);
    const view = await manager.display_model(
        undefined, model, { el: widgetTag }
    );
    return view;
}


describe('text output', () => {
    let view;
    const textValue = 'this-is-a-test\n'
    const modelState = {
        outputs: [
            {
                "output_type": "stream",
                "name": "stdout",
                "text": textValue
            }
        ],
    }

    beforeEach(async function() {
        view = await newWidget(modelState)
    })

    it('create the view', () => {
        expect(view).to.not.be.undefined
    });

    it('display the view', () => {
        const outputView = (view as OutputView);
        const el = view.el;
        expect(el.textContent).to.equal(textValue)
    });
})
