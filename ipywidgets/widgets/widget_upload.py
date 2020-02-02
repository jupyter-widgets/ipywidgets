# Copyright(c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""FileUpload class.

Represents a file upload button.
"""
import datetime as dt

from traitlets import (
    observe, default, Unicode, Dict, List, Int, Bool, Bytes, CaselessStrEnum
)

from .widget_description import DescriptionWidget
from .valuewidget import ValueWidget
from .widget_core import CoreWidget
from .widget_button import ButtonStyle
from .widget import register, widget_serialization
from .trait_types import InstanceDict
from traitlets.utils.bunch import Bunch


def _deserialize_single_file(js):
    uploaded_file = Bunch()
    for attribute in ['name', 'type', 'size', 'content']:
        uploaded_file[attribute] = js[attribute]
    uploaded_file['last_modified'] = dt.datetime.fromtimestamp(
        js['lastModified'] / 1000,
        tz=dt.timezone.utc
    )
    return uploaded_file


def _deserialize_value(js, _):
    return [_deserialize_single_file(entry) for entry in js]


def _serialize_single_file(uploaded_file):
    js = {}
    for attribute in ['name', 'type', 'size', 'content']:
        js[attribute] = uploaded_file[attribute]
    js['lastModified'] = int(uploaded_file['last_modified'].timestamp() * 1000)
    return js


def _serialize_value(value, _):
    return [_serialize_single_file(entry) for entry in value]


_value_serialization = {
    'from_json': _deserialize_value,
    'to_json': _serialize_value
}


@register
class FileUpload(DescriptionWidget, ValueWidget, CoreWidget):
    """
    Upload file(s) from browser to Python kernel as bytes
    """
    _model_name = Unicode('FileUploadModel').tag(sync=True)
    _view_name = Unicode('FileUploadView').tag(sync=True)

    accept = Unicode(help='File types to accept, empty string for all').tag(sync=True)
    multiple = Bool(help='If True, allow for multiple files upload').tag(sync=True)
    disabled = Bool(help='Enable or disable button').tag(sync=True)
    icon = Unicode('upload', help="Font-awesome icon name, without the 'fa-' prefix.").tag(sync=True)
    button_style = CaselessStrEnum(
        values=['primary', 'success', 'info', 'warning', 'danger', ''], default_value='',
        help="""Use a predefined styling for the button.""").tag(sync=True)
    style = InstanceDict(ButtonStyle).tag(sync=True, **widget_serialization)
    error = Unicode(help='Error message').tag(sync=True)
    value = List(Dict(), help="The file upload value").tag(
        sync=True, **_value_serialization)

    @default('description')
    def _default_description(self):
        return 'Upload'
