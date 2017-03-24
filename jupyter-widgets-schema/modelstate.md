# Model State

This is a description of the model state for each widget in the core Jupyter widgets library. The model ID of a widget is the id of the comm object the widget is using. A model reference (denoted `REFERENCE<SomeWidgetModel>`) is a string of the form `"IPY_MODEL_<MODEL_ID>"`, where `<MODEL_ID>` is the model ID of a previously created widget of the specified type.

In the headings below, the notation `WidgetB(WidgetA)` indicates that WidgetB inherits all of the attributes from WidgetA.

## CoreWidget - Abstract

```
"_model_module": "jupyter-js-widgets",
"_model_module_version": "~2.2.0",
"_model_name": string,
"_view_module": "jupyter-js-widgets",
"_view_module_version": "~2.2.0",
"_view_name": string,
"msg_throttle": number = 1,
```

## DOMWidget(Widget) - Abstract

```
"_dom_classes": string[], # CSS classes applied to the widget
"layout": REFERENCE<LayoutModel>,
```

## LabeledDOMWidget(DOMWidget)
```
"description": string # a label for the widget
```

## Accordion(LabeledDOMWidget)

```
"_model_name":"AccordionModel"
"_titles": {}
"_view_name":"AccordionView"
"box_style": string
"children": REFERENCE<DOMWidget>[]
"selected_index": number = 0
```

## BoundedFloatText(LabeledDOMWidget)
```
"_model_name":"FloatTextModel",
"_view_name":"FloatTextView",
"disabled": bool = false,
"max": number = 10,
"min": number = 0,
"step": number = 0.1,
"value": number = 0,
```


## BoundedIntText(LabeledDOMWidget)

```
"_model_name": "IntTextModel",
"_view_name": "IntTextView",
"disabled": bool = false,
"max": number = 10,
"min": number = 0,
"step": number = 1,
"value": number = 0,
```

## Box(DOMWIdget)

```
"_model_name": "BoxModel",
"_view_name": "BoxView",
"box_style": string,
"children": REFERENCE<DOMWidget>[]
```

## HBox(Box)

```
"_model_name": "HBoxModel",
"_view_name": "HBoxView",
```

## VBox(Box)

```
"_model_name": "VBoxModel",
"_view_name": "VBoxView",
```


## Button(DOMWidget)

```
"_model_name": "ButtonModel",
"_view_name": "ButtonView",
"button_style": string,
"description": string,
"disabled": bool = false,
"icon": string,
"style": REFERENCE<ButtonStyle>,
"tooltip": string
```


## ButtonStyle

```
"_model_name": "ButtonStyleModel",
"_view_name": "StyleView",
"button_color": string = null,
"font_weight": string,
```

## Checkbox(LabeledDOMWidget)

```
"_model_name": "CheckboxModel",
"_view_name": "CheckboxView",
"disabled": bool = false,
"value": bool = false,
```

## ColorPicker(LabeledDOMWidget)

```
"_model_name": "ColorPickerModel",
"_view_name": "ColorPickerView",
"concise": bool = false,
"value": string,
```
## Controller

TODO

```
"_model_name": "ControllerModel",
"_view_name": "ControllerView",
"axes":[]
"buttons":[],
"index":0,
"mapping":"",
"name":"",
"timestamp":0,
"connected":false,
```

## DatePicker(LabeledDOMWidget)

```
"_model_name": "DatePickerModel",
"_view_name": "DatePickerView",
"value": string = null,
```

## Dropdown(LabeledDOMWidget)

```
"_model_name": "DropdownModel",
"_options_labels": string[],
"_view_name": "DropdownView",
"disabled": bool = false,
"value": string,
```
## Progress(LabeledDOMWidget)


```
"_model_name": "ProgressModel",
"_view_name": "ProgressView",
"bar_style": string,
"disabled": bool = false,
"max":number = 10,
"min": number = 0
"orientation": string = "horizontal",
"step":number = 0.1,
"style": REFERENCE<ProgressStyle>,
"value": number = 0,
```

## ProgressStyle

```
"_model_name": "ProgressStyleModel",
"_view_name": "StyleView",
"bar_color": string = null,
```

## FloatRangeSlider(LabeledDOMWidget)

