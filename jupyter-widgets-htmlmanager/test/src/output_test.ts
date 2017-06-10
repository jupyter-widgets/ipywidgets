
import * as chai from 'chai';

import { HTMLManager } from '../../lib/';
import { OutputModel, OutputView } from '../../lib/output';

describe('output', () => {

    let model;
    let view;
    let manager;

    beforeEach(async function() {
        const widgetTag = document.createElement('div');
        widgetTag.className = 'widget-subarea';
        document.body.appendChild(widgetTag);
        manager = new HTMLManager()
        const modelId = 'u-u-i-d';
        model = await manager.new_model({
            model_name: 'OutputModel',
            model_id: modelId,
            model_module: '@jupyter-widgets/controls',
            state: {
                outputs: [
                    {
                        "output_type": "stream",
                        "name": "stdout",
                        "text": "hi\n"
                    }
                ],
            }
        });
        view = await manager.display_model(
            undefined, model, { el: widgetTag }
        );
    })

    it('show the view', () => {
        console.error(view);
    });
})
