# Model State

This is a description of the model state for each widget in the core Jupyter widgets library. The model ID of a widget is the id of the comm object the widget is using. A reference to a widget is serialized to JSON as a string of the form `"IPY_MODEL_<MODEL_ID>"`, where `<MODEL_ID>` is the model ID of a previously created widget of the specified type.

This model specification is for ipywidgets 6.0 and jupyter-js-widgets 2.1.0.

## Model attributes

Each widget in the Jupyter core widgets is represented below. The heading represents the string the widget is registered with in the kernel.

### Jupyter.Accordion

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'AccordionModel'` | 
`_titles`        | object           | `{}`             | Titles of the pages
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'AccordionView'` | 
`box_style`      | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the box.
`children`       | array            | `[]`             | 
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`selected_index` | number (integer) | `0`              | 

### Jupyter.BoundedFloatText

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'FloatTextModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'FloatTextView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`max`            | number (float)   | `100.0`          | Max value
`min`            | number (float)   | `0.0`            | Min value
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`step`           | number (float)   | `0.1`            | Minimum step to increment the value (ignored by some views)
`value`          | number (float)   | `0.0`            | Float value

### Jupyter.BoundedIntText

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'IntTextModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'IntTextView'`  | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`max`            | number (integer) | `100`            | Max value
`min`            | number (integer) | `0`              | Min value
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`step`           | number (integer) | `1`              | Minimum step to increment the value (ignored by some views)
`value`          | number (integer) | `0`              | Int value

### Jupyter.Box

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'BoxModel'`     | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'BoxView'`      | 
`box_style`      | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the box.
`children`       | array            | `[]`             | 
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.

