# Model State

This is a description of the model state for each widget in the core. The model ID of a widget is the comm id the widget holds. A model reference is a string of the form `"IPY_MODEL_<MODEL_ID>"`, where `<MODEL_ID>` is the model ID of a previously created widget.

## Widget

```
"_model_module": "jupyter-js-widgets",
"_model_module_version": "~2.2.0",
"_model_name": string,
"_view_module": "jupyter-js-widgets",
"_view_module_version": "~2.2.0",
"_view_name": string,
"msg_throttle": 1,
```


## DOMWidget(Widget)

```
"_dom_classes": [],
"layout": REFERENCE(LayoutModel),
```

## LabeledDOMWidget(DOMWidget)
```
"description": string
```

## Accordion(LabeledDOMWidget)

```
"_model_name":"AccordionModel"
"_titles":{}
"_view_name":"AccordionView"
"box_style":""
"children":REFERNCE(DOMWidget)[]
"selected_index":0
```

## BoundedFloatText(LabeledDOMWidget)
```
"_model_name":"FloatTextModel",
"_view_name":"FloatTextView",
"disabled":false,
"max":10,
"min":0,
"step":0.1,
"value":7.5,
```


## BoundedIntText(LabeledDOMWidget)

```
"_model_name":"IntTextModel",
"_view_name":"IntTextView",
"disabled":false,
"max":10,
"min":0,
"step":1,
"value":7,
```

## Box(DOMWIdget)

```
"_model_name":"BoxModel",
"_view_name":"BoxView",
"box_style":"",
"children": REFERENCE(DOMWidget)[]
```

## HBox(Box)

```
"_model_name":"HBoxModel",
"_view_name":"HBoxView",
```

## VBox(Box)

```
"_model_name":"VBoxModel",
"_view_name":"VBoxView",
```


## Button(DOMWidget)

```
"_model_name":"ButtonModel",
"_view_name":"ButtonView",
"button_style":"",
"description":"Click me",
"disabled":false,
"icon":"check",
"style": REFERENCE(ButtonStyle),
"tooltip":"Click me",
```


## ButtonStyle

```
"_model_name":"ButtonStyleModel",
"_view_name":"StyleView",
"button_color":null,
"font_weight":"",
```

## Checkbox(LabeledDOMWidget)

```
"_model_name":"CheckboxModel",
"_view_name":"CheckboxView",
"disabled":false,
"value":false,
```

## ColorPicker(LabeledDOMWidget)

```
"_model_name":"ColorPickerModel",
"_view_name":"ColorPickerView",
"concise":false,
"value":"blue",
```
## Controller

```
"_model_name":"ControllerModel",
"_view_name":"ControllerView",
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
"_model_name":"DatePickerModel",
"_view_name":"DatePickerView",
"value":null,
```

## Dropdown(LabeledDOMWidget)

```
"_model_name":"DropdownModel",
"_options_labels": string[],
"_view_name":"DropdownView",
"disabled":false,
"value":"2",
```
## Progress(LabeledDOMWidget)


```
"_model_name":"ProgressModel",
"_view_name":"ProgressView",
"bar_style":"info",
"disabled":false,
"max":10,
"min":0
"orientation":"horizontal",
"step":0.1,
"style": REFERENCE(ProgressStyle),
"value":7.5,
```

## ProgressStyle


```
"_model_name":"ProgressStyleModel",
"_view_name":"StyleView",
"bar_color":null,
```

## FloatRangeSlider(LabeledDOMWidget)

```
"_model_name": "FloatSliderModel",
"_range": true,
"_view_name": "FloatSliderView",
"continuous_update": false,
"disabled": false,
"max": 10.0,
"min": 0.0
"orientation": "horizontal",
"readout": true,
"slider_color": "white",
"step": 0.1,
"value": [5.0, 7.5],
```


## FloatSlider(LabeledDOMWidget)

```
"_model_name": "FloatSliderModel",
"_range": false,
"_view_name": "FloatSliderView",
"continuous_update": false,
"disabled": false,
"max": 10.0,
"min": 0.0
"orientation": "horizontal",
"readout": true,
"readout_format": ".1f",
"slider_color": "white",
"step": 0.1,
"value": 7.5,
```

## FloatText(LabeledDOMWidget)

```
"_model_name":"FloatTextModel",
"_view_name":"FloatTextView",
"disabled":false,
"max":10,
"min":0,
"step":0.1,
"value":7.5,
```

## HTML(LabeledDOMWidget)

```
"_model_name":"HTMLModel",
"_view_name":"HTMLView",
"disabled":false,
"placeholder":"Some HTML",
"value":"Hello <b>World</b>",
```

## HTMLMath(HTML)

```
"_model_name":"HTMLMathModel",
"_view_name":"HTMLMathView",
```

## Image(DOMWidget)

```
"_b64value":"YXNkZg==",
"_model_name":"ImageModel",
"_view_name":"ImageView",
"format":"png",
"height":"400",
"width":"300"}
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