```
"_model_name": "FloatSliderModel",
"_range": bool = true,
"_view_name": "FloatSliderView",
"continuous_update": bool = false,
"disabled": bool = false,
"max": number = 10.0,
"min": number = 0.0
"orientation": string = "horizontal",
"readout": bool = true,
"slider_color": string = "white",
"step": number = 0.1,
"value": number[] # [min, max],
```

## FloatSlider(LabeledDOMWidget)

```
"_model_name": "FloatSliderModel",
"_range": bool = false,
"_view_name": "FloatSliderView",
"continuous_update": bool = false,
"disabled": bool = false,
"max": number = 10.0,
"min": number = 0.0
"orientation": string = "horizontal",
"readout": bool = true,
"readout_format": string = ".1f",
"slider_color": string = "white",
"step": number = 0.1,
"value": number = 0,
```

## FloatText(LabeledDOMWidget)

```
"_model_name": "FloatTextModel",
"_view_name": "FloatTextView",
"disabled": bool = false,
"max": number = 10,
"min": number = 0,
"step": number = 0.1,
"value": number = 0,
```

## HTML(LabeledDOMWidget)

```
"_model_name": "HTMLModel",
"_view_name": "HTMLView",
"disabled": bool = false,
"placeholder": string,
"value": string,
```

## HTMLMath(HTML)

```
"_model_name": "HTMLMathModel",
"_view_name": "HTMLMathView",
```

## Image(DOMWidget)

```
"_b64value": string,
"_model_name": "ImageModel",
"_view_name": "ImageView",
"format": string = "png",
"height": string
"width": string,
```

## IntRangeSlider(LabeledDOMWidget)

```
"_model_name":"IntSliderModel",
"_range":true,
"_view_name":"IntSliderView",
"continuous_update":false,
"disabled":false,
"max":10,
"min":0,
"orientation":"horizontal",
"readout":true,
"slider_color":"white",
"step":1,
"value":[5,7],
```

## IntSlider(LabeledDOMWidget)


```
"_model_name": "IntSliderModel"
"_range": false,
"_view_name": "IntSliderView",
"continuous_update": false,
"disabled": false,
"max": 10,
"min": 0
"orientation": "horizontal",
"readout": true,
"readout_format": "i",
"step": 1,
"style": REFERENCE(SliderStyle),
"value": 7,
```

## IntText(LabeledDOMWidget)

```
"_model_name":"IntTextModel",
"_view_name":"IntTextView",
"disabled":false,
"value":7,
```

## Label(LabeledDOMWidget)

```
"_model_name":"LabelModel",
"_view_name":"LabelView",
"disabled":false,
"placeholder":"Some LaTeX",
"value": string,
```

## Layout

```
"align_content": null,
"align_items": null,
"align_self": null,
"border": null,
"bottom": null,
"display": null,
"flex": null,
"flex_flow": null,
"height": null,
"justify_content": null
"left": null,
"margin": null,
"max_height": null,
"max_width": null,
"min_height": null,
"min_width": null,
"order": null,
"overflow": null,
"overflow_x": null,
"overflow_y": null,
"padding": null,
"right": null,
"top": null,
"visibility": null,
"width": null,
```


## Output

```
"_model_name":"OutputModel",
"_view_name":"OutputView",
"msg_id":"",
```


## Play(LabeledDOMWidget)

```
"_model_name":"PlayModel",
"_playing":false,
"_view_name":"PlayView",
"disabled":false,
"interval":100,
"max":100,
"min":0,
"step":1,
"value":50,
```


## RadioButtons(LabeledDOMWidget)

```
"_model_name":"RadioButtonsModel",
"_options_labels": string[],
"_view_name":"RadioButtonsView",
"disabled":false,
"value":"pepperoni",
```


## Select(LabeledDOMWidget)


```
"_model_name":"SelectModel",
"_options_labels": string[],
"_view_name":"SelectView",
"disabled":false,
"value":"Linux",
```

## SelectMultiple(LabeledDOMWidget)

```
"_model_name":"SelectMultipleModel",
"_options_labels": string[],
"_view_name":"SelectMultipleView",
"disabled":false,
"value": string[],
```


## SelectionSlider(LabeledDOMWidget)

```
"_model_name":"SelectionSliderModel",
"_options_labels": string[],
"_view_name":"SelectionSliderView",
"continuous_update":false,
"disabled":false,
"orientation":"horizontal",
"readout":true,
"value":"sunny side up",
```


## Text(LabeledDOMWidget)

