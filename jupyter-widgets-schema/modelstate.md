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





# Another try

```
import ipywidgets as widgets
from ipywidgets import *
widgets.Widget.widget_types


for n,w in sorted(widgets.Widget.widget_types.items()):
    if n in ['jupyter.Link', 'jupyter.DirectionalLink']:
        continue
    print('### %s'%n)
    print()
    print('`'*3)
    for name, t in sorted(w().traits(sync=True).items()):
        if name in ['_model_module', '_view_module', '_model_module_version', '_view_module_version', 'msg_throttle']:
            continue
        s = '%r: %s = %s'%(name, t.__class__.__name__, t.default_value_repr())
        if t.help:
            s += ' # %s'%t.help
        print(s)
    print('`'*3)
    print()
```

### Jupyter.Accordion

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'AccordionModel'
'_titles': Dict = {} # Titles of the pages
'_view_name': Unicode = 'AccordionView'
'box_style': CaselessStrEnum = '' # Use a predefined styling for the box.
'children': Tuple = ()
'layout': LayoutTraitType = None
'selected_index': CInt = 0
```

### Jupyter.BoundedFloatText

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'FloatTextModel'
'_view_name': Unicode = 'FloatTextView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'max': CFloat = 100.0 # Max value
'min': CFloat = 0.0 # Min value
'step': CFloat = 0.1 # Minimum step to increment the value (ignored by some views)
'value': CFloat = 0.0 # Float value
```

### Jupyter.BoundedIntText

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'IntTextModel'
'_view_name': Unicode = 'IntTextView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'max': CInt = 100 # Max value
'min': CInt = 0 # Min value
'step': CInt = 1 # Minimum step to increment the value (ignored by some views)
'value': CInt = 0 # Int value
```

### Jupyter.Box

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'BoxModel'
'_view_name': Unicode = 'BoxView'
'box_style': CaselessStrEnum = '' # Use a predefined styling for the box.
'children': Tuple = ()
'layout': LayoutTraitType = None
```

### Jupyter.Button

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'ButtonModel'
'_view_name': Unicode = 'ButtonView'
'button_style': CaselessStrEnum = '' # Use a predefined styling for the button.
'description': Unicode = '' # Button label.
'disabled': Bool = False # Enable or disable user changes.
'icon': Unicode = '' # Font-awesome icon name, without the 'fa-' prefix.
'layout': LayoutTraitType = None
'style': Instance = None
'tooltip': Unicode = '' # Tooltip caption of the button.
```

### Jupyter.ButtonStyle

```
'_model_name': Unicode = 'ButtonStyleModel'
'_view_name': Unicode = 'StyleView'
'button_color': Color = None
'font_weight': Unicode = ''
```

### Jupyter.Checkbox

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'CheckboxModel'
'_view_name': Unicode = 'CheckboxView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes.
'layout': LayoutTraitType = None
'value': Bool = False # Bool value
```

### Jupyter.ColorPicker

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'ColorPickerModel'
'_view_name': Unicode = 'ColorPickerView'
'concise': Bool = False
'description': Unicode = '' # Description of the control.
'layout': LayoutTraitType = None
'value': Color = 'black'
```

### Jupyter.Controller

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'ControllerModel'
'_view_name': Unicode = 'ControllerView'
'axes': List = []
'buttons': List = []
'connected': Bool = False
'index': Int = 0
'layout': LayoutTraitType = None
'mapping': Unicode = ''
'name': Unicode = ''
'timestamp': Float = 0.0
```

### Jupyter.ControllerAxis

```
'_model_name': Unicode = 'ControllerAxisModel'
'_view_name': Unicode = 'ControllerAxisView'
'value': Float = 0.0
```

### Jupyter.ControllerButton

```
'_model_name': Unicode = 'ControllerButtonModel'
'_view_name': Unicode = 'ControllerButtonView'
'pressed': Bool = False
'value': Float = 0.0
```

### Jupyter.DatePicker

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'DatePickerModel'
'_view_name': Unicode = 'DatePickerView'
'description': Unicode = '' # Description of the control.
'layout': LayoutTraitType = None
'value': Datetime = None
```

### Jupyter.Dropdown

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'DropdownModel'
'_options_labels': Tuple = ()
'_view_name': Unicode = 'DropdownView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'value': Any = None # Selected value
```

### Jupyter.FloatProgress

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'ProgressModel'
'_view_name': Unicode = 'ProgressView'
'bar_style': CaselessStrEnum = '' # Use a predefined styling for
        the progess bar.
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'max': CFloat = 100.0 # Max value
'min': CFloat = 0.0 # Min value
'orientation': CaselessStrEnum = 'horizontal' # Vertical or horizontal.
'step': CFloat = 0.1 # Minimum step to increment the value (ignored by some views)
'style': Instance = None
'value': CFloat = 0.0 # Float value
```

