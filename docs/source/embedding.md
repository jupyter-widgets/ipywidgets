Embedding Jupyter Widgets in Static Webpages
============================================

Jupyter interactive widgets can be serialized and embedded into static web pages.

The notebook interface provides a context menu for generating an HTML snippet that
can be embedded into any static web page:

![embedding](./embed.gif)

The context menu provides two actions

 - Download widget state
 - Embed widgets

Embeddable HTML Snippet
-----------------------

The first option, `Embed widgets`, provides a dialog containing an HTML snippet
which can be used to embed jupyter interactive widgets into any web page.

This HTML snippet is composed of two script tags:

 - The first script tag loads a custom widget manager from the `unpkg` cdn.
 - The second script tag contains the state of all the widget model currently
   in use. It has the mime type `application/vnd.jupyter-embedded-widgets`, and
   the json schema for that script tag is:

   ```json
    {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "description": "Jupyter Interactive Widget State JSON schema.",
        "type": "object",
        "properties" : {
            "version_major" : {
                "description": "Format version (major)",
                "type": "number",
                "minimum": 1,
                "maximum": 1
            },
            "version_minor" : {
                "description": "Format version (minor)",
                "type": "number"
            }
        },
        "additionalProperties": true,
        "additionalProperties" : {
            "type": "object",
            "properties": {
                "model_name": {
                    "description" : "Name of the JavaScript class holding the model implementation",
                    "type": "string"
                },
                "model_module": {
                    "description" : "Name of the JavaScript module holding the model implementation",
                    "type": "string"
                },
                "model_module_version": {
                    "description" : "Semver range for the JavaScript module holding the model implementation",
                    "type": "string"
                },
                "state": {
                    "description" : "Serialized state of the model",
                    "type": "object",
                    "additional_properties": true
                }
            },
            "required": [ "model_name", "model_module", "state" ],
            "additional_properties": true
        }
    }
    ```

Widget State Json
-----------------

The second option, `Download widget state`, triggers the downloading of a json file
containing the serialized state of all the widget models currently in use, corresponding
to the same json schema.