```
"_model_name":"TextModel",
"_view_name":"TextView",
"disabled":false,
"placeholder":"Type something",
"value":"Hello World",
```

## Textarea(LabeledDOMWidget)

```
"_model_name":"TextareaModel",
"_view_name":"TextareaView",
"disabled":false,
"placeholder":"Type something",
"rows":null,
"value":"Hello World",
```

## ToggleButton(LabeledDOMWidget)

```
"_model_name":"ToggleButtonModel",
"_view_name":"ToggleButtonView",
"button_style":"",
"disabled":false,
"icon":"check",
"tooltip":"Description",
"value":false,
```

## ToggleButtons(LabeledDOMWidget)

```
"_model_name":"ToggleButtonsModel",
"_options_labels": string[],
"_view_name":"ToggleButtonsView",
"button_style":"",
"disabled":false,
"icons":[],
"tooltips":[],
"value":"Slow",
```

## Valid(LabeledDOMWidget)

```
"_model_name":"ValidModel",
"_view_name":"ValidView",
"disabled":false,
"readout":"",
"value":false,
```

## Tab(DOMWidget)

```
"_model_name":"TabModel",
"_titles":{},
"_view_name":"TabView",
"box_style":"",
"children": REFERENCE(DOMWidget)[]
"selected_index":0,
```

## Link(Widget)

```
"_model_name":"LinkModel",
"_view_name":null,
"source": [REFERENCE(Widget), string]
"target": [REFERENCE(Widget), string]
```





# Automated documentation

Here is code to automate pulling out the traits:

```python
import ipywidgets as widgets
from ipywidgets import *

from traitlets import CaselessStrEnum, Unicode, Tuple, List, Bool, CFloat, Float, CInt, Int, Instance, Undefined, Dict, Any
from ipywidgets import Color
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

out = []
for n,w in sorted(widgets.Widget.widget_types.items()):
    if n in ['jupyter.Link', 'jupyter.DirectionalLink']:
        continue
    out.append('### %s'%n)
    out.append('')
    out.append('{name: <16} | {typing: <16} | {default: <16} | {help}'.format(name='Attribute', typing='Type', 
                                                                             allownone='Nullable', default='Default', help='Help'))
    out.append('{0:-<16}-|-{0:-<16}-|-{0:-<16}-|----'.format('-'))
    for name, t in sorted(w().traits(sync=True).items()):
        if name in ['_model_module', '_view_module', '_model_module_version', '_view_module_version', 'msg_throttle', '_dom_classes', 'layout']:
            # document these separately, since they apply to all classes
            continue
        s = '{name: <16} | {typing: <16} | {default: <16} | {help}'.format(name='`%s`'%name, typing=typing(t), 
                                                            allownone='*' if t.allow_none else '', 
                                                                                               default=jsdefault(t),
                                                                                              help=t.help if t.help else '')
        out.append(s)
    out.append('')
print('\n'.join(out))


```

### Jupyter.Accordion

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'AccordionModel'` | 
`_titles`        | object           | `{}`             | Titles of the pages
`_view_name`     | string           | `'AccordionView'` | 
`box_style`      | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the box.
`children`       | array            | `[]`             | 
`selected_index` | number (integer) | `0`              | 

### Jupyter.BoundedFloatText

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'FloatTextModel'` | 
`_view_name`     | string           | `'FloatTextView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`max`            | number (float)   | `100.0`          | Max value
`min`            | number (float)   | `0.0`            | Min value
`step`           | number (float)   | `0.1`            | Minimum step to increment the value (ignored by some views)
`value`          | number (float)   | `0.0`            | Float value

### Jupyter.BoundedIntText

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'IntTextModel'` | 
`_view_name`     | string           | `'IntTextView'`  | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`max`            | number (integer) | `100`            | Max value
`min`            | number (integer) | `0`              | Min value
`step`           | number (integer) | `1`              | Minimum step to increment the value (ignored by some views)
`value`          | number (integer) | `0`              | Int value

