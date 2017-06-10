
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


describe('data output', () => {
    let view;
    const textValue = 'this-is-a-test\n'

    // Pandas dataframe
    const modelState = {
        outputs: [
            {
                "output_type": "display_data",
                "data": {
                    "text/plain": "   a  b\n0  1  4\n1  2  5\n2  3  6",
                    "text/html": "<div>\n<table border=\"1\" class=\"dataframe\">\n  <thead>\n    <tr style=\"text-align: right;\">\n      <th></th>\n      <th>a</th>\n      <th>b</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <th>0</th>\n      <td>1</td>\n      <td>4</td>\n    </tr>\n    <tr>\n      <th>1</th>\n      <td>2</td>\n      <td>5</td>\n    </tr>\n    <tr>\n      <th>2</th>\n      <td>3</td>\n      <td>6</td>\n    </tr>\n  </tbody>\n</table>\n</div>"
                },
                "metadata": {}
            }
        ],
    }

    beforeEach(async function() {
        view = await newWidget(modelState)
    })

    it('display the dataframe', () => {
        const outputView = (view as OutputView);
        const el = view.el;
        expect(el.querySelectorAll('table').length).to.equal(1);
    });
})


describe('widget output', () => {
    let view;
    const modelState = {
        "outputs": [
            {
                "output_type": "display_data",
                "data": {
                    "application/vnd.jupyter.widget-view+json": {
                        "model_id": "adffc4580a0944f6929c381463b0059b",
                        "version_minor": "0",
                        "version_major": "2"
                    },
                    "text/plain": "A Jupyter Widget"
                },
                "metadata": {}
            }
        ]
    };

    beforeEach(async function() {
        const widgetTag = document.createElement('div');
        widgetTag.className = 'widget-subarea';
        document.body.appendChild(widgetTag);
        const manager = new HTMLManager()

        // We need to seed the manager with the state of the widgets
        const managerState = {
            "adffc4580a0944f6929c381463b0059b": {
                "model_name": "IntSliderModel",
                "model_module": "@jupyter-widgets/controls",
                "model_module_version": "3.0.0",
                "state": {
                    "style": "IPY_MODEL_3b8780f457254737a83be48bc32b0613",
                    "_view_module": "@jupyter-widgets/controls",
                    "layout": "IPY_MODEL_33cb011834fd4c9d9af512e5e98c9904",
                    "value": 45,
                    "_model_module": "@jupyter-widgets/controls"
                }
            },
            "3b8780f457254737a83be48bc32b0613": {
                "model_name": "SliderStyleModel",
                "model_module": "@jupyter-widgets/controls",
                "model_module_version": "3.0.0",
                "state": {
                    "description_width": "",
                    "_view_module": "@jupyter-widgets/controls",
                    "_model_module": "@jupyter-widgets/controls"
                }
            },
            "33cb011834fd4c9d9af512e5e98c9904": {
                "model_name": "LayoutModel",
                "model_module": "@jupyter-widgets/base",
                "model_module_version": "3.0.0",
                "state": {}
            },
        }
        manager.set_state({
            state: managerState,
            version_major: 2,
            version_minor: 0
        });
        const modelId = 'u-u-i-d';
        const modelCreate: widgets.ModelOptions = {
            model_name: 'OutputModel',
            model_id: modelId,
            model_module: '@jupyter-widgets/controls',
            model_module_version: '*'
        }
        const model = await manager.new_model(modelCreate, modelState);
        view = await manager.display_model(
            undefined, model, { el: widgetTag }
        );
    });

    it('show a slider widget', () => {
        const outputView = (view as OutputView);
        const el = view.el;
        expect(el.querySelectorAll('.slider').length).to.equal(1);
    });
});
