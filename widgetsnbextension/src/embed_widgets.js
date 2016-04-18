// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

"use strict";

var embed_widgets = function() {
    return new Promise(function(resolve) {
        requirejs(['base/js/namespace', 'base/js/dialog', 'jupyter-js-widgets'], function(Jupyter, dialog, widgets) {

            Jupyter.WidgetManager._managers[0].get_state({
                'drop_defaults': true
            }).then(function(state) {
                var data = JSON.stringify(state, null, '    ');
                var value = '<script src="https://npmcdn.com/jupyter-js-widgets@~' + widgets.version + '/dist/embed.js"></script><script type="application/vnd.jupyter-embedded-widgets">' + data + '</script>';
                var content = $('<textarea/>')
                    .attr('readonly', true)
                    .css({'width': '100%', 'min-height': '250px'})
                    .val(value);
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
                    },
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