### Jupyter.FloatRangeSlider

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'FloatSliderModel'
'_range': Bool = True # Display a range selector
'_view_name': Unicode = 'FloatSliderView'
'continuous_update': Bool = True # Update the value of the widget as the user is sliding the slider.
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'max': CFloat = 100.0 # Max value
'min': CFloat = 0.0 # Min value
'orientation': CaselessStrEnum = 'horizontal' # Vertical or horizontal.
'readout': Bool = True # Display the current value of the slider next to it.
'slider_color': Color = None
'step': CFloat = 1.0 # Minimum step that the value can take (ignored by some views)
'value': Tuple = (0.0, 1.0) # Tuple of (lower, upper) bounds
```

### Jupyter.FloatSlider

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'FloatSliderModel'
'_range': Bool = False # Display a range selector
'_view_name': Unicode = 'FloatSliderView'
'continuous_update': Bool = True # Update the value of the widget as the user is holding the slider.
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'max': CFloat = 100.0 # Max value
'min': CFloat = 0.0 # Min value
'orientation': CaselessStrEnum = 'horizontal' # Vertical or horizontal.
'readout': Bool = True # Display the current value of the slider next to it.
'readout_format': Unicode = '.2f' # Format for the readout
'slider_color': Color = None
'step': CFloat = 0.1 # Minimum step to increment the value (ignored by some views)
'value': CFloat = 0.0 # Float value
```

### Jupyter.FloatText

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'FloatTextModel'
'_view_name': Unicode = 'FloatTextView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'value': CFloat = 0.0 # Float value
```

### Jupyter.HBox

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'HBoxModel'
'_view_name': Unicode = 'HBoxView'
'box_style': CaselessStrEnum = '' # Use a predefined styling for the box.
'children': Tuple = ()
'layout': LayoutTraitType = None
```

### Jupyter.HTML

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'HTMLModel'
'_view_name': Unicode = 'HTMLView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'placeholder': Unicode = '\u200b' # Placeholder text to display when nothing has been typed
'value': Unicode = '' # String value
```

### Jupyter.HTMLMath

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'HTMLMathModel'
'_view_name': Unicode = 'HTMLMathView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'placeholder': Unicode = '\u200b' # Placeholder text to display when nothing has been typed
'value': Unicode = '' # String value
```

### Jupyter.Image

```
'_b64value': Unicode = ''
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'ImageModel'
'_view_name': Unicode = 'ImageView'
'format': Unicode = 'png'
'height': CUnicode = ''
'layout': LayoutTraitType = None
'width': CUnicode = ''
```

### Jupyter.IntProgress

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'ProgressModel'
'_view_name': Unicode = 'ProgressView'
'bar_style': CaselessStrEnum = '' # Use a predefined styling for the progess bar.
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'max': CInt = 100 # Max value
'min': CInt = 0 # Min value
'orientation': CaselessStrEnum = 'horizontal' # Vertical or horizontal.
'step': CInt = 1 # Minimum step to increment the value (ignored by some views)
'style': Instance = None
'value': CInt = 0 # Int value
```

### Jupyter.IntRangeSlider

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'IntSliderModel'
'_range': Bool = True # Display a range selector
'_view_name': Unicode = 'IntSliderView'
'continuous_update': Bool = True # Update the value of the widget as the user is sliding the slider.
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'max': CInt = 100 # Max value
'min': CInt = 0 # Min value
'orientation': CaselessStrEnum = 'horizontal' # Vertical or horizontal.
'readout': Bool = True # Display the current value of the slider next to it.
'slider_color': Color = None
'step': CInt = 1 # Minimum step that the value can take (ignored by some views)
'value': Tuple = (0, 1) # Tuple of (lower, upper) bounds
```

### Jupyter.IntSlider

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'IntSliderModel'
'_range': Bool = False # Display a range selector
'_view_name': Unicode = 'IntSliderView'
'continuous_update': Bool = True # Update the value of the widget as the user is holding the slider.
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'max': CInt = 100 # Max value
'min': CInt = 0 # Min value
'orientation': CaselessStrEnum = 'horizontal' # Vertical or horizontal.
'readout': Bool = True # Display the current value of the slider next to it.
'readout_format': Unicode = 'd' # Format for the readout
'step': CInt = 1 # Minimum step to increment the value (ignored by some views)
'style': Instance = None
'value': CInt = 0 # Int value
```

### Jupyter.IntText

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'IntTextModel'
'_view_name': Unicode = 'IntTextView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'value': CInt = 0 # Int value
```

