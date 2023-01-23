# Widget messaging protocol, version 1

This is implemented in ipywidgets 6.0.

A Jupyter widget has both a frontend and kernel object communicating with each other using the `comm` messages provided by the Jupyter kernel messaging protocol. The primary communication that happens is synchronizing widget state, represented in the messages by a dictionary of key-value pairs. The Jupyter widget messaging protocol covers `comm` messages for the following actions:

- creating a companion Jupyter widget object through opening a `comm`
- synchronizing widget state between the frontend and the kernel companion objects
- sending custom messages between these objects
- displaying a widget

For more details on the `comm` infrastructure, see the [Custom messages section](http://jupyter-client.readthedocs.io/en/latest/messaging.html#custom-messages) of the Jupyter kernel message specification.

Throughout this document, relevant parts of messages to the discussion are quoted, and fields irrelevant to the discussion are not displayed.

## Implementing the Jupyter widgets protocol in the kernel

In this section, we concentrate on implementing the Jupyter widget messaging protocol in the kernel.

### The `jupyter.widget.version` comm target

A kernel-side Jupyter widgets library registers the `jupyter.widget.version` comm target for communicating version information between the frontend and the kernel. When a frontend initializes a Jupyter widgets extension (for example, when a notebook is opened), the frontend widgets extension sends the kernel a `comm_open` message to the `jupyter.widget.version` comm target:

```
{
  'comm_id': 'u-u-i-d',
  'target_name': 'jupyter.widget.version'
}
```

The kernel widgets implementation should immediately send a message on the opened comm channel containing the semver range of the frontend version of jupyter-js-widgets that it expects to communicate with:

```
{
  'comm_id': 'u-u-i-d',
  'data': {
    'version': '~2.1.0'
  }
}
```

The frontend widgets extension then compares the expected semver range with the actual version number and replies with a message on the comm channel giving the validation status and the frontend widgets extension version:

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

A kernel-side Jupyter widgets library also registers a `jupyter.widget` comm target for created creating widget comm channels (one per widget instance). State synchronization and custom messages for a particular widget instance are then sent over the created widget comm channel.

### Instantiating a widget object

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

Symmetrically, when instantiating a widget in the kernel, the kernel widgets library sends a `comm_open` message to the frontend:

```
{
  'comm_id' : 'u-u-i-d',
  'target_name' : 'jupyter.widget',
  'data' : {
    <dictionary of widget state>
  }
}
```

The type of widget to be instantiated in the frontend is determined by the `_model_name`, `_model_module` and `_model_module_version` keys in the state, which respectively stand for the name of the class that must be instantiated in the frontend, the JavaScript module where this class is defined, and a semver range for that module. See the [Model State](jupyterwidgetmodels.v6.md) documentation for the serialized state for core Jupyter widgets.

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

Comm messages for state synchronization may contain binary buffers. The optional `data.buffers` value contains a list of keys corresponding to the binary buffers. For example, if `data.buffers` is `['x', 'y']`, then the first binary buffer is the value of the `'x'` state attribute and the second binary buffer is the value of the `'y'` state attribute.

See the [Model state](jupyterwidgetmodels.v6.md) documentation for the attributes of core Jupyter widgets.

#### Synchronizing from frontend to kernel: `backbone`

When a widget's state changes in the frontend, the changed keys are sent to the kernel over the widget's comm channel using a `backbone` message:

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

In the ipywidgets implementation, the `Widget.send(content, buffers=None)` method will produce these messages.

### Displaying widgets

To display a widget in the classic Jupyter notebook, the kernel sends a `display` comm message to the frontend on the widget's comm channel:

```
{
  'comm_id': 'u-u-i-d',
  'data': {
    'method': 'display'
  }
}
```

To display a widget in JupyterLab, the kernel sends a Jupyter [iopub `display_data` message](http://jupyter-client.readthedocs.io/en/latest/messaging.html#display-data) with a special mimetype (where the `model_id` is the widget's comm channel id):

```
{
  'data': {
    'application/vnd.jupyter.widget-view+json': {
      'model_id': 'u-u-i-d'
    }
  }
}
```

In order to display widgets in both the classic notebook and JupyterLab, ipywidgets sends both the `display` comm message and the iopub `display_data` message, and omits the `text/plain` mimetype from the `display_data` message (so the classic notebook will not show any output from the iopub message).

# Widget messaging protocol, version 2

This is implemented in ipywidgets 7.0.

A Jupyter widget has both a frontend and kernel object communicating with each other using the `comm` messages provided by the Jupyter kernel messaging protocol. The primary communication that happens is synchronizing widget state, represented in the messages by a dictionary of key-value pairs. The Jupyter widget messaging protocol covers `comm` messages for the following actions:

- creating a companion Jupyter widget object through opening a `comm`
- synchronizing widget state between the frontend and the kernel companion objects
- sending custom messages between these objects
- displaying a widget

For more details on the `comm` infrastructure, see the [Custom messages section](http://jupyter-client.readthedocs.io/en/latest/messaging.html#custom-messages) of the Jupyter kernel message specification.

Throughout this document, relevant parts of messages to the discussion are quoted, and fields irrelevant to the discussion are not displayed.

## Highlights of changes from version 1

The `jupyter.widget.version` comm target and associated version validation messages are gone. Instead, it is up to the package maintainers to ensure that the versions of the packages speak the same widget message protocol. We encourage kernel and frontend package developers to clearly indicate which protocol version the package supports.

While in version 1, binary buffers could only be top level attributes of the `state` object, now any item in the state can be a binary buffer. All binary buffers that are a descendant of the state object (in a nested object or list) will be removed from an object or replaced by null in a list. The 'path' of each binary buffer and its data are sent separately, so the state object can be reconstructed on the other side of the wire. This change was necessary to allow sending the data for a binary array plus its metadata (shape, type, masks) in one attribute.

The sync update event from the frontend to the kernel was restructured to have the same field names as the event from the kernel to the frontend, namely the method field is `'update'` and the state data is in the `state` attribute.

Widgets are displayed via `display_data` messages, which now include the version of the schema.

The `msg_throttle` attribute of models is removed.

## Widget state

The core idea of widgets is that some state is automatically synced back and forth between a kernel object and a frontend object. Several fields are assumed to be in every state object:

- `_model_module`: the model module
- `_model_module_version`: the semver range of the model
- `_model_name`: the name of the model
- `_view_module`: the view module
- `_view_module_version`: the semver range of the view
- `_view_name`: the name of the view

These fields are assumed immutable (set at initialization, and never changed).

## Implementing the Jupyter widgets protocol in the kernel

In this section, we concentrate on implementing the Jupyter widget messaging protocol in the kernel.

### The `jupyter.widget` comm target

A kernel-side Jupyter widgets library registers a `jupyter.widget` comm target for creating widget comm channels (one per widget instance). State synchronization and custom messages for a particular widget instance are then sent over the created widget comm channel.

### Instantiating a widget object

When a widget is instantiated in either the kernel or the frontend, it creates a companion model on the other side by sending a `comm_open` message to the `jupyter.widget` comm target. The `comm_open` message's metadata gives the version of the widget messaging protocol, i.e., `{'version': '2.0.0'}`.

```
{
  'comm_id' : 'u-u-i-d',
  'target_name' : 'jupyter.widget',
  'data' : {
    'state': { <dictionary of widget state> },
    'buffer_paths': [ <list with paths corresponding to the binary buffers> ]
  }
}
```

The model instantiated on the other side is determined by the `_model_module`, and `_model_module_version`, `_model_name`, `_view_module`, `_view_module_version`, and `_view_name` keys in `data.state`. Any unspecified keys will be take on the default values given in the relevant model specification.

The `data.state` value is a dictionary of widget state keys and values that can be serialized to JSON.

Comm messages for state synchronization may contain binary buffers. The `data.buffer_paths` value contains a list of 'paths' in the `data.state` object corresponding to the binary buffers. For example, if `data.buffer_paths` is `[['x'], ['y', 'z', 0]]`, then the first binary buffer is the value of the `data.state['x']` attribute and the second binary buffer is the value of the `data.state['y']['z'][0]` state attribute. A path representing a list value (i.e., last index of the path is an integer) will be `null` in `data.state`, and a path representing a dictionary key (i.e., last index of the path is a string) will not exist in `data.state`.

See the [Model State](jupyterwidgetmodels.latest.md) documentation for the serialized state for core Jupyter widgets.

### State synchronization

#### Synchronizing widget state: `update`

When a widget's state changes in either the kernel or the frontend, the changed state keys and values are sent to the other side over the widget's comm channel using an `update` message:

```
{
  'comm_id' : 'u-u-i-d',
  'data' : {
    'method': 'update',
    'state': { <dictionary of widget state> },
    'buffer_paths': [ <list with paths corresponding to the binary buffers> ]
  }
}
```

The `data.state` and `data.buffer_paths` values are the same as in the `comm_open` case.

See the [Model state](jupyterwidgetmodels.latest.md) documentation for the attributes of core Jupyter widgets.

#### Synchronizing multiple frontends: `echo_update`

Starting with protocol version `2.1.0`, `echo_update` messages from the kernel to the frontend are optional update messages for echoing state in messages from a frontend to the kernel back out to all the frontends.

```
{
  'comm_id' : 'u-u-i-d',
  'data' : {
    'method': 'echo_update',
    'state': { <dictionary of widget state> },
    'buffer_paths': [ <list with paths corresponding to the binary buffers> ]
  }
}
```

The Jupyter comm protocol is asymmetric in how messages flow: messages flow from a single frontend to a single kernel, but messages are broadcast from the kernel to _all_ frontends. In the widget protocol, if a frontend updates the value of a widget, the frontend does not have a way to directly notify other frontends about the state update. The `echo_update` optional messages enable a kernel to broadcast out frontend updates to all frontends. This can also help resolve the race condition where the kernel and a frontend simultaneously send updates to each other since the frontend now knows the order of kernel updates.

The `echo_update` messages enable a frontend to optimistically update its widget views to reflect its own changes that it knows the kernel will yet process. These messages are intended to be used as follows:

1. A frontend model attribute is updated, and the frontend views are optimistically updated to reflect the attribute.
2. The frontend queues an update message to the kernel and records the message id for the attribute.
3. The frontend ignores updates to the attribute from the kernel contained in `echo_update` messages until it gets an `echo_update` message corresponding to its own update of the attribute (i.e., the [parent_header](https://jupyter-client.readthedocs.io/en/latest/messaging.html#parent-header) id matches the stored message id for the attribute). It also ignores `echo_update` updates if it has a pending attribute update to send to the kernel. Once the frontend receives its own `echo_update` and does not have any more pending attribute updates to send to the kernel, it starts applying attribute updates from `echo_update` messages.

Since the `echo_update` update messages are optional, and not all attribute updates may be echoed, it is important that only `echo_update` updates are ignored in the last step above, and `update` message updates are always applied.

Implementation note: For attributes where sending back an `echo_update` is considered too expensive or unnecessary, we have implemented an opt-out mechanism in the ipywidgets package. A model trait can have the `echo_update` metadata attribute set to `False` to flag that the kernel should never send an `echo_update` update for that attribute to the frontends. Additionally, we have a system-wide flag to disable echoing for all attributes via the environment variable `JUPYTER_WIDGETS_ECHO`. For ipywdgets 7.7, we default `JUPYTER_WIDGETS_ECHO` to off (disabling all echo messages) and in ipywidgets 8.0 we default `JUPYTER_WIDGETS_ECHO` to on (enabling echo messages).

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

In the ipywidgets implementation, the `Widget.send(content, buffers=None)` method will produce these messages.

### Displaying widgets

To display a widget, the kernel sends a Jupyter [iopub `display_data` message](http://jupyter-client.readthedocs.io/en/latest/messaging.html#display-data) with the `application/vnd.jupyter.widget-view+json` mimetype. In this message, the `model_id` is the comm channel id of the widget to display.

```
{
  'data': {
    'application/vnd.jupyter.widget-view+json': {
      'model_id': 'u-u-i-d'
      'version_major': 2
      'version_minor': 0
    }
  }
}
```

# Control Widget messaging protocol, version 1.0

This is implemented in ipywidgets 7.7.

### The `jupyter.widget.control` comm target

A kernel-side Jupyter widgets library may optionally register a `jupyter.widget.control` comm target that is used for fetching all kernel widget state through a single comm message.

#### State requests: `request_states`

When a frontend wants to request the full state of all widgets from the kernel in a single message, the frontend sends a `request_states` message through the `jupyter.widget.control` comm channel:

```
{
  'comm_id' : 'u-u-i-d',
  'data' : {
    'method': 'request_states'
  }
}
```

The kernel handler for the `jupyter.widget.control` comm target should immediately send an `update_states` message with all widgets states:

```
{
  'comm_id' : 'u-u-i-d',
  'data' : {
    'method': 'update_states',
    'states': {
      <widget1 u-u-i-d>: <widget1 state>,
      <widget2 u-u-i-d>: <widget2 state>,
      [...]
    },
    'buffer_paths': [ <list with paths corresponding to the binary buffers> ]
  }
}
```

Comm messages for state synchronization may contain binary buffers. The `data.buffer_paths` value contains a list of 'paths' in the `data.states` object corresponding to the binary buffers. For example, if `data.buffer_paths` is `[['widget-id1', 'x'], ['widget-id2', 'y', 'z', 0]]`, then the first binary buffer is the value of the `data.states['widget-id1']['x']` attribute and the second binary buffer is the value of the `data.states['widget-id2']['y']['z'][0]` state attribute. A path representing a list value (i.e., last index of the path is an integer) will have a `null` placeholder in the list in `data.states`, and a path representing a value for a dictionary key (i.e., last index of the path is a string) will not exist in the dictionary in `data.states`.

Since the `update_states` message may be very large, it may be dropped in the communication channel (for example, the message may exceed the websocket message limit size). For that reason, we suggest that frontends fall back to other ways to retrieve state from the kernel if they do not get an `update_states` reply in a reasonable amount of time.
