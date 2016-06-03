# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

""" Utilities related to functions. This version is specific to Python 3. """

import inspect

def parameter_types(func):
    sig = inspect.signature(func)

    types = {}
    for (name, param) in sig.parameters.items():
        tpe = _param_type(param)
        types[name] = tpe

    return types


def required_parameter(func):
    sig = inspect.signature(func)

    required = []
    for (name, param) in sig.parameters.items():
        if not _has_default_val(param):
            required.append(name)

    return required


def _non_empty(val):
    return id(val) != id(inspect._empty)


def _param_type(param):
    # use the type of the default value if present
    if _has_default_val(param):
        return type(param.default)

    # use the annotation if it evaluates to a class
    if _non_empty(param.annotation) and inspect.isclass(param.annotation):
        return param.annotation

    # return NoneType if we cannot determine the type
    return type(None)


def _has_default_val(param):
    return _non_empty(param.default)


def get_default_vals(func):
    sig = inspect.signature(func)

    default = {}
    for (name, param) in sig.parameters.items():
        if _has_default_val(param):
            default.update({name: param.default})

    return default
