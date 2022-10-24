// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

'use strict';

var save_state = function () {
  return new Promise(function (resolve, reject) {
    requirejs(['base/js/namespace'], function (Jupyter) {
      var wm = Jupyter.WidgetManager._managers[0];
      if (!wm) {
        reject('No widget manager');
      }
      return wm
        .get_state({
          drop_defaults: true,
        })
        .then(function (state) {
          var data =
            'text/json;charset=utf-8,' +
            encodeURIComponent(JSON.stringify(state, null, '    '));
          var a = document.createElement('a');
          a.download = 'widget_state.json';
          a.href = 'data:' + data;
          a.click();
          resolve();
        });
    });
  });
};

var action = {
  help: 'Download the widget state as a JSON file',
  icon: 'fa-sliders',
  help_index: 'zz',
  handler: save_state,
};

var action_name = 'save-widget-state';
var prefix = 'widgets';
requirejs(['base/js/namespace'], function (Jupyter) {
  Jupyter.notebook.keyboard_manager.actions.register(
    action,
    action_name,
    prefix
  );
});

module.exports = { action: action };
