/// <reference path="../notebook_test.d.ts" />
import base = require('../base');

// Globals 
var cwd: string = '';
var test_jpg = '/9j/4AAQSkZJRgABAQEASABIAAD//gATQ3JlYXRlZCB3aXRoIEdJTVD/2wBDACAWGBwYFCAcGhwkIiAmMFA0MCwsMGJGSjpQdGZ6eHJmcG6AkLicgIiuim5woNqirr7EztDOfJri8uDI8LjKzsb/2wBDASIkJDAqMF40NF7GhHCExsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsb/wgARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABUBAQEAAAAAAAAAAAAAAAAAAAME/9oADAMBAAIQAxAAAAECv//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEABj8Cf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8hf//aAAwDAQACAAMAAAAQn//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Qf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Qf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8Qf//Z';
var img_selector = '.widget-area .widget-subarea img';

// Test image class
base.tester
.start_notebook_then()
.cell(`
    import ipywidgets as widgets
    from IPython.display import display, clear_output
    print("Success")
`)

// Get the temporary directory that the test server is running in.
.cell(`!echo $(pwd)`,
    function(index){
        cwd = this.notebook.get_output(index).text.trim();
    }
)

.cell(`
    import base64
    data = base64.b64decode("` + test_jpg + `")
    image = widgets.Image()
    image.format = "jpeg"
    image.value = data
    image.width = "50px"
    image.height = "50px"
    display(image) 
    print("Success")
    `,
    function(image_index){
        this.test.assertEquals(this.notebook.get_output(image_index).text, 'Success\n', 
            'Create image executed with correct output.');

        // Wait for the widget to actually display.
        this
        .wait_for_element(image_index, img_selector)

        .then(function(){
            this.test.assert(this.notebook.cell_element_exists(image_index, 
                '.widget-area .widget-subarea'),
                'Widget subarea exists.');

            this.test.assert(this.notebook.cell_element_exists(image_index, img_selector), 'Image exists.');

            // Verify that the image's base64 data has made it into the DOM.
            var img_src = this.notebook.cell_element_function(image_index, img_selector, 'attr', ['src']);
            this.test.assert(img_src.indexOf(test_jpg) > -1, 'Image src data exists.');
        });
    }
)

.stop_notebook_then();
