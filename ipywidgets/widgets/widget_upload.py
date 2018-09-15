# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from .widget_core import CoreWidget
from .widget_description import DescriptionWidget, DescriptionStyle
from .valuewidget import ValueWidget
from .trait_types import TypedTuple
from .widget import register
from traitlets import Unicode, Bool, Dict, List, observe
import base64
import copy
from datetime import datetime

@register()
class FileUpload(DescriptionWidget, ValueWidget, CoreWidget):
    """Upload file from a browser to python

    Parameters
    ----------
    values : Dict
        File object. A file can have the following fields (it will only ever have one of error or contents set):
            name: string
            lastModified: datetime
            type: string
            contents: any
            error: string

    accept : string
        Limit accepted file types. See: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept
    """
    _view_name = Unicode('UploadView').tag(sync=True)
    _model_name = Unicode('UploadModel').tag(sync=True)

    disabled = Bool(False, help="Enable or disable user changes.").tag(sync=True)
    value = Dict().tag(sync=False) # We do not sync as user cannot push data
    loading = Bool(False, help="Show or hide the loading indicator").tag(sync=True)
    # Used for internal transfer. These are then merged into value for users
    _values_base64 = List(help='File content, base64 encoded.').tag(trait=Unicode()).tag(sync=True)
    _metadata = List(help='File metadata').tag(sync=True)

    accept = Unicode(help='Type of files the input accepts. None for all. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept').tag(sync=True)

    def __init__(self, accept='', **kwargs):
        self.accept = accept
        self.loading = False
        super(FileUpload, self).__init__(**kwargs)

    def clear(self):
        _values_base64 = []
        _metadata = []

    @observe('value')
    def _on_value_changed(self, *args):
        # If the user clears, we should too
        if(len(self.value) == 0):
            self.clear()

    def _get_value_from_synced_traits(self):
        """
        Parse data from JS and put into python friendly form
        """
        values = []
        loading = False
        for idx, val in enumerate(self._metadata):
            f = copy.copy(val)
            if 'lastModified' in f:
                f['lastModified'] = datetime.fromtimestamp(f['lastModified']/1000.0)

            if idx < len(self._values_base64) and self._values_base64[idx]:
                f['contents'] = base64.b64decode(self._values_base64[idx].split(',', 1)[1])
            elif not 'error' in f:
                loading = True
            values.append(f)

        return (values, loading)

    def _update_value_and_loading(self):
        values, loading = self._get_value_from_synced_traits()

        self.value = values[0] if len(values) > 0 else {}

        # We do the check here so that the UI shows if the data is in python
        if not loading:
            self.loading = loading


    @observe('_metadata')
    def _on_metadata_changed(self, *args):
        self._update_value_and_loading()

    @observe('_values_base64')
    def _on_files_changed(self, *args):
        self._update_value_and_loading()


@register()
class MultiFileUpload(FileUpload):
    """Upload file from a browser to python

    Parameters
    ----------
    values : TypedTuple
        TypedTuple of file objects (Dict). See FileUpload for more details
    accept : string
        Limit accepted file types. See: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept
    multiple : bool
        Allow for multiple files to be uploaded. Defaults to true, but can reuse this for single file uploads with same API as multiple
    """

    value = TypedTuple(trait=Dict()).tag(sync=False) # We do not sync as user cannot push data
    multiple = Bool(help='If true, allow for multiple input files. Else only accept one').tag(sync=True)

    def __init__(self, accept='', multiple=True, **kwargs):
        self.accept = accept
        self.multiple = multiple
        self.loading = False
        super(FileUpload, self).__init__(**kwargs)

    def _update_value_and_loading(self):
        values, loading = self._get_value_from_synced_traits()

        self.value = values

        # We do the check here so that the UI shows if the data is in python
        if not loading:
            self.loading = loading
