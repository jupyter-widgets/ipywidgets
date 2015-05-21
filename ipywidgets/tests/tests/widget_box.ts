/// <reference path="../notebook_test.d.ts" />
import base = require('../base');

// Globals
var widget_box_selector: string = '.widget-area .widget-subarea .widget-box';
var widget_box_button_selector: string = '.widget-area .widget-subarea .widget-box button';
var widget_button_selector = '.widget-area .widget-subarea button';

// Test container class
base.tester
.start_notebook_then()

// Create a box widget.
.cell(`
    import ipywidgets as widgets 
    from IPython.display import display, clear_output
    container = widgets.Box()
    button = widgets.Button()
    container.children = [button]
    display(container)
    container._dom_classes = ["my-test-class"]
    print("Success")
    `, 
    function(container_index){
        this.test.assertEquals(this.notebook.get_output(container_index).text, 'Success\n', 
            'Create container cell executed with correct output.');

        // Wait for the widgets to actually display.
        this
        .wait_for_element(container_index, widget_box_selector)
        .wait_for_element(container_index, widget_box_button_selector)

        // Continue with the tests.
        .then(function() {
            this.test.assert(this.notebook.cell_element_exists(container_index, 
                '.widget-area .widget-subarea'),
                'Widget subarea exists.');

            this.test.assert(this.notebook.cell_element_exists(container_index, 
                widget_box_selector),
                'Widget container exists.');

            this.test.assert(this.notebook.cell_element_exists(container_index, 
                '.widget-area .widget-subarea .my-test-class'),
                '_dom_classes works.');

            this.test.assert(this.notebook.cell_element_exists(container_index, 
                widget_box_button_selector),
                'Container parent/child relationship works.');
        })

        .cell(`
            container.box_style = "success"
            print("Success")
            `,
            function(index){
                this.test.assertEquals(this.notebook.get_output(index).text, 'Success\n', 
                    'Set box_style cell executed with correct output.');

                this.test.assert(this.notebook.cell_element_exists(container_index, 
                    '.widget-box.alert-success'),
                    'Set box_style works.');
            }
        )

        .cell(`
            container._dom_classes = []
            print("Success")
            `,
            function(index){
                this.test.assertEquals(this.notebook.get_output(index).text, 'Success\n', 
                    'Remove container class cell executed with correct output.');

                this.test.assert(! this.notebook.cell_element_exists(container_index, 
                    '.widget-area .widget-subarea .my-test-class'),
                    '_dom_classes can be used to remove a class.');
            }
        );
    }
)

.cell(`
    display(button)
    print("Success")
    `,
    function(boxalone_index){
        this.test.assertEquals(this.notebook.get_output(boxalone_index).text, 'Success\n', 
            'Display container child executed with correct output.');

        // Wait for the widget to actually display.
        this
        .wait_for_element(boxalone_index, widget_button_selector)

        // Continue with the tests.
        .then(function() {
            this.test.assert(! this.notebook.cell_element_exists(boxalone_index, 
                widget_box_selector),
                'Parent container not displayed.');

            this.test.assert(this.notebook.cell_element_exists(boxalone_index, 
                widget_button_selector),
                'Child displayed.');
        });
    }
)

.stop_notebook_then();