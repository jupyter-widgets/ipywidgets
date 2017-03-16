# Widget messaging protocol

The protocol for

- instantiating jupyter widgets
- synchronizing widget state between the front-end and the back-end companion objects
- sending custom messages between these objects

Is entirely based upon the `Comm` section of the Jupyter kernel protocol.

For more details on comms *per se*, we refer to the [relevant section of the specification for the Jupyter kernel protocol](http://jupyter-client.readthedocs.io/en/latest/messaging.html).

## Implementation of a backend for the Jupyter widgets protocol.

Jupyter widget libraries built upon ipywidgets tend to have a large part their code-base in JavaScript, since this is where the logic for drawing and rendering widgets resides. The Python side mostly consists in a declaration of the widget model attributes.

A byproduct of the *thin backend* of widget libraries is that once the widget protocol is implemented for another kernel, all the widgets and custom widget libraries can be reused in that language.

Therefore, in this documentation, we concentrate on the viewpoint of a kernel author implementing a jupyter widget backend.

### The `jupyter.widget` comm target

Jupyter interactive widgets define two `comm` targets

 - `jupyter.widget`
 - `jupyter.widget.version`
 
The first one is the target handling all the widget state synchronization as well as the custom messages. The other target is meant for a version check between the front-end and the backend, and can be ignored from now.

### Instantiating widgets from the front-end and the backend

#### Reception of a `comm_open` message

Upon reception of the `comm_open` message for target `jupyter.widget`

```python
{
  'comm_id' : 'u-u-i-d',
  'target_name' : 'jupyter.widget',
  'data' : {
      'widget_class': 'some.string'
  }
}
```

The type of widget to be instantiated is determined with the `widget_class` string.

In the python implementation, this string is actually the key in a registry of widget types. In the case where the key is not found, it is parsed as a `module` `+` `class` string.

In the Python implementation of the backend, widget types are registered in the dictionary with the `register` decorator. For example the integral progress bar is registered with `register('Jupyter.IntProgress')`.

#### Emmission of the `comm_open` message upon instantiation of a widget

Symmetrically, when instantiating a widget in the backend, a `comm_open` message is sent to the front-end.

```python
{
  'comm_id' : 'u-u-i-d',
  'target_name' : 'jupyter.widget',
  'data' : {
      '[serialized widget state]'
  }
}
```

The type of widget to be instantiated in the front-end is determined by the `_model_name`, `_model_module` and `_model_module_version` keys in the state, which respectively stand for the name of the class that must be instantiated in the frontend, the javascript module where this class is defined, and a semver range for that module.

#### Sending updates of the state for a widget model

```python
{
  'comm_id' : 'u-u-i-d',
  'data' : {
      'method': 'state',
      'state': '[serialized widget state or portion of the serialized widget sate]',
      'buffers': '[optional list of keys for attributes sent in the form of binary buffers]'
  }
}
```

Comm messages for state synchonization optionally contain a list binary buffers. If this list is not empty, a corresponding list of strings must be provided in the `data` message providing the names for these buffers.

The front-end will unpack these buffer and insert them in the state for the specified keys.

#### Sending custom messages

In the Python implementation, the base widget class provides a means to send raw comm messages directly. `Widget.send(content, buffers=None)` will produce a message of the form

```python
{
  'comm_id' : 'u-u-i-d',
  'data' : {
      'method': 'custom',
      'content': 'the specified content',
      'buffers': 'the provided buffers'
  }
}
```

#### Receiving data synchronization messages

Upon updates of the JavaScript model state, the front-end emits widget state patches messages

```python
{
  'comm_id' : 'u-u-i-d',
  'data' : {
      'method': 'backbone',
      'sync_data': 'the patch to the data',
      'buffers': 'optional buffer names list'
  }
}
```

The `sync_data` contains the serialized state of the changed model attributes in the form of a dictionnary.

Optionally, the message may specify a list of buffer names. When provided, the corresponding binary buffers in the zmq message should be appended in the `sync_data` dictionary with the keys specified in the `buffers` list.

#### State requests

In the case of a front-end connecting to a running kernel where widgets have already been instantiated, it may send a request state message, of the form

```python
{
  'comm_id' : 'u-u-i-d',
  'data' : {
      'method': 'request_state'
  }
}
```

The expected response to that message is a regular `update` message as specified above containining the entirety of the widget model state.