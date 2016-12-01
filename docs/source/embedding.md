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

This HTML snippet is composed of multiple `<script>` tags:

 - The first script tag loads a custom widget manager from the `unpkg` cdn.
 - The second script tag contains the state of all the widget models currently
   in use. It has the mime type `application/vnd.jupyter.widget-state+json`.

   The json schema for the content of that script tag is:

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
            },
            "state": {
                "description": "Model State for All Widget Models",
                "type": "object",
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
                    "additionalProperties": false
                }
            }
        },
        "required": [ "version_major", "version_minor", "state" ],
        "additionalProperties": false
    }
    ```

- The following script tags correspond to the views which you want to display
  in the web page. They have the mime type `application/vnd.jupyter.widget-view+json`.

  The *Embed Widgets* action currently creates such a tag for each view
  displayed in the notebook at this time.

  The json schema for the content of that script tag is:

    ```json
    {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "description": "Jupyter Interactive Widget View JSON schema.",
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
            },
            "model_id": {
                "description": "Unique identifier of the widget model to be displayed",
                "type": "string"
            },
            "required": [ "model_id" ]
        },
        "additionalProperties": false
    }
    ```

  If you want to lay out these script tags in a custom fashion or only keep
  some of them, you can change their location in the DOM when including the snippet
  into a web page.

Widget State Json
-----------------

The second option, `Download widget state`, triggers the downloading of a json file
containing the serialized state of all the widget models currently in use, corresponding
to the same json schema.
