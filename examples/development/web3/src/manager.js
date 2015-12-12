require('../node_modules/jupyter-js-widgets/static/components/bootstrap/css/bootstrap.css');
require('../node_modules/jquery-ui/themes/smoothness/jquery-ui.min.css');

const jpywidgets = require('jupyter-js-widgets');

export class WidgetManager extends jpywidgets.ManagerBase {
    constructor(kernel, el) {
        super();
        this.kernel = kernel;
        this.el = el;

        // Create a comm manager shim
        this.commManager = new jpywidgets.shims.services.CommManager(kernel);

        // Register the comm target
        this.commManager.register_target(this.comm_target_name, this.handle_comm_open.bind(this));
    }

    display_view(msg, view, options) {
        var that = this;
        return Promise.resolve(view).then(function(view) {
            that.el.appendChild(view.el);
            view.on('remove', function() {
                console.log('view removed', view);
            });
            return view;
        });
    }
    
    _create_comm(targetName, id, metadata) {
        return this.commManager.new_comm(targetName, metadata, id);
    }
    
    _get_comm_info() {
        return Promise.resolve({});
    }
}
