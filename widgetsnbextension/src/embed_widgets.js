// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

"use strict";

var VIEW_MIME_TYPE = "application/vnd.jupyter.widget-view+json"

var embed_widgets = function() {
    return new Promise(function(resolve) {
        requirejs(['base/js/namespace', 'base/js/dialog', '@jupyter-widgets/controls'], function(Jupyter, dialog, widgets) {

            Jupyter.WidgetManager._managers[0].get_state({
                'drop_defaults': true
            }).then(function(state) {
                var data = JSON.stringify(state, null, '    ');
                // TODO: This does not work right now - we don't know what
                // version of @jupyter-widgets/controls is included in what version of
                // embed-jupyter-widgets.
                var value = '<script src="https://unpkg.com/embed-jupyter-widgets@~' + widgets.version + '/dist/embed.js"></script>\n' +
                            '<script type="application/vnd.jupyter.widget-state+json">\n' + data + '\n</script>';

                var views = [];
                var cells = Jupyter.notebook.get_cells();
                Jupyter.notebook.get_cells().forEach(function(cell) {
                    if (cell.output_area) {
                        cell.output_area.outputs.forEach(function (output) {
                            if (output.data
                                && output.data[VIEW_MIME_TYPE]
                                && state.state[output.data[VIEW_MIME_TYPE].model_id]) {
                                views.push(('\n<script type="'+VIEW_MIME_TYPE+'">\n'
                                    + JSON.stringify(output.data[VIEW_MIME_TYPE], null, '    ')
                                    + '\n</script>'));
                            }
                        });
                    }
                })
                value += views.join('\n');

                var content = document.createElement('textarea');
                content.setAttribute('readonly', 'true');
                content.style.width = '100%';
                content.style.minHeight = '250px';
                content.value = value;

                var mod = dialog.modal({
                    show: true,
                    title: 'Embed widgets',
                    body: content,
                    keyboard_manager: Jupyter.notebook.keyboard_manager,
                    notebook: Jupyter.notebook,
                    buttons: {
                        'Copy to Clipboard': {
                            class: 'btn-primary',
                            click: function(event) {
                                content.select();
                                return document.execCommand('copy');
                            }
                        }
                    }
                });
            });
        });
    });
};

var action = {
    help: 'Embed interactive widgets',
    icon: 'fa-sliders',
    help_index : 'zz',
    handler : embed_widgets
};

var action_name = 'embed-interactive-widgets';
var prefix = 'widgets';
requirejs(["base/js/namespace"], function(Jupyter) {
    Jupyter.notebook.keyboard_manager.actions.register(action, action_name, prefix);
});

module.exports = {
    action: action
};
