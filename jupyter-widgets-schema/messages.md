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

Jupyter widgets define a `jupyter.widget.version` comm target, which is for communicating version information between the frontend and the kernel. When a frontend initializes a Jupyter widget extension (for example, when a notebook is opened), the frontend sends the kernel a `comm_open` message to the `jupyter.widget.version` comm target:

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

Jupyter interactive widgets create a widget comm channel by sending messages to the `jupyter.widget` comm target. State synchronization and custom messages for a particular widget instance are then sent over the created comm channel.

### Instatiating a widget object

When a widget is instantiated in either the kernel or the frontend, it creates a counterpart object on the other side by sending a `comm_open` message to the `jupyter.widget` comm target.

#### Reception of a `comm_open` message from the frontend

When a frontend creates a Jupyter widget, it sends a `comm_open` message to the kernel:

```python
{
  'comm_id' : 'u-u-i-d',
  'target_name' : 'jupyter.widget',
  'data' : {
      'widget_class': 'some.string'
  }
}
```

The type of widget to be instantiated is given in the `widget_class` string.

In the python implementation, this string is actually the key in a registry of widget types. In the case where the key is not found, it is parsed as a `module` `+` `class` string.

In the Python implementation of the kernel, widget types are registered in the dictionary with the `register` decorator. For example the integral progress bar is registered with `register('Jupyter.IntProgress')`.

TODO: give a list in another document of the core widgets and each widget_class string.

#### Sending a `comm_open` message upon instantiation of a widget

Symmetrically, when instantiating a widget in the kernel, a `comm_open` message is sent to the frontend.

```python
{
  'comm_id' : 'u-u-i-d',
  'target_name' : 'jupyter.widget',
  'data' : {
      <dictionary of widget state>
  }
}
```

The type of widget to be instantiated in the frontend is determined by the `_model_name`, `_model_module` and `_model_module_version` keys in the state, which respectively stand for the name of the class that must be instantiated in the frontend, the JavaScript module where this class is defined, and a semver range for that module. See the [Model State](modelstate.md) documentation for the serialized state for core Jupyter widgets.

### Sending updates of the state for a widget model

Once a widget comm channel is created for a widget instance, state synchronization and custom messages are sent over the comm channel. When a widget's state changes in the kernel, the new state (either the entire state or just the changed keys) is sent to the frontend using a `state` message:

```
{
  'comm_id' : 'u-u-i-d',
  'data' : {
      'method': 'update',
      'state': { <dictionary of widget state> },
      'buffers': [ <optional list of state keys (strings) corresponding to binary buffers in the message> ]
  }
}
```

The `data.state` value is a dictionary of widget attributes and values. See the [Model state](modelstate.md) documentation for the attributes of core Jupyter widgets.

Comm messages for state synchronization may contain binary buffers. The `data.buffers` optional attribute contains a list of keys corresponding to the binary buffers. For example, if `data.buffers` is `['x', 'y']`, then the first binary buffer is the value of the `'x'` state attribute and the second binary buffer is the value of the `'y'` state attribute.

### Sending custom messages

In the Python implementation, the base widget class provides a means to send raw comm messages directly. `Widget.send(content, buffers=None)` will produce a message of the form

```
{
  'comm_id' : 'u-u-i-d',
  'data' : {
      'method': 'custom',
      'content': <the specified content>,
      'buffers': <the provided buffers>
  }
}
```

### Receiving data synchronization messages

Upon updates of the JavaScript model state, the frontend emits widget state patches messages

```python
{
  'comm_id' : 'u-u-i-d',
  'data' : {
      'method': 'backbone',
      'sync_data': 'the patch to the data',
      'buffer_keys': 'optional buffer names list'
  }
}
```

The `sync_data` contains the serialized state of the changed model attributes in the form of a dictionary.

Optionally, the message may specify a list of buffer names. When provided, the corresponding binary buffers in the zmq message should be appended in the `sync_data` dictionary with the keys specified in the `buffer_keys` list.

### State requests

In the case of a frontend connecting to a running kernel where widgets have already been instantiated, it may send a request state message, of the form

```python
{
  'comm_id' : 'u-u-i-d',
  'data' : {
      'method': 'request_state'
  }
}
```

The expected response to that message is a regular `'update'` message as specified above containining the entirety of the widget model state.

## Displaying widgets

TODO: document the display_data message to send to display widgets

(Note also the comm message to display messages in the old notebook)