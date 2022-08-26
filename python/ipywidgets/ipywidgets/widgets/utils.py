# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

import sys
import warnings

# This function is from https://github.com/python/cpython/issues/67998
# (https://bugs.python.org/file39550/deprecated_module_stacklevel.diff) and
# calculates the appropriate stacklevel for deprecations to target the
# deprecation for the caller, no matter how many internal stack frames we have
# added in the process. For example, with the deprecation warning in the
# __init__ below, the appropriate stacklevel will change depending on how deep
# the inheritance hierarchy is.
def external_stacklevel(internal):
    """Find the first frame that doesn't contain any of the given internal strings

    The depth will be 2 at minimum in order to start checking at the caller of
    the function that called this utility method.
    """
    level = 2
    frame = sys._getframe(level)
    while frame and any(s in frame.f_code.co_filename for s in internal):
        level +=1
        frame = frame.f_back
    return level

def deprecation(message, internal=None):
    """Generate a deprecation warning targeting the first external frame
    
    internal is a list of strings, which if they appear in filenames in the
    frames, the frames will also be considered internal.
    """
    if internal is None:
        internal = []
    warnings.warn(message, DeprecationWarning, stacklevel=external_stacklevel(internal+['ipywidgets/widgets/']))
