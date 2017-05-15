# sourced from https://github.com/rmorshea/spectate

# The MIT License (MIT)

# Copyright (c) 2016 Ryan S. Morshead

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.


import re
import six
import types
import inspect
from traitlets.utils.bunch import Bunch


def getargspec(func):
    if isinstance(func, types.FunctionType) or isinstance(func, types.MethodType):
        return inspect.getargspec(func)
    else:
        # no signature introspection is available for this type
        return inspect.ArgSpec(None, 'args', 'kwargs', None)


class Spectator(object):

    def __init__(self, subclass):
        self.subclass = subclass
        self._callback_registry = {}

    def callback(self, name, before=None, after=None):
        if isinstance(name, (list, tuple)):
            for name in name:
                self.callback(name, before, after)
        else:
            if not isinstance(getattr(self.subclass, name), MethodSpectator):
                raise ValueError("No method specator for '%s'" % name)
            if before is None and after is None:
                raise ValueError("No pre or post '%s' callbacks were given" % name)
            elif ((before is not None and not callable(before))
                or (after is not None and not callable(after))):
                raise ValueError("Expected a callables")

            if name in self._callback_registry:
                l = self._callback_registry[name]
            else:
                l = []
                self._callback_registry[name] = l
            l.append((before, after))

    def remove_callback(self, name, before=None, after=None):
        if isinstance(name, (list, tuple)):
            for name in name:
                self.remove_callback(name, before, after)
        else:
            if name in self._callback_registry:
                l = self._callback_registry[name]
            else:
                l = []
                self._callback_registry[name] = l
            l.remove((before, after))
            if len(l) == 0:
                # cleanup if all callbacks are gone
                del self._callback_registry[name]

    def wrapper(self, name, args, kwargs):
        """A callback made prior to calling the given base method

        Parameters
        ----------
        name: str
            The name of the method that will be called
        args: tuple
            The arguments that will be passed to the base method
        kwargs: dict
            The keyword args that will be passed to the base method
        """
        if name in self._callback_registry:
            beforebacks, afterbacks = zip(*self._callback_registry.get(name, []))

            hold = []
            for b in beforebacks:
                if b is not None:
                    call = Bunch(name=name,
                        kwargs=kwargs.copy(),
                        args=args[1:])
                    v = b(args[0], call)
                else:
                    v = None
                hold.append(v)

            out = getattr(self.subclass, name).basemethod(*args, **kwargs)

            for a, bval in zip(afterbacks, hold):
                if a is not None:
                    a(args[0], Bunch(before=bval,
                        name=name, value=out))
                elif callable(bval):
                    # the beforeback's return value was an
                    # afterback that expects to be called
                    bval(out)
            return out
        else:
            return getattr(self.subclass, name).basemethod(*args, **kwargs)


class MethodSpectator(object):

    _compile_count = 0
    _src_str = """def {name}({signature}):
    args, vargs, kwargs = {args}, {varargs}, {keywords};
    return globals()["spectator"].wrapper('{name}', (args + vargs), kwargs)"""

    def __init__(self, base, name):
        self.name = name
        self.base = base
        aspec = getargspec(self.basemethod)
        self.defaults = aspec.defaults
        self.code, self.defaults = self._code(aspec)
    
    @property
    def basemethod(self):
        return getattr(self.base, self.name)

    def _code(self, aspec):
        args = str(aspec.args or ())[1:-1].replace("'", "")
        signature = args + (", " if aspec.args else "")
        if args:
            args = args.join(("(", ",)"))
        if aspec.varargs is not None:
            signature += '*' + aspec.varargs + ', '
        if aspec.keywords is not None:
            signature += '**' + aspec.keywords
        if signature.endswith(', '):
            signature = signature[:-2]

        src = self._src_str.format(name=self.name,
            signature=signature, args=args or (),
            varargs=aspec.varargs or (),
            keywords=aspec.keywords or {})
        name = re.findall('[A-Z][a-z]*', type(self).__name__)
        filename = "-".join(name).upper() + "-#%s"
        code = compile(src, filename % self._compile_count, 'single')
        type(self)._compile_count += 1
        return code, aspec.defaults

    def new_wrapper(self, inst, spectator):
        evaldict = {"spectator": spectator}
        eval(self.code, evaldict)
        # extract wrapper by name
        new = evaldict[self.name]
        # assign docstring and defaults
        new.__doc__ = self.basemethod.__doc__
        new.__defaults__ = self.defaults
        return types.MethodType(new, inst)

    def __get__(self, inst, cls):
        if inst is None:
            return self
        elif getattr(inst, "_instance_spectator", None):
            return self.new_wrapper(inst, inst._instance_spectator)
        else:
            return types.MethodType(self.basemethod, inst)


class WatchableType(object):
    """A base class for introspection"""
    pass


def expose_as(name, base, *methods):
    return expose(base, *methods, name=name)


def expose(base, *methods, **kwargs):
    classdict = {}
    for method in methods:
        if not hasattr(base, method):
            raise AttributeError("Cannot expose '%s', because '%s' "
                "instances lack this method" % (method, base.__name__))
        else:
            classdict[method] = MethodSpectator(base, method)
    name = kwargs.get("name") or base.__name__
    return type(name, (base, WatchableType), classdict)


def watchable(value):
    check = issubclass if inspect.isclass(value) else isinstance
    return check(value, WatchableType)


def watch(value, *args, **kwargs):
    if inspect.isclass(value):
        value = value(*args, **kwargs)
        return value, watch(value)
    if isinstance(value, WatchableType):
        wtype = type(value)
    else:
        raise TypeError("Expected a WatchableType, not %r." % value)
    spectator = getattr(value, "_instance_spectator", None)
    if not isinstance(spectator, Spectator):
        spectator = Spectator(wtype)
        value._instance_spectator = spectator
    return spectator


def unwatch(value):
    if not isinstance(value, WatchableType):
        raise TypeError("Expected a WatchableType, not %r." % value)
    spectator = watcher(value)
    try:
        del value._instance_spectator
    except:
        pass
    return spectator


def watcher(value):
    if not isinstance(value, WatchableType):
        raise TypeError("Expected a WatchableType, not %r." % value)
    return getattr(value, "_instance_spectator", None)
