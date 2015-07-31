/// <reference path="../notebook_test.d.ts" />
import base = require('../base');

// Globals
var combo_selector = '.widget-area .widget-subarea .widget-hbox .btn-group .widget-combo-btn';
var multibtn_selector = '.widget-area .widget-subarea .widget-hbox.widget-toggle-buttons .btn-group';
var radio_selector = '.widget-area .widget-subarea .widget-hbox .widget-radio-box';
var list_selector = '.widget-area .widget-subarea .widget-hbox .widget-listbox';
var selection_values = 'abcd';
var check_state = function(selection_index, context, index, state){
    if (0 <= index && index < selection_values.length) {
        var multibtn_state = context.notebook.cell_element_function(selection_index, multibtn_selector + ' .btn:nth-child(' + (index + 1) + ')', 'hasClass', ['active']);
        var radio_state = context.notebook.cell_element_function(selection_index, radio_selector + ' .radio:nth-child(' + (index + 1) + ') input', 'prop', ['checked']);
        var list_val = context.notebook.cell_element_function(selection_index, list_selector, 'val');
        var combo_val = context.notebook.cell_element_function(selection_index, combo_selector, 'html');
        
        var val = selection_values.charAt(index);
        var list_state = (val == list_val);
        var combo_state = (val == combo_val);

        return multibtn_state == state &&
            radio_state == state &&
            list_state == state &&
            combo_state == state;
    }
    return true;
};

var verify_selection = function(selection_index, context, index){
    for (var i = 0; i < selection_values.length; i++) {
        if (!check_state(selection_index, context, i, i==index)) {
            return false;
        }
    }
    return true;
};

// Test selection class
base.tester
.start_notebook_then()
.cell(`
    import ipywidgets as widgets
    from IPython.display import display, clear_output
    print("Success")
    `)

.cell(`
    options=["` + selection_values + `"[i] for i in range(4)]
    options.append('  spaces  ')
    selection = [widgets.Dropdown(options=options),
        widgets.ToggleButtons(options=options),
        widgets.RadioButtons(options=options),
        widgets.Select(options=options)]
    [display(selection[i]) for i in range(4)]
    for widget in selection:
        def handle_change(name,old,new):
            for other_widget in selection:
                other_widget.value = new
        widget.on_trait_change(handle_change, "value")
    print("Success")
    `,
    function(selection_index){
        this.test.assertEquals(this.notebook.get_output(selection_index).text, 'Success\n', 
            'Create selection cell executed with correct output.');


        // Wait for the widgets to actually display.
        this
        .wait_for_element(selection_index, combo_selector)
        .wait_for_element(selection_index, multibtn_selector)
        .wait_for_element(selection_index, radio_selector)
        .wait_for_element(selection_index, list_selector)

        // Continue with the tests.
        .then(function() {
            this.test.assert(this.notebook.cell_element_exists(selection_index, 
                '.widget-area .widget-subarea'),
                'Widget subarea exists.');

            this.test.assert(this.notebook.cell_element_exists(selection_index, combo_selector),
                 'Widget combobox exists.');

            this.test.assert(this.notebook.cell_element_exists(selection_index, multibtn_selector),
                'Widget multibutton exists.');

            this.test.assert(this.notebook.cell_element_exists(selection_index, radio_selector),
                'Widget radio buttons exists.');

            this.test.assert(this.notebook.cell_element_exists(selection_index, list_selector),
                'Widget list exists.');

            // Verify that no items are selected.
            this.test.assert(verify_selection(selection_index, this, 0), 'Default first item selected.');
        })

        .cell(`
            for widget in selection:
                widget.value = "a"
            print("Success")
            `,
            function(index){
                this.test.assertEquals(this.notebook.get_output(index).text, 'Success\n', 
                    'Python select item executed with correct output.');

                // Verify that the first item is selected.
                this.test.assert(verify_selection(selection_index, this, 0), 'Python selected');

                // Verify that selecting a radio button updates all of the others.
                this.notebook.cell_element_function(selection_index, radio_selector + ' .radio:nth-child(2) input', 'click');
            }
        )

        .wait_for_idle()
        .then(function () {
            this.test.assert(verify_selection(selection_index, this, 1), 'Radio button selection updated view states correctly.');

            // Verify that selecting a list option updates all of the others.
            this.notebook.cell_element_function(selection_index, list_selector + ' option:nth-child(3)', 'click');
        })
        .wait_for_idle()
        .then(function () {
            this.test.assert(verify_selection(selection_index, this, 2), 'List selection updated view states correctly.');

            // Verify that selecting the option with spaces works
            this.notebook.cell_element_function(selection_index, list_selector + ' option:nth-child(5)', 'click');
        })
        .wait_for_idle()
        .then(function () {
            this.test.assert(verify_selection(selection_index, this, 4), 'List selection of space element updated view states correctly.');

            // Verify that selecting a multibutton option updates all of the others.
            // Bootstrap3 has changed the toggle button group behavior.  Two clicks
            // are required to actually select an item.
            this.notebook.cell_element_function(selection_index, multibtn_selector + ' .btn:nth-child(4)', 'click');
            this.notebook.cell_element_function(selection_index, multibtn_selector + ' .btn:nth-child(4)', 'click');
        })
        .wait_for_idle()
        .then(function () {
            this.test.assert(verify_selection(selection_index, this, 3), 'Multibutton selection updated view states correctly.');

            // Verify that selecting a combobox option updates all of the others.
            this.notebook.cell_element_function(selection_index, '.widget-area .widget-subarea .widget-hbox .btn-group ul.dropdown-menu li:nth-child(3) a', 'click');
        })
        .wait_for_idle()
        .then(function () {
            this.test.assert(verify_selection(selection_index, this, 2), 'Combobox selection updated view states correctly.');
        })

        .wait_for_idle()

        .cell(`
            from copy import copy
            for widget in selection:
                d = copy(widget.options)
                d.append("z")
                widget.options = d
            selection[0].value = "z"
            `,
            function(index){
                // Verify that selecting a combobox option updates all of the others.
                this.test.assert(verify_selection(selection_index, this, 4), 'Item added to selection widget.');
            }
        );
    }
)

.stop_notebook_then();