### Jupyter.Box

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'BoxModel'`     | 
`_view_name`     | string           | `'BoxView'`      | 
`box_style`      | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the box.
`children`       | array            | `[]`             | 

### Jupyter.Button

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'ButtonModel'`  | 
`_view_name`     | string           | `'ButtonView'`   | 
`button_style`   | string (one of `'primary'`, `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the button.
`description`    | string           | `''`             | Button label.
`disabled`       | boolean          | `false`          | Enable or disable user changes.
`icon`           | string           | `''`             | Font-awesome icon name, without the 'fa-' prefix.
`style`          | reference to ButtonStyle widget | reference to new instance | 
`tooltip`        | string           | `''`             | Tooltip caption of the button.

### Jupyter.ButtonStyle

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'ButtonStyleModel'` | 
`_view_name`     | string           | `'StyleView'`    | 
`button_color`   | `null` or string | `null`           | 
`font_weight`    | string           | `''`             | 

### Jupyter.Checkbox

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'CheckboxModel'` | 
`_view_name`     | string           | `'CheckboxView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes.
`value`          | boolean          | `false`          | Bool value

### Jupyter.ColorPicker

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'ColorPickerModel'` | 
`_view_name`     | string           | `'ColorPickerView'` | 
`concise`        | boolean          | `false`          | 
`description`    | string           | `''`             | Description of the control.
`value`          | string           | `'black'`        | 

### Jupyter.Controller

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'ControllerModel'` | 
`_view_name`     | string           | `'ControllerView'` | 
`axes`           | array            | `[]`             | 
`buttons`        | array            | `[]`             | 
`connected`      | boolean          | `false`          | 
`index`          | number (integer) | `0`              | 
`mapping`        | string           | `''`             | 
`name`           | string           | `''`             | 
`timestamp`      | number (float)   | `0.0`            | 

### Jupyter.ControllerAxis

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'ControllerAxisModel'` | 
`_view_name`     | string           | `'ControllerAxisView'` | 
`value`          | number (float)   | `0.0`            | 

### Jupyter.ControllerButton

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'ControllerButtonModel'` | 
`_view_name`     | string           | `'ControllerButtonView'` | 
`pressed`        | boolean          | `false`          | 
`value`          | number (float)   | `0.0`            | 

### Jupyter.DatePicker

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'DatePickerModel'` | 
`_view_name`     | string           | `'DatePickerView'` | 
`description`    | string           | `''`             | Description of the control.
`value`          | `null` or Datetime | `null`           | 

### Jupyter.Dropdown

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'DropdownModel'` | 
`_options_labels` | array            | `[]`             | 
`_view_name`     | string           | `'DropdownView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`value`          | string (valid option label) | `null`           | Selected value

### Jupyter.FloatProgress

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'ProgressModel'` | 
`_view_name`     | string           | `'ProgressView'` | 
`bar_style`      | `null` or string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the progess bar.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`max`            | number (float)   | `100.0`          | Max value
`min`            | number (float)   | `0.0`            | Min value
`orientation`    | string (one of `'horizontal'`, `'vertical'`) | `'horizontal'`   | Vertical or horizontal.
`step`           | number (float)   | `0.1`            | Minimum step to increment the value (ignored by some views)
`style`          | reference to ProgressStyle widget | reference to new instance | 
`value`          | number (float)   | `0.0`            | Float value

### Jupyter.FloatRangeSlider

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'FloatSliderModel'` | 
`_range`         | boolean          | `true`           | Display a range selector
`_view_name`     | string           | `'FloatSliderView'` | 
`continuous_update` | boolean          | `true`           | Update the value of the widget as the user is sliding the slider.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`max`            | number (float)   | `100.0`          | Max value
`min`            | number (float)   | `0.0`            | Min value
`orientation`    | string (one of `'horizontal'`, `'vertical'`) | `'horizontal'`   | Vertical or horizontal.
`readout`        | boolean          | `true`           | Display the current value of the slider next to it.
`slider_color`   | `null` or string | `null`           | 
`step`           | number (float)   | `1.0`            | Minimum step that the value can take (ignored by some views)
`value`          | array            | `[0.0, 1.0]`     | Tuple of (lower, upper) bounds

### Jupyter.FloatSlider

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'FloatSliderModel'` | 
`_range`         | boolean          | `false`          | Display a range selector
`_view_name`     | string           | `'FloatSliderView'` | 
`continuous_update` | boolean          | `true`           | Update the value of the widget as the user is holding the slider.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`max`            | number (float)   | `100.0`          | Max value
`min`            | number (float)   | `0.0`            | Min value
`orientation`    | string (one of `'horizontal'`, `'vertical'`) | `'horizontal'`   | Vertical or horizontal.
`readout`        | boolean          | `true`           | Display the current value of the slider next to it.
`readout_format` | string           | `'.2f'`          | Format for the readout
`slider_color`   | `null` or string | `null`           | 
`step`           | number (float)   | `0.1`            | Minimum step to increment the value (ignored by some views)
`value`          | number (float)   | `0.0`            | Float value

### Jupyter.FloatText

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'FloatTextModel'` | 
`_view_name`     | string           | `'FloatTextView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`value`          | number (float)   | `0.0`            | Float value

### Jupyter.HBox

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'HBoxModel'`    | 
`_view_name`     | string           | `'HBoxView'`     | 
`box_style`      | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the box.
`children`       | array            | `[]`             | 

### Jupyter.HTML

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'HTMLModel'`    | 
`_view_name`     | string           | `'HTMLView'`     | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`placeholder`    | string           | `'\u200b'`       | Placeholder text to display when nothing has been typed
`value`          | string           | `''`             | String value

### Jupyter.HTMLMath

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'HTMLMathModel'` | 
`_view_name`     | string           | `'HTMLMathView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`placeholder`    | string           | `'\u200b'`       | Placeholder text to display when nothing has been typed
`value`          | string           | `''`             | String value

### Jupyter.Image

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_b64value`      | string           | `''`             | 
`_model_name`    | string           | `'ImageModel'`   | 
`_view_name`     | string           | `'ImageView'`    | 
`format`         | string           | `'png'`          | 
`height`         | string           | `''`             | 
`width`          | string           | `''`             | 

### Jupyter.IntProgress

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'ProgressModel'` | 
`_view_name`     | string           | `'ProgressView'` | 
`bar_style`      | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the progess bar.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`max`            | number (integer) | `100`            | Max value
`min`            | number (integer) | `0`              | Min value
`orientation`    | string (one of `'horizontal'`, `'vertical'`) | `'horizontal'`   | Vertical or horizontal.
`step`           | number (integer) | `1`              | Minimum step to increment the value (ignored by some views)
`style`          | reference to ProgressStyle widget | reference to new instance | 
`value`          | number (integer) | `0`              | Int value

### Jupyter.IntRangeSlider

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'IntSliderModel'` | 
`_range`         | boolean          | `true`           | Display a range selector
`_view_name`     | string           | `'IntSliderView'` | 
`continuous_update` | boolean          | `true`           | Update the value of the widget as the user is sliding the slider.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`max`            | number (integer) | `100`            | Max value
`min`            | number (integer) | `0`              | Min value
`orientation`    | string (one of `'horizontal'`, `'vertical'`) | `'horizontal'`   | Vertical or horizontal.
`readout`        | boolean          | `true`           | Display the current value of the slider next to it.
`slider_color`   | `null` or string | `null`           | 
`step`           | number (integer) | `1`              | Minimum step that the value can take (ignored by some views)
`value`          | array            | `[0, 1]`         | Tuple of (lower, upper) bounds

### Jupyter.IntSlider

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'IntSliderModel'` | 
`_range`         | boolean          | `false`          | Display a range selector
`_view_name`     | string           | `'IntSliderView'` | 
`continuous_update` | boolean          | `true`           | Update the value of the widget as the user is holding the slider.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`max`            | number (integer) | `100`            | Max value
`min`            | number (integer) | `0`              | Min value
`orientation`    | string (one of `'horizontal'`, `'vertical'`) | `'horizontal'`   | Vertical or horizontal.
`readout`        | boolean          | `true`           | Display the current value of the slider next to it.
`readout_format` | string           | `'d'`            | Format for the readout
`step`           | number (integer) | `1`              | Minimum step to increment the value (ignored by some views)
`style`          | reference to SliderStyle widget | reference to new instance | 
`value`          | number (integer) | `0`              | Int value

### Jupyter.IntText

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'IntTextModel'` | 
`_view_name`     | string           | `'IntTextView'`  | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`value`          | number (integer) | `0`              | Int value

### Jupyter.Label

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'LabelModel'`   | 
`_view_name`     | string           | `'LabelView'`    | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`placeholder`    | string           | `'\u200b'`       | Placeholder text to display when nothing has been typed
`value`          | string           | `''`             | String value

### Jupyter.Play

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'PlayModel'`    | 
`_playing`       | boolean          | `false`          | 
`_view_name`     | string           | `'PlayView'`     | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`interval`       | number (integer) | `100`            | 
`max`            | number (integer) | `100`            | Max value
`min`            | number (integer) | `0`              | Min value
`step`           | number (integer) | `1`              | Minimum step to increment the value (ignored by some views)
`value`          | number (integer) | `0`              | Int value

### Jupyter.ProgressStyle

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'ProgressStyleModel'` | 
`_view_name`     | string           | `'StyleView'`    | 
`bar_color`      | `null` or string | `null`           | 

### Jupyter.RadioButtons

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'RadioButtonsModel'` | 
`_options_labels` | array            | `[]`             | 
`_view_name`     | string           | `'RadioButtonsView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`value`          | string (valid option label) | `null`           | Selected value

### Jupyter.Select

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'SelectModel'`  | 
`_options_labels` | array            | `[]`             | 
`_view_name`     | string           | `'SelectView'`   | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`value`          | string (valid option label) | `null`           | Selected value

### Jupyter.SelectMultiple

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'SelectMultipleModel'` | 
`_options_labels` | array            | `[]`             | 
`_view_name`     | string           | `'SelectMultipleView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`value`          | array            | `[]`             | Selected values

### Jupyter.SelectionSlider

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'SelectionSliderModel'` | 
`_options_labels` | array            | `[]`             | 
`_view_name`     | string           | `'SelectionSliderView'` | 
`continuous_update` | boolean          | `true`           | Update the value of the widget as the user is holding the slider.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`orientation`    | string (one of `'horizontal'`, `'vertical'`) | `'horizontal'`   | Vertical or horizontal.
`readout`        | boolean          | `true`           | Display the current selected label next to the slider
`value`          | string (valid option label) | `null`           | Selected value

### Jupyter.SliderStyle

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'SliderStyleModel'` | 
`_view_name`     | string           | `'StyleView'`    | 
`handle_color`   | `null` or string | `null`           | 

### Jupyter.Tab

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'TabModel'`     | 
`_titles`        | object           | `{}`             | Titles of the pages
`_view_name`     | string           | `'TabView'`      | 
`box_style`      | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the box.
`children`       | array            | `[]`             | 
`selected_index` | number (integer) | `0`              | 

### Jupyter.Text

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'TextModel'`    | 
`_view_name`     | string           | `'TextView'`     | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`placeholder`    | string           | `'\u200b'`       | Placeholder text to display when nothing has been typed
`value`          | string           | `''`             | String value

### Jupyter.Textarea

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'TextareaModel'` | 
`_view_name`     | string           | `'TextareaView'` | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`placeholder`    | string           | `'\u200b'`       | Placeholder text to display when nothing has been typed
`rows`           | `null` or number (integer) | `null`           | 
`value`          | string           | `''`             | String value

### Jupyter.ToggleButton

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'ToggleButtonModel'` | 
`_view_name`     | string           | `'ToggleButtonView'` | 
`button_style`   | string (one of `'primary'`, `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the button.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes.
`icon`           | string           | `''`             | Font-awesome icon.
`tooltip`        | string           | `''`             | Tooltip caption of the toggle button.
`value`          | boolean          | `false`          | Bool value

### Jupyter.ToggleButtons

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'ToggleButtonsModel'` | 
`_options_labels` | array            | `[]`             | 
`_view_name`     | string           | `'ToggleButtonsView'` | 
`button_style`   | `null` or string (one of `'primary'`, `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the buttons.
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes
`icons`          | array            | `[]`             | 
`tooltips`       | array            | `[]`             | 
`value`          | string (valid option label) | `null`           | Selected value

### Jupyter.VBox

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'VBoxModel'`    | 
`_view_name`     | string           | `'VBoxView'`     | 
`box_style`      | string (one of `'success'`, `'info'`, `'warning'`, `'danger'`, `''`) | `''`             | Use a predefined styling for the box.
`children`       | array            | `[]`             | 

### Jupyter.Valid

Attribute        | Type             | Default          | Help
-----------------|------------------|------------------|----
`_model_name`    | string           | `'ValidModel'`   | 
`_view_name`     | string           | `'ValidView'`    | 
`description`    | string           | `''`             | Description of the control.
`disabled`       | boolean          | `false`          | Enable or disable user changes.
`readout`        | string           | `'Invalid'`      | Message displayed when the value is False
`value`          | boolean          | `false`          | Bool value
