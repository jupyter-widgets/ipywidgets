// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

'use strict';

var VIEW_MIME_TYPE = 'application/vnd.jupyter.widget-view+json';

var htmlManagerVersion =
  require('@jupyter-widgets/html-manager/package.json').version;

var embed_widgets = function () {
  /**
   * Escape a string that will be the content of an HTML script tag.
   *
   * We replace the opening bracket of <script, </script, and <!-- with the
   * unicode equivalent. This is inspired by the documentation for the script
   * tag at
   * https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements
   *
   * We only replace these three cases so that most html or other content
   * involving `<` is readable.
   */
  function escapeScript(s) {
    return s.replace(/<(script|\/script|!--)/gi, '\\u003c$1');
  }

  return new Promise(function (resolve, reject) {
    requirejs(
      ['base/js/namespace', 'base/js/dialog', '@jupyter-widgets/controls'],
      function (Jupyter, dialog, widgets) {
        var wm = Jupyter.WidgetManager._managers[0];
        if (!wm) {
          reject('No widget manager');
        }
        wm.get_state({
          drop_defaults: true,
        }).then(function (state) {
          var data = escapeScript(JSON.stringify(state, null, '    '));
          var value = [
            '<html><head>',
            '',
            '',
            '<!-- Load require.js. Delete this if your page already loads require.js -->',
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.4/require.min.js" integrity="sha256-Ae2Vz/4ePdIu6ZyI/5ZGsYnb+m0JlOmKPjt6XZ9JJkA=" crossorigin="anonymous"></script>',
            '<script src="https://cdn.jsdelivr.net/npm/@jupyter-widgets/html-manager@*/dist/embed-amd.js" crossorigin="anonymous"></script>',
            '<script type="application/vnd.jupyter.widget-state+json">',
            data,
            '</script>',
            '</head>',
            '<body>',
            '',
          ].join('\n');
          var views = [];
          var cells = Jupyter.notebook.get_cells();
          Jupyter.notebook.get_cells().forEach(function (cell) {
            if (cell.output_area) {
              cell.output_area.outputs.forEach(function (output) {
                if (
                  output.data &&
                  output.data[VIEW_MIME_TYPE] &&
                  state.state[output.data[VIEW_MIME_TYPE].model_id]
                ) {
                  views.push(
                    '\n<script type="' +
                      VIEW_MIME_TYPE +
                      '">\n' +
                      escapeScript(
                        JSON.stringify(
                          output.data[VIEW_MIME_TYPE],
                          null,
                          '    '
                        )
                      ) +
                      '\n</script>'
                  );
                }
              });
            }
          });
          value += views.join('\n');
          value += '\n\n</body>\n</html>\n';
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
                click: function (event) {
                  content.select();
                  return document.execCommand('copy');
                },
              },
            },
          });
        });
      }
    );
  });
};

var action = {
  help: 'Embed interactive widgets',
  icon: 'fa-sliders',
  help_index: 'zz',
  handler: embed_widgets,
};

var action_name = 'embed-interactive-widgets';
var prefix = 'widgets';
requirejs(['base/js/namespace'], function (Jupyter) {
  Jupyter.notebook.keyboard_manager.actions.register(
    action,
    action_name,
    prefix
  );
});

module.exports = {
  action: action,
};