### Jupyter.Label

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'LabelModel'
'_view_name': Unicode = 'LabelView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'placeholder': Unicode = '\u200b' # Placeholder text to display when nothing has been typed
'value': Unicode = '' # String value
```

### Jupyter.Play

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'PlayModel'
'_playing': Bool = False
'_view_name': Unicode = 'PlayView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'interval': CInt = 100
'layout': LayoutTraitType = None
'max': CInt = 100 # Max value
'min': CInt = 0 # Min value
'step': CInt = 1 # Minimum step to increment the value (ignored by some views)
'value': CInt = 0 # Int value
```

### Jupyter.ProgressStyle

```
'_model_name': Unicode = 'ProgressStyleModel'
'_view_name': Unicode = 'StyleView'
'bar_color': Color = None
```

### Jupyter.RadioButtons

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'RadioButtonsModel'
'_options_labels': Tuple = ()
'_view_name': Unicode = 'RadioButtonsView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'value': Any = None # Selected value
```

### Jupyter.Select

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'SelectModel'
'_options_labels': Tuple = ()
'_view_name': Unicode = 'SelectView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'value': Any = None # Selected value
```

### Jupyter.SelectMultiple

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'SelectMultipleModel'
'_options_labels': Tuple = ()
'_view_name': Unicode = 'SelectMultipleView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'value': Tuple = () # Selected values
```

### Jupyter.SelectionSlider

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'SelectionSliderModel'
'_options_labels': Tuple = ()
'_view_name': Unicode = 'SelectionSliderView'
'continuous_update': Bool = True # Update the value of the widget as the user is holding the slider.
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'orientation': CaselessStrEnum = 'horizontal' # Vertical or horizontal.
'readout': Bool = True # Display the current selected label next to the slider
'value': Any = None # Selected value
```

### Jupyter.SliderStyle

```
'_model_name': Unicode = 'SliderStyleModel'
'_view_name': Unicode = 'StyleView'
'handle_color': Color = None
```

### Jupyter.Tab

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'TabModel'
'_titles': Dict = {} # Titles of the pages
'_view_name': Unicode = 'TabView'
'box_style': CaselessStrEnum = '' # Use a predefined styling for the box.
'children': Tuple = ()
'layout': LayoutTraitType = None
'selected_index': CInt = 0
```

### Jupyter.Text

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'TextModel'
'_view_name': Unicode = 'TextView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'placeholder': Unicode = '\u200b' # Placeholder text to display when nothing has been typed
'value': Unicode = '' # String value
```

### Jupyter.Textarea

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'TextareaModel'
'_view_name': Unicode = 'TextareaView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'layout': LayoutTraitType = None
'placeholder': Unicode = '\u200b' # Placeholder text to display when nothing has been typed
'rows': Int = None
'value': Unicode = '' # String value
```

### Jupyter.ToggleButton

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'ToggleButtonModel'
'_view_name': Unicode = 'ToggleButtonView'
'button_style': CaselessStrEnum = '' # Use a predefined styling for the button.
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes.
'icon': Unicode = '' # Font-awesome icon.
'layout': LayoutTraitType = None
'tooltip': Unicode = '' # Tooltip caption of the toggle button.
'value': Bool = False # Bool value
```

### Jupyter.ToggleButtons

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'ToggleButtonsModel'
'_options_labels': Tuple = ()
'_view_name': Unicode = 'ToggleButtonsView'
'button_style': CaselessStrEnum = '' # Use a predefined styling for
        the buttons.
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes
'icons': List = []
'layout': LayoutTraitType = None
'tooltips': List = []
'value': Any = None # Selected value
```

### Jupyter.VBox

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'VBoxModel'
'_view_name': Unicode = 'VBoxView'
'box_style': CaselessStrEnum = '' # Use a predefined styling for the box.
'children': Tuple = ()
'layout': LayoutTraitType = None
```

### Jupyter.Valid

```
'_dom_classes': Tuple = () # DOM classes applied to widget.$el.
'_model_name': Unicode = 'ValidModel'
'_view_name': Unicode = 'ValidView'
'description': Unicode = '' # Description of the control.
'disabled': Bool = False # Enable or disable user changes.
'layout': LayoutTraitType = None
'readout': Unicode = 'Invalid' # Message displayed when the value is False
'value': Bool = False # Bool value
```