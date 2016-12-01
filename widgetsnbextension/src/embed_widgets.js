// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

"use strict";

var embed_widgets = function() {
    return new Promise(function(resolve) {
        requirejs(['base/js/namespace', 'base/js/dialog', 'jupyter-js-widgets'], function(Jupyter, dialog, widgets) {

            Jupyter.WidgetManager._managers[0].get_state({
                'drop_defaults': true
            }).then(function(state) {
                var data = JSON.stringify({
                    version_major: 1,
                    version_minor: 0,
                    state: state
                }, null, '    ');
                var value = '<script src="https://unpkg.com/jupyter-js-widgets@~' + widgets.version + '/dist/embed.js"></script>\n' +
                            '<script type="application/vnd.jupyter.widget-state+json">\n' + data + '\n</script>';

                var cells = Jupyter.notebook.get_cells();
                for (var i = 0; i<cells.length; ++i) {
                    var current_cell = cells[i];
                    if (current_cell.widgetarea && current_cell.widgetarea.widget_views) {
                        for (var j=0; j!=current_cell.widgetarea.widget_views.length; ++j) {
                            value += '\n<script type="application/vnd.jupyter.widget-view+json">\n' +
                            JSON.stringify({ model_id : current_cell.widgetarea.widget_views[j].model.id }, null, '    ') +
                            '\n</script>';
                        }
                    }
                }

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
