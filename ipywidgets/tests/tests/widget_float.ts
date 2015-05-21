/// <reference path="../notebook_test.d.ts" />
import base = require('../base');

// Globals
var float_text_query = '.widget-area .widget-subarea .widget-numeric-text';
 
// Test widget float class
base.tester
.start_notebook_then()
    
.cell(`
    import ipywidgets as widgets
    from IPython.display import display, clear_output
    float_widget = widgets.FloatText()
    display(float_widget)
    float_widget._dom_classes = ["my-second-float-text"]
    print(float_widget.model_id)
    `,
    function(index){
        var float_text: any = {};
        float_text.query = '.widget-area .widget-subarea .my-second-float-text input';
        float_text.index = index;
        float_text.model_id = this.notebook.get_output(index).text.trim();

        // Wait for the widget to actually display.
        this
        .wait_for_element(float_text.index, float_text.query)

        // Continue with the tests
        .then(function(){        
            this.test.assert(this.notebook.cell_element_exists(float_text.index, 
                '.widget-area .widget-subarea'),
                'Widget subarea exists.');

            this.test.assert(this.notebook.cell_element_exists(float_text.index, float_text.query),
                'Widget float textbox exists.');

            this.notebook.cell_element_function(float_text.index, float_text.query, 'val', ['']);
            this.sendKeys(float_text.query, '1.05');
        })

        .wait_for_widget(float_text.model_id)

        .cell(`print(float_widget.value)`, 
            function(index){
                this.test.assertEquals(this.notebook.get_output(index).text, '1.05\n', 
                    'Float textbox value set.');
                this.notebook.cell_element_function(float_text.index, float_text.query, 'val', ['']);
                this.sendKeys(float_text.query, '123456789.0');
            }
        )

        .wait_for_widget(float_text.model_id)
            
        .cell(`print(float_widget.value)`,
            function(index){
                this.test.assertEquals(this.notebook.get_output(index).text, '123456789.0\n', 
                    'Long float textbox value set (probably triggers throttling).');
                this.notebook.cell_element_function(float_text.index, float_text.query, 'val', ['']);
                this.sendKeys(float_text.query, '12hello');
            }
        )

        .wait_for_widget(float_text.model_id);
    }
)

.assert_output_equals(
    `print(float_widget.value)`,
    '12.0',
    'Invald float textbox value caught and filtered.')

.cell(`
    floatrange = [widgets.BoundedFloatText(),
        widgets.FloatSlider()]
    [display(floatrange[i]) for i in range(2)] 
    print("Success")
    `,
    function(index){
        var slider: any = {};
        slider.query = '.widget-area .widget-subarea .slider';
        slider.index = index
        this.test.assertEquals(this.notebook.get_output(index).text, 'Success\n', 
            'Create float range cell executed with correct output.');

        // Wait for the widgets to actually display.
        this
        .wait_for_element(slider.index, slider.query)
        .wait_for_element(slider.index, float_text_query)

        .then(function(){
            this.test.assert(this.notebook.cell_element_exists(slider.index, 
                '.widget-area .widget-subarea'),
                'Widget subarea exists.');

            this.test.assert(this.notebook.cell_element_exists(slider.index, slider.query),
                'Widget slider exists.');

            this.test.assert(this.notebook.cell_element_exists(slider.index, float_text_query),
                'Widget float textbox exists.');
        })

        .cell(`
            for widget in floatrange:
                widget.max = 50.0
                widget.min = -50.0
                widget.value = 25.0
            print("Success")
            `,
            function(index){
                this.test.assertEquals(this.notebook.get_output(index).text, 'Success\n', 
                    'Float range properties cell executed with correct output.');

                this.test.assert(this.notebook.cell_element_exists(slider.index, slider.query), 
                    'Widget slider exists.');

                this.test.assert(this.notebook.cell_element_function(slider.index, slider.query, 
                    'slider', ['value']) == 25.0,
                    'Slider set to Python value.');
            }
        )
    }
)
.stop_notebook_then();
