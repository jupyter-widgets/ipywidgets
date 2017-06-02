import * as widgets from '@jupyter-widgets/controls';
import * as base from '@jupyter-widgets/base';
import '@jupyter-widgets/controls/css/widgets.css';
import * as PWidget from '@phosphor/widgets';

export
class WidgetManager extends base.ManagerBase<HTMLElement> {
    constructor(kernel, el) {
        super();
        this.kernel = kernel;
        this.el = el;

        // Create a comm manager shim
        this.commManager = new base.shims.services.CommManager(kernel);

        // Register the comm target
        this.commManager.register_target(this.comm_target_name, this.handle_comm_open.bind(this));
    }

    display_view(msg, view, options) {
        return Promise.resolve(view).then((view) => {
            PWidget.Widget.attach(view.pWidget, this.el);
            view.on('remove', function() {
                console.log('view removed', view);
            });
            return view;
        });
    }

    protected loadClass(className: string, moduleName: string, moduleVersion: string): Promise<any> {
        if (moduleName === '@jupyter-widgets/controls') {
            if (widgets[className]) {
                return Promise.resolve(widgets[className]);
            } else {
                return Promise.reject(`Cannot find class ${className}`)
            }
        } else {
            return Promise.reject(`Cannot find module ${moduleName}`);
        }
    }

    _create_comm(targetName, id, metadata) {
        return this.commManager.new_comm(targetName, metadata, id);
    }

    _get_comm_info() {
        return Promise.resolve({});
    }

    kernel: any;
    el: HTMLElement;
    commManager: any;
}
