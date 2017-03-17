# Widget messaging protocol

A Jupyter widget has both a frontend and kernel object communicating with each other using the `comm` messages provided by the Jupyter kernel messaging protocol. The primary communication that happens is synchronizing widget state, represented in the messages by a dictionary of key-value pairs. The Jupyter widget messaging protocol covers `comm` messages for the following actions:

- creating a companion Jupyter widget object through opening a `comm`
- synchronizing widget state between the frontend and the kernel companion objects
- sending custom messages between these objects

For more details on the `comm` infrastructure, see the [Custom messages section](http://jupyter-client.readthedocs.io/en/latest/messaging.html#custom-messages) of the Jupyter kernel message specification.

Throughout this document, relevant parts of messages to the discussion are quoted, and fields irrelevant to the discussion are not displayed.

## Implementating the Jupyter widgets protocol in the kernel

Jupyter widget libraries built upon ipywidgets tend to have a large part their code-base in JavaScript, since this is where the logic for rendering widgets resides. The Python side is usually an observable object holding the widget model attributes.

In this section, we concentrate on implementing the Jupyter widget messaging protocol in the kernel.

### The `jupyter.widget.version` comm target

A kernel-side Jupyter widgets library defines a `jupyter.widget.version` comm target, which is for communicating version information between the frontend and the kernel. When a frontend initializes a Jupyter widget extension (for example, when a notebook is opened), the frontend sends the kernel a `comm_open` message to the `jupyter.widget.version` comm target:

```
{
  'comm_id': 'u-u-i-d',
  'target_name': 'jupyter.widget.version'
}
```

The kernel should immediately send a message on the opened comm channel containing the semver range for the frontend version of jupyter-js-widgets that it expects:

```
{
  'comm_id': 'u-u-i-d',
  'data': {
    'version': '~2.1.0'
  }
}
```

The frontend then replies with a message on the comm channel giving the validation status and the frontend version:

```
{
  'comm_id': 'u-u-i-d',
  'data': {
    'frontend_version: '2.1.4',
    'validated': true
  }
}
```

### The `jupyter.widget` comm target

A kernel-side Jupyter widgets library also defines a `jupyter.widget` comm target, by which widget comm channels are created (one per widget instance). State synchronization and custom messages for a particular widget instance are then sent over the created comm channel.

### Instatiating a widget object

When a widget is instantiated in either the kernel or the frontend, it creates a companion object on the other side by sending a `comm_open` message to the `jupyter.widget` comm target.

#### Reception of a `comm_open` message from the frontend

When a frontend creates a Jupyter widget, it sends a `comm_open` message to the kernel:

```
{
  'comm_id' : 'u-u-i-d',
  'target_name' : 'jupyter.widget',
  'data' : {
    'widget_class': 'some.string'
  }
}
```

The type of widget to be instantiated is given in the `widget_class` string.

In the ipywidgets implementation, this string is actually the key in a registry of widget types. In the ipywidgets implementation, widget types are registered in the dictionary with the `register` decorator. For example the integral progress bar class is registered with `@register('Jupyter.IntProgress')`. When the `widget_class` is not in the registry, it is parsed as a `module` `+` `class` string.

#### Sending a `comm_open` message upon instantiation of a widget

Symmetrically, when instantiating a widget in the kernel, a `comm_open` message is sent to the frontend:

```
{
  'comm_id' : 'u-u-i-d',
  'target_name' : 'jupyter.widget',
  'data' : {
    <dictionary of widget state>
  }
}
```

The type of widget to be instantiated in the frontend is determined by the `_model_name`, `_model_module` and `_model_module_version` keys in the state, which respectively stand for the name of the class that must be instantiated in the frontend, the JavaScript module where this class is defined, and a semver range for that module. See the [Model State](modelstate.md) documentation for the serialized state for core Jupyter widgets.

### State synchronization

#### Synchronizing from kernel to frontend: `update`

When a widget's state changes in the kernel, the changed state keys and values are sent to the frontend over the widget's comm channel using an `update` message:

```
{
  'comm_id' : 'u-u-i-d',
  'data' : {
    'method': 'update',
    'state': { <dictionary of widget state> },
    'buffers': [ <optional list of state keys corresponding to binary buffers in the message> ]
  }
}
```

The state update is split between values that are serializable with JSON (in the `data.state` dictionary), and binary values (represented in `data.buffers`).

The `data.state` value is a dictionary of widget state keys and values that can be serialized to JSON.

Comm messages for state synchronization may contain binary buffers. The `data.buffers` optional value contains a list of keys corresponding to the binary buffers. For example, if `data.buffers` is `['x', 'y']`, then the first binary buffer is the value of the `'x'` state attribute and the second binary buffer is the value of the `'y'` state attribute.

See the [Model state](modelstate.md) documentation for the attributes of core Jupyter widgets.

#### Synchronizing from frontend to kernel: `backbone`

When a widget's state changes in the frontend, the changed keys are sent to the frontend over the widget's comm channel using a `backbone` message:

```
{
  'comm_id' : 'u-u-i-d',
  'data' : {
    'method': 'backbone',
    'sync_data': { <dictionary of widget state> }
    'buffer_keys': [ <optional list of state keys corresponding to binary buffers in the message> ]
  }
}
```

The state update is split between values that are serializable with JSON (in the `data.sync_data` dictionary), and binary values (represented in `data.buffer_keys`).

The `data.sync_data` value is a dictionary of widget state keys and values that can be serialized to JSON.

Comm messages for state synchronization may contain binary buffers. The `data.buffer_keys` optional value contains a list of keys corresponding to the binary buffers. For example, if `data.buffer_keys` is `['x', 'y']`, then the first binary buffer is the value of the `'x'` state attribute and the second binary buffer is the value of the `'y'` state attribute.

#### State requests: `request_state`

When a frontend wants to request the full state of a widget, the frontend sends a `request_state` message:

```
{
  'comm_id' : 'u-u-i-d',
  'data' : {
    'method': 'request_state'
  }
}
```

The kernel side of the widget should immediately send an `update` message with the entire widget state.

### Custom messages: `custom`

Widgets may also send custom comm messages to their counterpart.

```
{
  'comm_id': 'u-u-i-d',
  'data': {
    'method': 'custom',
    'content': <the specified content>,
  }
}
```

In the Python Jupyter widgets implementation, the `Widget.send(content, buffers=None)` method will produce a message of this form.

### Displaying widgets

TODO: document the display_data message to send to display widgets

(Note also the comm message to display messages in the old notebook)