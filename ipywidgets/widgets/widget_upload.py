# Copyright(c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""FileUpload class.

Represents a file upload button.
"""

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


def _upload_single_value_from_json(js):
    entry = Bunch()
    for attribute in ["name", "type", "size", "content"]:
        entry[attribute] = js[attribute]
    entry["last_modified"] = js["lastModified"]
    return entry


def _upload_value_from_json(js, manager):
    return [_upload_single_value_from_json(entry) for entry in js]


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
        sync=True, from_json=_upload_value_from_json)

    @default('description')
    def _default_description(self):
        return 'Upload'
