/// <reference path="../typings/notebook_test.d.ts" />
import base = require('../base');

// Globals 
var slider_query = '.widget-area .widget-subarea .slider';

// Test widget int class
base.tester
.start_notebook_then()
.cell(`
    import ipywidgets as widgets
    from IPython.display import display, clear_output
    int_widget = widgets.IntText()
    display(int_widget) 
    int_widget._dom_classes = ["my-second-int-text"] 
    print(int_widget.model_id)
    `,
    function(index){
        var int_text: any = {};
        int_text.query = '.widget-area .widget-subarea .my-second-int-text input';
        int_text.index = index;
        int_text.model_id = this.get_output_cell(index).text.trim();

        // Wait for the widget to actually display.
        this
        .wait_for_element(int_text.index, int_text.query)

        // Continue with the tests.
        .then(function() {
            this.test.assert(this.cell_element_exists(int_text.index, 
                '.widget-area .widget-subarea'),
                'Widget subarea exists.');

            this.test.assert(this.cell_element_exists(int_text.index, int_text.query),
                'Widget int textbox exists.');

            this.cell_element_function(int_text.index, int_text.query, 'val', ['']);
            this.sendKeys(int_text.query, '1.05');
        })

        .wait_for_widget(int_text)

        .cell(`print(int_widget.value)`, function(index){
            this.test.assertEquals(this.get_output_cell(index).text, '1\n', 
                'Int textbox value set.');
            this.cell_element_function(int_text.index, int_text.query, 'val', ['']);
            this.sendKeys(int_text.query, '123456789');
        })

        .wait_for_widget(int_text)

        .cell(`print(int_widget.value)`, function(index) {
            this.test.assertEquals(this.get_output_cell(index).text, '123456789\n', 
                'Long int textbox value set (probably triggers throttling).');
            this.cell_element_function(int_text.index, int_text.query, 'val', ['']);
            this.sendKeys(int_text.query, '12hello');
        })

        .wait_for_widget(int_text);
    }
)


.assert_output_equals(
    `print(int_widget.value)`,
    '12', 
    'Invald int textbox value caught and filtered.')

.cell(`
    intrange = [widgets.BoundedIntTextWidget(),
        widgets.IntSliderWidget()]
    [display(intrange[i]) for i in range(2)]
    intrange[0]._dom_classes = ["my-second-num-test-text"]  
    print(intrange[0].model_id)
    `,
    function(index){
        var int_text2: any = {};
        int_text2.query = '.widget-area .widget-subarea .my-second-num-test-text input';
        int_text2.index = index;
        int_text2.model_id = this.get_output_cell(index).text.trim();


        // Wait for the widgets to actually display.
        this
        .wait_for_element(int_text2.index, int_text2.query)
        .wait_for_element(int_text2.index, slider_query)

        // Continue with the tests.
        .then(function(){
            this.test.assert(this.cell_element_exists(int_text2.index, 
                '.widget-area .widget-subarea'),
                'Widget subarea exists.');

            this.test.assert(this.cell_element_exists(int_text2.index, slider_query),
                'Widget slider exists.');

            this.test.assert(this.cell_element_exists(int_text2.index, int_text2.query),
                'Widget int textbox exists.');
        })

        .cell(`
            for widget in intrange:
                widget.max = 50
                widget.min = -50
                widget.value = 25
            print("Success")
            `,
            function(index) {

                this.test.assertEquals(this.get_output_cell(index).text, 'Success\n', 
                    'Int range properties cell executed with correct output.');

                this.test.assert(this.cell_element_exists(int_text2.index, slider_query), 
                    'Widget slider exists.');

                this.test.assert(this.cell_element_function(int_text2.index, slider_query, 
                    'slider', ['value']) == 25,
                    'Slider set to Python value.');

                this.test.assert(this.cell_element_function(int_text2.index, int_text2.query,
                    'val') == 25, 'Int textbox set to Python value.');

                // Clear the int textbox value and then set it to 1 by emulating
                // keyboard presses.
                this.evaluate(function(q){
                    var textbox = IPython.notebook.element.find(q);
                    textbox.val('1');
                    textbox.trigger('keyup');
                }, {q: int_text2.query});
            }
        )

        .wait_for_widget(int_text2)

        .cell(`print(intrange[0].value)`, function(index){
            this.test.assertEquals(this.get_output_cell(index).text, '1\n', 
                'Int textbox set int range value');

            // Clear the int textbox value and then set it to 120 by emulating
            // keyboard presses.
            this.evaluate(function(q){
                var textbox = IPython.notebook.element.find(q);
                textbox.val('120');
                textbox.trigger('keyup');
            }, {q: int_text2.query});
        })

        .wait_for_widget(int_text2)

        .cell(`print(intrange[0].value)`, function(index){
            this.test.assertEquals(this.get_output_cell(index).text, '50\n', 
                'Int textbox value bound');

            // Clear the int textbox value and then set it to 'hello world' by 
            // emulating keyboard presses.  'hello world' should get filtered...
            this.evaluate(function(q){
                var textbox = IPython.notebook.element.find(q);
                textbox.val('hello world');
                textbox.trigger('keyup');
            }, {q: int_text2.query});
        })

        .wait_for_widget(int_text2);
    }
)

.assert_output_equals(
    `print(intrange[0].value)`,
    '50', 
    'Invalid int textbox characters ignored')

.cell(`
    a = widgets.IntSlider()
    display(a)
    a.max = -1
    print("Success")
    `,
    function(index){
        this.test.assertEquals(0, 0, 'Invalid int range max bound does not cause crash.');
    }
) 

.cell(`
    a = widgets.IntSlider()
    display(a)
    a.min = 101
    print("Success")
    `,
    function(index){
        this.test.assertEquals(0, 0, 'Invalid int range min bound does not cause crash.');
    }
) 

.stop_notebook_then();
