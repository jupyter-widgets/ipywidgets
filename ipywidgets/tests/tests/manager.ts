/// <reference path="../notebook_test.d.ts" />
import base = require('../base');
base.tester

// Test the widget manager.
.start_notebook_then()
.cell(`from ipywidgets import Widget`)
.then(function() {

    // Check if the WidgetManager class is defined.
    this.test.assert(this.evaluate(function() {
        return IPython.WidgetManager !== undefined; 
    }), 'WidgetManager class is defined');

    // Check if the widget manager has been instantiated.
    this.test.assert(this.evaluate(function() {
        return IPython.notebook.kernel.widget_manager !== undefined; 
    }), 'Notebook widget manager instantiated');

    // Try creating a widget from Javascript.
    this.evaluate(function() {
        IPython.notebook.kernel.widget_manager.new_widget({
            model_name: 'WidgetModel', 
            widget_class: 'ipywidgets.IntSlider'})
            .then(function(model) { 
                console.log('Create success!', model); 
                (<any>window).slider_id = model.id; 
            }, function(error) { console.log(error); });
    });
})
.waitFor(function() { // Wait for the state to be recieved.
    return this.evaluate(function() {
        return (<any>window).slider_id !== undefined;
    });
})
.cell(`
    widget = list(Widget.widgets.values())[0]
    print(widget.model_id)
    `, 
    function(index) {
        var output = this.notebook.get_output(index).text.trim();
        var slider_id = this.evaluate(function() { return (<any>window).slider_id; });
        this.test.assertEquals(output, slider_id, "Widget created from the front-end.");
    }
)

// Widget persistence tests
.cell(`
    from ipywidgets import HTML
    from IPython.display import display
    display(HTML(value="<div id='hello'></div>"))
    `)
.cell(`
    display(HTML(value="<div id='world'></div>"))
    `)

// Wait for the widgets to be shown.
.waitForSelector('#hello')
.waitForSelector('#world')
.then(function() {
    this.test.assertExists('#hello', 'Hello HTML widget constructed.');
    this.test.assertExists('#world', 'World HTML widget constructed.');

    // Save the notebook.
    this.evaluate(function() {
        IPython.notebook.save_notebook(false).then(() => {
            (<any>window).was_saved = true;
        });
    });
})

// Wait for a notebook save.
.waitFor(function() {
    return this.evaluate(() => {
        return (<any>window).was_saved;
    });
}, function() {

    this
        // Reload the page
        .reload()

        // Wait for the elements to show up again.
        .waitForSelector('#hello')
        .waitForSelector('#world', () => {
            this.test.assertExists('#hello', 'Hello HTML widget persisted.');
            this.test.assertExists('#world', 'World HTML widget persisted.');
        });
})
.stop_notebook_then();
