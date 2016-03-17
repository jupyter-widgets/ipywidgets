const ManagerBase = require('../src/index.js').ManagerBase;

export class DummyManager extends ManagerBase {
    constructor() {
        super();
        this.el = window.document.createElement('div');
    }

    display_view(msg, view, options) {
        return Promise.resolve(view).then(view => {
            this.el.appendChild(view.el);
            view.on('remove', function() {
                console.log('view removed', view);
            });
            return view;
        });
    }

    _get_comm_info() {
        return Promise.resolve({});
    }
}
