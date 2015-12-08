const ManagerBase = require('../index.js').ManagerBase;

export class DummyManager extends ManagerBase {
    constructor() {
        super();
        this.el = window.document.createElement('div');
    }
    
    display_view(msg, view, options) {
        return Promise.resolve(view).then(view => {
            this.el.appendChild(view.el);
            view.on('remove', () => console.log('view removed', view));
            return view;
        });
    }
    
    _create_comm(comm_target_name, model_id, metadata) {
        function nullFunction() {}
        return Promise.resolve({
            on_close: nullFunction,
            on_msg: nullFunction,
            send: nullFunction,
            close: nullFunction
        });
    }
    
    _get_comm_info() {
        return Promise.resolve({});
    }
}
