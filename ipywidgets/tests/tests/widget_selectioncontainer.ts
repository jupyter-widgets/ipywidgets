/// <reference path="../notebook_test.d.ts" />
import base = require('../base');

// Globals
var multicontainer1_query = '.widget-area .widget-subarea div div.nav-tabs';
var multicontainer2_query = '.widget-area .widget-subarea .panel-group';

// Test multicontainer class
base.tester
.start_notebook_then()
.cell(`
    import ipywidgets as widgets
    from IPython.display import display, clear_output
    print("Success")
    `)

// Test tab view
.cell(`
    multicontainer = widgets.Tab()
    page1 = widgets.Text()
    page2 = widgets.Text()
    page3 = widgets.Text()
    multicontainer.children = [page1, page2, page3]
    display(multicontainer)
    multicontainer.selected_index = 0
    print("Success")
    `,
    function(multicontainer1_index){
        this.test.assertEquals(this.notebook.get_output(multicontainer1_index).text, 'Success\n', 
            'Create multicontainer cell executed with correct output. (1)');


        // Wait for the widget to actually display.
        this
        .wait_for_element(multicontainer1_index, multicontainer1_query)

        // Continue with the tests.
        .then(function() {
            this.test.assert(this.notebook.cell_element_exists(multicontainer1_index, 
                '.widget-area .widget-subarea'),
                'Widget subarea exists.');

            this.test.assert(this.notebook.cell_element_exists(multicontainer1_index, multicontainer1_query),
                'Widget tab list exists.');

            // JQuery selector is 1 based
            this.click(multicontainer1_query + ' li:nth-child(2) a');
        })

        .wait_for_idle()

        .cell(`
            print(multicontainer.selected_index)
            multicontainer.selected_index = 2 # 0 based
            `,
            function(index){
                this.test.assertEquals(this.notebook.get_output(index).text, '1\n', // 0 based
                    'selected_index property updated with tab change.');

                // JQuery selector is 1 based
                this.test.assert(!this.notebook.cell_element_function(multicontainer1_index, multicontainer1_query + ' li:nth-child(1)', 'hasClass', ['active']),
                        "Tab 1 is not selected.");
                this.test.assert(!this.notebook.cell_element_function(multicontainer1_index, multicontainer1_query + ' li:nth-child(2)', 'hasClass', ['active']),
                        "Tab 2 is not selected.");
                this.test.assert(this.notebook.cell_element_function(multicontainer1_index, multicontainer1_query + ' li:nth-child(3)', 'hasClass', ['active']),
                        "Tab 3 is selected.");
            }
        )

        .cell(`
            multicontainer.set_title(1, "hello")
            print("Success") # 0 based
            `,
            function(index){
                this.test.assert(this.notebook.cell_element_function(multicontainer1_index, multicontainer1_query +
                    ' li:nth-child(2) a', 'html') == 'hello',
                    'Tab page title set (after display).');
            }
        );
    }
)


// Test accordion view
.cell(`
    multicontainer = widgets.Accordion()
    page1 = widgets.Text()
    page2 = widgets.Text()
    page3 = widgets.Text()
    multicontainer.children = [page1, page2, page3]
    multicontainer.set_title(2, "good")
    display(multicontainer)
    multicontainer.selected_index = 0
    print("Success")
    `,
    function(multicontainer2_index){
        this.test.assertEquals(this.notebook.get_output(multicontainer2_index).text, 'Success\n', 
            'Create multicontainer cell executed with correct output. (2)');

        // Wait for the widget to actually display.
        this
        .wait_for_element(multicontainer2_index, multicontainer2_query)

        // Continue with the tests.
        .then(function() {
            this.test.assert(this.notebook.cell_element_exists(multicontainer2_index, 
                '.widget-area .widget-subarea'),
                'Widget subarea exists.');

            this.test.assert(this.notebook.cell_element_exists(multicontainer2_index, multicontainer2_query),
                'Widget accordion exists.');

            this.test.assert(this.notebook.cell_element_exists(multicontainer2_index, multicontainer2_query + 
                ' .panel:nth-child(1) .panel-collapse'),
                'First accordion page exists.');

            // JQuery selector is 1 based
            this.test.assert(this.notebook.cell_element_function(multicontainer2_index, multicontainer2_query + 
                ' .panel.panel-default:nth-child(3) .panel-heading .accordion-toggle', 
                'html')=='good', 'Accordion page title set (before display).');

            // JQuery selector is 1 based
            this.click(multicontainer2_query + ' .panel:nth-child(2) .panel-heading .accordion-toggle');
        })

        .wait_for_idle()

        .cell(`
            print(multicontainer.selected_index) # 0 based
            `,
            function(index){
                this.test.assertEquals(this.notebook.get_output(index).text, '1\n', // 0 based
                    'selected_index property updated with tab change.');

                var $: any;
                var is_collapsed = this.evaluate(function(s){
                     return $(s + ' div.panel:nth-child(2) a').hasClass('collapsed'); // 1 based
                }, {s: multicontainer2_query});
                this.test.assertEquals(is_collapsed, false, 'Was tab actually opened?');
            }
        );
    }
)
.stop_notebook_then();
