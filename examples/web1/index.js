// Create a widget manager instance.
var WidgetManager = require('./manager').WidgetManager;

require('@jupyter-widgets/controls/css/widgets.built.css');

document.addEventListener("DOMContentLoaded", function(event) {
    var manager = new WidgetManager(document.body);

    /**
     * Helper function for creating and displaying widgets.
     * @return {Promise<WidgetView>}
     */
    function createWidget(widgetType, value, description) {

        // Create the widget model.
        return manager.new_model({
            model_module: '@jupyter-widgets/controls',
            model_name: widgetType + 'Model',
            model_id: 'widget-1'
        // Create a view for the model.
        }).then(function(model) {
            console.log(widgetType + ' model created');

            model.set({
                description: description || '',
                value: value,
            });

            return  manager.create_view(model);
        }, console.error.bind(console))
        .then(function(view) {
            console.log(widgetType + ' view created');
            manager.display_view(null, view);
            return view;
        }, console.error.bind(console));
    }

    var defaultHTML = 'test <b>text</b>';
    var textArea = createWidget('Textarea', defaultHTML, 'HTML:');
    var html = createWidget('HTML', defaultHTML);

    // Create a link model.
    manager.new_model({
        model_module: '@jupyter-widgets/controls',
        model_name: 'LinkModel',
        model_id: 'widget-2',
        state: {
            'source': null,
            'target': null
        }
    // Set the link model state.
    }).then(function(link) {
        console.log('link created');

        return Promise.all([textArea, html]).then(
            function(models) {
                console.log('setting link');
                var textArea = models[0];
                var html = models[1];
                link.set({
                    'source': [textArea.model, 'value'],
                    'target': [html.model, 'value']
                });
                link.save_changes();
                console.log('link set');
            }
        );
    }).then(function() {
        var event = new Event('widgetsRendered');
        document.dispatchEvent(event);
    });
});
