/// <reference path="../notebook_test.d.ts" />
import base = require('../base');

// Globals
var widget_checkbox_selector = '.widget-area .widget-subarea .widget-hbox input';
var widget_togglebutton_selector = '.widget-area .widget-subarea button';
    
// Test widget bool class
base.tester
.start_notebook_then()

// Create a checkbox and togglebutton.
.cell(`
    import ipywidgets as widgets
    from IPython.display import display, clear_output
    bool_widgets = [widgets.Checkbox(description="Title", value=True),
        widgets.ToggleButton(description="Title", value=True)]
    display(bool_widgets[0])
    display(bool_widgets[1])
    print("Success")
    `,
    function(bool_index){
        this.test.assertEquals(this.notebook.get_output(bool_index).text, 'Success\n', 
            'Create bool widget cell executed with correct output.');

        // Wait for the widgets to actually display.
        this
        .wait_for_element(bool_index, widget_checkbox_selector)
        .wait_for_element(bool_index, widget_togglebutton_selector)

        // Continue the tests.
        .then(function() {
            this.test.assert(this.notebook.cell_element_exists(bool_index, 
                '.widget-area .widget-subarea'),
                'Widget subarea exists.');

            this.test.assert(this.notebook.cell_element_exists(bool_index, 
                widget_checkbox_selector),
                'Checkbox exists.');

            this.test.assert(this.notebook.cell_element_function(bool_index, 
                widget_checkbox_selector, 'prop', ['checked']),
                'Checkbox is checked.');

            this.test.assert(this.notebook.cell_element_exists(bool_index, 
                '.widget-area .widget-subarea .widget-hbox .widget-label'),
                'Checkbox label exists.');

            this.test.assert(this.notebook.cell_element_function(bool_index, 
                '.widget-area .widget-subarea .widget-hbox .widget-label', 'html')=="Title",
                'Checkbox labeled correctly.');

            this.test.assert(this.notebook.cell_element_exists(bool_index, 
                widget_togglebutton_selector),
                'Toggle button exists.');

            this.test.assert(this.notebook.cell_element_function(bool_index, 
                widget_togglebutton_selector, 'html')=='<i class="fa"></i>Title',
                'Toggle button labeled correctly.');

            this.test.assert(this.notebook.cell_element_function(bool_index, 
                widget_togglebutton_selector, 'hasClass', ['active']),
                'Toggle button is toggled.');
        })

        // Try changing the state of the widgets programatically.
        .cell(`
            bool_widgets[0].value = False
            bool_widgets[1].value = False
            print("Success")
            `,
            function(index){
                this.test.assertEquals(this.notebook.get_output(index).text, 'Success\n', 
                    'Change bool widget value cell executed with correct output.');

                this.test.assert(! this.notebook.cell_element_function(bool_index, 
                    widget_checkbox_selector, 'prop', ['checked']),
                    'Checkbox is not checked. (1)');

                this.test.assert(! this.notebook.cell_element_function(bool_index, 
                    widget_togglebutton_selector, 'hasClass', ['active']),
                    'Toggle button is not toggled. (1)');
         
                // Try toggling the bool by clicking on the checkbox.
                this.notebook.cell_element_function(bool_index, widget_checkbox_selector, 'click');

                this.test.assert(this.notebook.cell_element_function(bool_index, 
                    widget_checkbox_selector, 'prop', ['checked']),
                    'Checkbox is checked. (2)');

                // Try toggling the bool by clicking on the toggle button.
                this.notebook.cell_element_function(bool_index, widget_togglebutton_selector, 'click');

                this.test.assert(this.notebook.cell_element_function(bool_index, 
                    widget_togglebutton_selector, 'hasClass', ['active']),
                    'Toggle button is toggled. (3)');
            }
        );
    }
)

.stop_notebook_then();
