from ._version import version_info, __version__

import os

def state_schema(version):
    """
    """
    with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), version, 'state.schema.json'))
    return