### Jupyter.Button

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'ButtonModel'`  | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'ButtonView'`   | 
`button_style`   | string (one of `'primary'`, `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the button.
`description`    | string           | `''`             | Button label.
`disabled`       | boolean          | `false`          | Enable or disable user changes.
`icon`           | string           | `''`             | Font-awesome icon name, without the 'fa-' prefix.
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`style`          | reference to ButtonStyle widget | reference to new instance | 
`tooltip`        | string           | `''`             | Tooltip caption of the button.

### Jupyter.ButtonStyle

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'ButtonStyleModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'StyleView'`    | 
`button_color`   | `null` or string | `null`           | Color of the button
`font_weight`    | string           | `''`             | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.

### Jupyter.Checkbox

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'CheckboxModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'CheckboxView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes.
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`value`          | boolean          | `false`          | Bool value

### Jupyter.ColorPicker

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'ColorPickerModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'ColorPickerView'` | 
`concise`        | boolean          | `false`          | 
`description`    | string           | `''`             | Description of the control.
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`value`          | string           | `'black'`        | 

### Jupyter.Controller

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'ControllerModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'ControllerView'` | 
`axes`           | array            | `[]`             | 
`buttons`        | array            | `[]`             | 
`connected`      | boolean          | `false`          | 
`index`          | number (integer) | `0`              | 
`layout`         | reference to Layout widget | reference to new instance | 
`mapping`        | string           | `''`             | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`name`           | string           | `''`             | 
`timestamp`      | number (float)   | `0.0`            | 

### Jupyter.ControllerAxis

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'ControllerAxisModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'ControllerAxisView'` | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`value`          | number (float)   | `0.0`            | 

### Jupyter.ControllerButton

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'ControllerButtonModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'ControllerButtonView'` | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`pressed`        | boolean          | `false`          | 
`value`          | number (float)   | `0.0`            | 

### Jupyter.DatePicker

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'DatePickerModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'DatePickerView'` | 
`description`    | string           | `''`             | Description of the control.
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`value`          | `null` or Datetime | `null`           | 

### Jupyter.Dropdown

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'DropdownModel'` | 
`_options_labels` | array            | `[]`             | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'DropdownView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`value`          | string (valid option label) | `null`           | Selected value

### Jupyter.FloatProgress

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'ProgressModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'ProgressView'` | 
`bar_style`      | `null` or string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the progess bar.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`max`            | number (float)   | `100.0`          | Max value
`min`            | number (float)   | `0.0`            | Min value
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`orientation`    | string (one of `'horizontal'`, `'vertical'`) | `'horizontal'`   | Vertical or horizontal.
`step`           | number (float)   | `0.1`            | Minimum step to increment the value (ignored by some views)
`style`          | reference to ProgressStyle widget | reference to new instance | 
`value`          | number (float)   | `0.0`            | Float value

### Jupyter.FloatRangeSlider

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'FloatSliderModel'` | 
`_range`         | boolean          | `true`           | Display a range selector
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'FloatSliderView'` | 
`continuous_update` | boolean          | `true`           | Update the value of the widget as the user is sliding the slider.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`max`            | number (float)   | `100.0`          | Max value
`min`            | number (float)   | `0.0`            | Min value
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`orientation`    | string (one of `'horizontal'`, `'vertical'`) | `'horizontal'`   | Vertical or horizontal.
`readout`        | boolean          | `true`           | Display the current value of the slider next to it.
`slider_color`   | `null` or string | `null`           | 
`step`           | number (float)   | `1.0`            | Minimum step that the value can take (ignored by some views)
`value`          | array            | `[0.0, 1.0]`     | Tuple of (lower, upper) bounds

### Jupyter.FloatSlider

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'FloatSliderModel'` | 
`_range`         | boolean          | `false`          | Display a range selector
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'FloatSliderView'` | 
`continuous_update` | boolean          | `true`           | Update the value of the widget as the user is holding the slider.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`max`            | number (float)   | `100.0`          | Max value
`min`            | number (float)   | `0.0`            | Min value
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`orientation`    | string (one of `'horizontal'`, `'vertical'`) | `'horizontal'`   | Vertical or horizontal.
`readout`        | boolean          | `true`           | Display the current value of the slider next to it.
`readout_format` | string           | `'.2f'`          | Format for the readout
`slider_color`   | `null` or string | `null`           | 
`step`           | number (float)   | `0.1`            | Minimum step to increment the value (ignored by some views)
`value`          | number (float)   | `0.0`            | Float value

### Jupyter.FloatText

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'FloatTextModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'FloatTextView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`value`          | number (float)   | `0.0`            | Float value

### Jupyter.HBox

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'HBoxModel'`    | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'HBoxView'`     | 
`box_style`      | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the box.
`children`       | array            | `[]`             | 
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.

### Jupyter.HTML

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'HTMLModel'`    | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'HTMLView'`     | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`placeholder`    | string           | `'\u200b'`       | Placeholder text to display when nothing has been typed
`value`          | string           | `''`             | String value

### Jupyter.HTMLMath

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'HTMLMathModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'HTMLMathView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`placeholder`    | string           | `'\u200b'`       | Placeholder text to display when nothing has been typed
`value`          | string           | `''`             | String value

### Jupyter.Image

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_b64value`      | string           | `''`             | 
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'ImageModel'`   | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'ImageView'`    | 
`format`         | string           | `'png'`          | 
`height`         | string           | `''`             | 
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`width`          | string           | `''`             | 

### Jupyter.IntProgress

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'ProgressModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'ProgressView'` | 
`bar_style`      | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the progess bar.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`max`            | number (integer) | `100`            | Max value
`min`            | number (integer) | `0`              | Min value
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`orientation`    | string (one of `'horizontal'`, `'vertical'`) | `'horizontal'`   | Vertical or horizontal.
`step`           | number (integer) | `1`              | Minimum step to increment the value (ignored by some views)
`style`          | reference to ProgressStyle widget | reference to new instance | 
`value`          | number (integer) | `0`              | Int value

### Jupyter.IntRangeSlider

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'IntSliderModel'` | 
`_range`         | boolean          | `true`           | Display a range selector
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'IntSliderView'` | 
`continuous_update` | boolean          | `true`           | Update the value of the widget as the user is sliding the slider.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`max`            | number (integer) | `100`            | Max value
`min`            | number (integer) | `0`              | Min value
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`orientation`    | string (one of `'horizontal'`, `'vertical'`) | `'horizontal'`   | Vertical or horizontal.
`readout`        | boolean          | `true`           | Display the current value of the slider next to it.
`slider_color`   | `null` or string | `null`           | 
`step`           | number (integer) | `1`              | Minimum step that the value can take (ignored by some views)
`value`          | array            | `[0, 1]`         | Tuple of (lower, upper) bounds

### Jupyter.IntSlider

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'IntSliderModel'` | 
`_range`         | boolean          | `false`          | Display a range selector
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'IntSliderView'` | 
`continuous_update` | boolean          | `true`           | Update the value of the widget as the user is holding the slider.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`max`            | number (integer) | `100`            | Max value
`min`            | number (integer) | `0`              | Min value
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`orientation`    | string (one of `'horizontal'`, `'vertical'`) | `'horizontal'`   | Vertical or horizontal.
`readout`        | boolean          | `true`           | Display the current value of the slider next to it.
`readout_format` | string           | `'d'`            | Format for the readout
`step`           | number (integer) | `1`              | Minimum step to increment the value (ignored by some views)
`style`          | reference to SliderStyle widget | reference to new instance | 
`value`          | number (integer) | `0`              | Int value

### Jupyter.IntText

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'IntTextModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'IntTextView'`  | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`value`          | number (integer) | `0`              | Int value

### Jupyter.Label

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'LabelModel'`   | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'LabelView'`    | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`placeholder`    | string           | `'\u200b'`       | Placeholder text to display when nothing has been typed
`value`          | string           | `''`             | String value

### Jupyter.Play

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'PlayModel'`    | 
`_playing`       | boolean          | `false`          | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'PlayView'`     | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`interval`       | number (integer) | `100`            | 
`layout`         | reference to Layout widget | reference to new instance | 
`max`            | number (integer) | `100`            | Max value
`min`            | number (integer) | `0`              | Min value
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`step`           | number (integer) | `1`              | Minimum step to increment the value (ignored by some views)
`value`          | number (integer) | `0`              | Int value

### Jupyter.ProgressStyle

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'ProgressStyleModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'StyleView'`    | 
`bar_color`      | `null` or string | `null`           | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.

### Jupyter.RadioButtons

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'RadioButtonsModel'` | 
`_options_labels` | array            | `[]`             | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'RadioButtonsView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`value`          | string (valid option label) | `null`           | Selected value

### Jupyter.Select

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'SelectModel'`  | 
`_options_labels` | array            | `[]`             | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'SelectView'`   | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`value`          | string (valid option label) | `null`           | Selected value

### Jupyter.SelectMultiple

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'SelectMultipleModel'` | 
`_options_labels` | array            | `[]`             | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'SelectMultipleView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`value`          | array            | `[]`             | Selected values

### Jupyter.SelectionSlider

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'SelectionSliderModel'` | 
`_options_labels` | array            | `[]`             | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'SelectionSliderView'` | 
`continuous_update` | boolean          | `true`           | Update the value of the widget as the user is holding the slider.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`orientation`    | string (one of `'horizontal'`, `'vertical'`) | `'horizontal'`   | Vertical or horizontal.
`readout`        | boolean          | `true`           | Display the current selected label next to the slider
`value`          | string (valid option label) | `null`           | Selected value

### Jupyter.SliderStyle

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'SliderStyleModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'StyleView'`    | 
`handle_color`   | `null` or string | `null`           | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.

### Jupyter.Tab

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'TabModel'`     | 
`_titles`        | object           | `{}`             | Titles of the pages
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'TabView'`      | 
`box_style`      | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the box.
`children`       | array            | `[]`             | 
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`selected_index` | number (integer) | `0`              | 

### Jupyter.Text

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'TextModel'`    | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'TextView'`     | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`placeholder`    | string           | `'\u200b'`       | Placeholder text to display when nothing has been typed
`value`          | string           | `''`             | String value

### Jupyter.Textarea

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'TextareaModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'TextareaView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`placeholder`    | string           | `'\u200b'`       | Placeholder text to display when nothing has been typed
`rows`           | `null` or number (integer) | `null`           | 
`value`          | string           | `''`             | String value

### Jupyter.ToggleButton

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'ToggleButtonModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'ToggleButtonView'` | 
`button_style`   | string (one of `'primary'`, `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the button.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes.
`icon`           | string           | `''`             | Font-awesome icon.
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`tooltip`        | string           | `''`             | Tooltip caption of the toggle button.
`value`          | boolean          | `false`          | Bool value

### Jupyter.ToggleButtons

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'ToggleButtonsModel'` | 
`_options_labels` | array            | `[]`             | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'ToggleButtonsView'` | 
`button_style`   | `null` or string (one of `'primary'`, `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the buttons.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`icons`          | array            | `[]`             | 
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`tooltips`       | array            | `[]`             | 
`value`          | string (valid option label) | `null`           | Selected value

### Jupyter.VBox

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'VBoxModel'`    | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'VBoxView'`     | 
`box_style`      | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the box.
`children`       | array            | `[]`             | 
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.

### Jupyter.Valid

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'ValidModel'`   | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'ValidView'`    | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes.
`layout`         | reference to Layout widget | reference to new instance | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`readout`        | string           | `'Invalid'`      | Message displayed when the value is False
`value`          | boolean          | `false`          | Bool value

### jupyter.DirectionalLink

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'DirectionalLinkModel'` | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | `null` or string | `null`           | Name of the view object.
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`source`         | array            | `[]`             | The source (widget, 'trait_name') pair
`target`         | array            | `[]`             | The target (widget, 'trait_name') pair

### jupyter.Link

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'LinkModel'`    | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | `null` or string | `null`           | Name of the view object.
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`source`         | array            | `[]`             | The source (widget, 'trait_name') pair
`target`         | array            | `[]`             | The target (widget, 'trait_name') pair

### Layout

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'LayoutModel'`  | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'LayoutView'`   | 
`align_content`  | `null` or string (one of `'flex-start'`, `'flex-end'`, `'center'`, `'space-between'`, `'space-around'`, `'space-evenly'`, `'stretch'`, `'inherit'`, `'initial'`, `'unset'`) | `null`           | 
`align_items`    | `null` or string (one of `'flex-start'`, `'flex-end'`, `'center'`, `'baseline'`, `'stretch'`, `'inherit'`, `'initial'`, `'unset'`) | `null`           | 
`align_self`     | `null` or string (one of `'auto'`, `'flex-start'`, `'flex-end'`, `'center'`, `'baseline'`, `'stretch'`, `'inherit'`, `'initial'`, `'unset'`) | `null`           | 
`border`         | `null` or string | `null`           | 
`bottom`         | `null` or string | `null`           | 
`display`        | `null` or string | `null`           | 
`flex`           | `null` or string | `null`           | 
`flex_flow`      | `null` or string | `null`           | 
`height`         | `null` or string | `null`           | 
`justify_content` | `null` or string (one of `'flex-start'`, `'flex-end'`, `'center'`, `'space-between'`, `'space-around'`, `'inherit'`, `'initial'`, `'unset'`) | `null`           | 
`left`           | `null` or string | `null`           | 
`margin`         | `null` or string | `null`           | 
`max_height`     | `null` or string | `null`           | 
`max_width`      | `null` or string | `null`           | 
`min_height`     | `null` or string | `null`           | 
`min_width`      | `null` or string | `null`           | 
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.
`order`          | `null` or string | `null`           | 
`overflow`       | `null` or string (one of `'visible'`, `'hidden'`, `'scroll'`, `'auto'`, `'inherit'`, `'initial'`, `'unset'`) | `null`           | 
`overflow_x`     | `null` or string (one of `'visible'`, `'hidden'`, `'scroll'`, `'auto'`, `'inherit'`, `'initial'`, `'unset'`) | `null`           | 
`overflow_y`     | `null` or string (one of `'visible'`, `'hidden'`, `'scroll'`, `'auto'`, `'inherit'`, `'initial'`, `'unset'`) | `null`           | 
`padding`        | `null` or string | `null`           | 
`right`          | `null` or string | `null`           | 
`top`            | `null` or string | `null`           | 
`visibility`     | `null` or string (one of `'visible'`, `'hidden'`, `'inherit'`, `'initial'`, `'unset'`) | `null`           | 
`width`          | `null` or string | `null`           | 

### Output

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_dom_classes`   | array            | `[]`             | CSS classes applied to widget DOM element
`_model_module`  | string           | `'jupyter-js-widgets'` | 
`_model_module_version` | string           | `'~2.1.0'`       | 
`_model_name`    | string           | `'OutputModel'`  | 
`_view_module`   | string           | `'jupyter-js-widgets'` | 
`_view_module_version` | string           | `'~2.1.0'`       | 
`_view_name`     | string           | `'OutputView'`   | 
`layout`         | reference to Layout widget | reference to new instance | 
`msg_id`         | string           | `''`             | Parent message id of messages to capture
`msg_throttle`   | number (integer) | `1`              | Maximum number of msgs the front-end can send before receiving an idle msg from the back-end.



## Inheritance

In the list below, the notation `WidgetB(WidgetA)` indicates that WidgetB inherits all of the attributes from WidgetA. This may help in implementing widgets to easily see the inheritance hierarcy.

* CoreWidget - Abstract
* DOMWidget(Widget) - Abstract
* LabeledDOMWidget(DOMWidget)
* Accordion(LabeledDOMWidget)
* BoundedFloatText(LabeledDOMWidget)
* BoundedIntText(LabeledDOMWidget)
* Box(DOMWIdget)
* HBox(Box)
* VBox(Box)
* Button(DOMWidget)
* ButtonStyle
* Checkbox(LabeledDOMWidget)
* ColorPicker(LabeledDOMWidget)
* Controller
* DatePicker(LabeledDOMWidget)
* Dropdown(LabeledDOMWidget)
* Progress(LabeledDOMWidget)
* ProgressStyle
* FloatRangeSlider(LabeledDOMWidget)
* FloatSlider(LabeledDOMWidget)
* FloatText(LabeledDOMWidget)
* HTML(LabeledDOMWidget)
* HTMLMath(HTML)
* Image(DOMWidget)
* IntRangeSlider(LabeledDOMWidget)
* IntSlider(LabeledDOMWidget)
* IntText(LabeledDOMWidget)
* Label(LabeledDOMWidget)
* Layout
* Output
* Play(LabeledDOMWidget)
* RadioButtons(LabeledDOMWidget)
* Select(LabeledDOMWidget)
* SelectMultiple(LabeledDOMWidget)
* SelectionSlider(LabeledDOMWidget)
* Text(LabeledDOMWidget)
* Textarea(LabeledDOMWidget)
* ToggleButton(LabeledDOMWidget)
* ToggleButtons(LabeledDOMWidget)
* Valid(LabeledDOMWidget)
* Tab(DOMWidget)
* Link(Widget)



## Automated documentation

The code to generate the model attribute listing is below.

```python
import ipywidgets as widgets
from ipywidgets import *

from traitlets import CaselessStrEnum, Unicode, Tuple, List, Bool, CFloat, Float, CInt, Int, Instance, Undefined, Dict, Any
from ipywidgets import Color

widgets_to_document = sorted(widgets.Widget.widget_types.items()) + [('Layout', widgets.Layout), ('Output', widgets.Output)]

def typing(x):
    s = ''
    if isinstance(x, CaselessStrEnum):
        s = 'string (one of %s)'%(', '.join('`%r`'%i for i in x.values))
    elif isinstance(x, Unicode):
        s = 'string'
    elif isinstance(x, (Tuple, List)):
        s = 'array'
    elif isinstance(x, Bool):
        s = 'boolean'
    elif isinstance(x, (CFloat, Float)):
        s = 'number (float)'
    elif isinstance(x, (CInt, Int)):
        s = 'number (integer)'
    elif isinstance(x, Color):
        s = 'string (valid color)'
    elif isinstance(x, Dict):
        s = 'object'
    elif isinstance(x, Instance) and issubclass(x.klass, widgets.Widget):
        s = 'reference to %s widget'%(x.klass.__name__)
        # ADD the widget to this documenting list
        if x.klass not in [i[1] for i in widgets_to_document]:
            widgets_to_document.append((x.klass.__name__, x.klass))
    elif isinstance(x, Any):
        # In our case, these all happen to be values that are converted to strings
        s = 'string (valid option label)'
    else:
        s = x.__class__.__name__
    if x.allow_none:
        s = "`null` or "+s
    return s

def jsdefault(t):
    x = t.default_value
    if isinstance(t, Instance):
        x = t.make_dynamic_default()
        if issubclass(t.klass, widgets.Widget):
            return 'reference to new instance'
    if x is True:
        return '`true`'
    elif x is False:
        return '`false`'
    elif x is None:
        return '`null`'
    elif isinstance(x, tuple):
        return '`{0}`'.format(list(x))
    else:
        return '`%s`'%t.default_value_repr()

def format_widget(n, w):
    out = []
    out.append('### %s'%n)
    out.append('')
    out.append('{name: <16} | {typing: <16} | {default: <16} | {help}'.format(name='Attribute', typing='Type', 
                                                                             allownone='Nullable', default='Default', help='Help'))
    out.append('{0:-<16}-|-{0:-<16}-|-{0:-<16}-|----'.format('-'))
    for name, t in sorted(w.traits(sync=True).items()):
        if name in ['_model_module', '_view_module', '_model_module_version', '_view_module_version', 'msg_throttle', '_dom_classes', 'layout']:
            # document these separately, since they apply to all classes
            pass
        s = '{name: <16} | {typing: <16} | {default: <16} | {help}'.format(name='`%s`'%name, typing=typing(t), 
                                                            allownone='*' if t.allow_none else '', 
                                                                                               default=jsdefault(t),
                                                                                              help=t.help if t.help else '')
        out.append(s)
    out.append('')
    return '\n'.join(out)
    
out = ''
for n,w in widgets_to_document:
    if n in ['jupyter.Link', 'jupyter.DirectionalLink']:
        out += '\n'+format_widget(n, w((IntSlider(), 'value'), (IntSlider(), 'value')))
    else:
        out += '\n'+format_widget(n,w())
print(out)


```


