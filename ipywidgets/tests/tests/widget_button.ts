/// <reference path="../notebook_test.d.ts" />
import base = require('../base');

// Globals
var widget_button_selector = '.widget-area .widget-subarea button';

// Test widget button class
base.tester
.start_notebook_then()
.cell(`
    import ipywidgets as widgets
    from IPython.display import display, clear_output
    button = widgets.Button(description="Title")
    display(button)
    print("Success")
    def handle_click(sender):
        display("Clicked")
    button.on_click(handle_click)
    `,
    function(button_index){
        this.test.assertEquals(this.get_output_cell(button_index).text, 'Success\n',
            'Create button cell executed with correct output.');

        // Wait for the widgets to actually display.
        this
        .wait_for_element(button_index, widget_button_selector)

        // Continue with the tests.
        .then(function() {
            this.test.assert(this.cell_element_exists(button_index, 
                '.widget-area .widget-subarea'),
                'Widget subarea exists.');

            this.test.assert(this.cell_element_exists(button_index, 
                widget_button_selector),
                'Widget button exists.');

            this.test.assert(this.cell_element_function(button_index, 
                widget_button_selector, 'html')=='<i class="fa"></i>Title',
                'Set button description.');

            this.cell_element_function(button_index, 
                widget_button_selector, 'click');
        })

        .wait_for_output(button_index, 1)

        .then(function () {
            var warning_text = this.get_output_cell(button_index, 1).text;
            this.test.assertNotEquals(warning_text.indexOf('Warning'), -1,
                'Importing widgets show a warning');
            this.test.assertEquals(this.get_output_cell(button_index, 2).data['text/plain'], "'Clicked'",
                'Button click event fires.');
        });
    }
)

.stop_notebook_then();
