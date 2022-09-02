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
def _external_stacklevel(internal):
    """Find the first frame that doesn't any of the given internal strings

    The depth will be 1 at minimum in order to start checking at the caller of
    the function that called this utility method.
    """
    # Get the level of my caller's caller
    level = 2
    frame = sys._getframe(level)
    while frame and any(s in frame.f_code.co_filename for s in internal):
        level +=1
        frame = frame.f_back
    # the returned value will be used one level up from here, so subtract one
    return level-1

def deprecation(message, internal=None):
    """Generate a deprecation warning targeting the first frame outside the ipywidgets library.
    
    internal is a list of strings, which if they appear in filenames in the
    frames, the frames will also be considered internal. This can be useful if we know that ipywidgets
    is calling out to, for example, traitlets internally.
    """
    if internal is None:
        internal = []
    warnings.warn(message, DeprecationWarning, stacklevel=_external_stacklevel(internal+['ipywidgets/widgets/']))
