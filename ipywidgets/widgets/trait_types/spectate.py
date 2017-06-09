"""
========
Spectate
========

Create classes whose instances have tracked methods

Instalation
-----------
``spectate`` can be installed from GitHub using ``pip``:

.. code:: text
    
    $ pip install git+https://github.com/rmorshea/spectate.git#egg=spectate

Basic Usage
-----------
``spectate`` is useful for remotely tracking how an instance is modified. This means that protocols
for managing updates, don't need to be the outward responsibility of a user, and can instead be
done automagically in the background.

For example, if it were desirable to keep track of element changes in a list, ``spectate`` could be
used to observe ``list.__setitiem__`` in order to be notified when a user sets the value of an element
in the list. To do this, we would first create a ``EventfulList`` using ``watched_type``, and then
store pairs of callbacks to an instance of ``EventfulList`` using its `instance_spectator` attribute.
Each pair is registered by calling the `instance_spectator`'s `callback` method. You can then specify,
with keywords, whether the callback should be triggered ``before``, and/or or ``after`` a given method
is called - hereafter refered to as "beforebacks" and "afterbacks" respectively.

Beforebacks
-----------

+ Have a signature of ``(instance, call)``

    +   ``instance`` is the owner of the method
    +   ``call`` is a ``Bunch`` with the keys:

        + ``'name'`` - the name of the method which was called
        + ``'args'`` - the arguments which that method will call
        + ``'kwargs'`` - the keywords which that method will call

+   Can ``return`` a value which gets passed on to its respective afterback.
+   If an error is encountered:

    +   The wrapper will:

        1. ``return`` the original ``call``
        2. Set the ``'error'`` key in the ``answer`` passed to its afterback.

    +   The base method's call is not obstructed by raised beforebacks.

Afterbacks
----------

+   Have a signature of ``(instance, answer)``

    +   ``instance`` is the owner of the method
    +   ``answer`` is a ``Bunch`` with the keys:

        +   ``'name'`` - the name of the method which was called
        +   ``'value'`` - the value returned by the method
        +   ``'before'`` - the value returned by the respective beforeback

+ Should not ``return``

Example
-------

.. code-block:: python

    from spectate import expose_as

    EventfulList = expose_as('EventfulList', list, '__setitem__')

    def pass_on_old_value(inst, call):
        "The beforeback"
        index = call.args[0]
        old = inst[index]
        return index, old

    def print_element_change(inst, answer):
        "The afterback"
        # answer.before = pass_on_old_value(call)
        index, old = answer.before
        new = inst[index]
        if new != old:
            print("{%s: %s} -> {%s: %s}" %
                (index, old, index, new))

``pass_on_old_value`` simply pulls the old value stored at the given index, and then passes
that value and the index on to its afterback. The afterback then checks to see if the value
which is `now` stored at that index, is equal to the value which `was` stored there. If it is,
nothing happens, however if it isn't, the change gets printed.

Instances of ``EventfulList`` will behave exactly like a ``list`` in every way. The only
difference being that when a user decides to change the value of a preexisting element, the
spectator is notified, and will print once the action is complete:

.. code-block:: python

    elist, spectator = watch(EventfulList, [1, 2, 3])

    spectator.callback('__setitem__',
        before=pass_on_old_value,
        after=print_element_change)

    elist[0] = 0

Prints ``{0: 1} -> {0: 0}``

Under The Hood
--------------
Methods are tracked by using ``expose`` or (``expose_as``) to create a new class with ``MethodSpectator``
descriptors in the place of specified methods. Then, a user will create a ``Spectator`` using ``watch``
which is stored on the instance under the attribute ``_instance_spectator``. When a ``MethodSpectator``
is accessed through an instance, the descriptor will return a wrapper that will redirect to
``Spectator.wrapper``, which triggers the beforebacks and afterbacks registered to the instance.

In Depth Examples
-----------------
https://github.com/rmorshea/spectate/examples
"""


import re
import six
import types
import inspect
from traitlets.utils.bunch import FrozenBunch as Bunch


def getargspec(func):
    """A wrapper for :func:`inspect.getargspec`.

    Because builtins cannot be introspected, a spec for the
    signature ``(*args, **kwargs)`` is returned instead.
    """
    if isinstance(func, types.FunctionType) or isinstance(func, types.MethodType):
        return inspect.getargspec(func)
    else:
        # no signature introspection is available for this type
        return inspect.ArgSpec(None, 'args', 'kwargs', None)


class Spectator(object):

    def __init__(self, subclass):
        """A spectator which tracks the activities of a watchable types.

        The :class:`MethodSpectator` descriptors present on watchable
        types call the instance's :class:`Spectator` before the base
        method they have overriden. The :class:`Spectator` is provided
        with the method name, along with the standard and keyword
        arguments that were used. The spectator then runs callbacks
        both before, and after, the base method is ultimately triggered.

        Parameters
        ----------
        subclasses : WatchableType
            The type of the objected being watched.
        """
        self.subclass = subclass
        self._callback_registry = {}

    def callback(self, name, before=None, after=None):
        """Register a beforeback and/or afterback to a method.

        Parameters
        ----------
        name : str
            The name of the method that should be watched. This
            method must have an associated :class:`MethodSpectator`
            descriptor associated with it.
        before : callable
            A callback that will be called before the base method. Its 
            signature should be ``(value, call)`` where ``value`` is the
            value whose methods are being watched, and ``call`` is data
            about a call which was made to one of them.
        after : callable
            A callback that will be called after the base method. Its
            signature should be ``(value, answer)`` where ``value`` is
            the value whose methods are being watched, and ``answer``
            is data about the **result** of a call which was made to one
            of them.

        Callback Details
        ----------------

        + **Beforebacks**: a callback triggered before the base method.

            + Signature: ``(new, call)``

                1. ``new:`` the value to be set on the trait.
                2. ``call``: a bunch with the keys:

                    + ``name``: name of the method called.
                    + ``args``: the arguments that method was called with.
                    + ``kwargs``: the keyword arguments the method was called with.

            + Can ``return`` a value which gets passed on to its respective afterback.
        
        + **Afterbacks**: a callback triggered after the base method.

            + Signature: ``(new, answer)``

                1. ``new``: the value to be set on the trait.
                2. ``answer``: a bunch with the keys:

                    + ``name``: name of the method called.
                    + ``value``: the value returned by that call.
                    + ``before:`` if a beforeback was defined, this is the value it returned.

            + Generally don't ``return``
        """
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
        """Remove the given beforeback/afterback pair.

        Only the first occurance, and exact pair of callbacks is removed.

        Parameters
        ----------
        name : str or list/tuple of str
            A name or list of method names the pair was registered to.
        before : callable
            The beforeback that should be removed.
        after : callable
            The afterback that should be removed.
        """
        if isinstance(name, (list, tuple)):
            for name in name:
                self.remove_callback(name, before, after)
        else:
            if name in self._callback_registry:
                l = self._callback_registry[name]
            else:
                l = []
                self._callback_registry[name] = l
            if (before, after) != (None, None):
                l.remove((before, after))
            else:
                l = []
            if len(l) == 0:
                # cleanup if all callbacks are gone
                del self._callback_registry[name]

    def __call__(self, name, args, kwargs):
        """This method is triggered whenever a :class:`MethodSpectator` is called.

        Parameters
        ----------
        name: str
            The name of the method that will be called
        args: tuple
            The arguments that will be passed to the base method (including self).
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
    return globals()["spectator"]('{name}', (args + vargs), kwargs)"""

    def __init__(self, base, name):
        """A descriptor which notifies :class:`Spectator`s of method calls.

        Parameters
        ----------
        base : any
            The base class whose method should be watched.
        name : str
            The of the method being watched.
        """
        self.name = name
        self.base = base
        aspec = getargspec(self.basemethod)
        self.defaults = aspec.defaults
        self.code, self.defaults = self._code(aspec)
    
    @property
    def basemethod(self):
        return getattr(self.base, self.name)

    def _code(self, aspec):
        """Generate code triggers a :class:`Spectator` when called.

        This code has the exact same arg spec as the one given,
        and thus will reduce tracebacks by raising argument errors
        before they reaching the basemethod (or beforeback).

        Parameters
        ----------
        aspec : :class:`inspect.ArgSpec`
            The argument spec that should be copied.
        """
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

    def watched_method(self, inst):
        """Returns a method that triggers the instance's :class:`Specator`

        Parameters
        ----------
        inst : WatchableType
            A watchable type with a registered :class:`Spectator`.
        """
        spectator = watcher(inst)
        evaldict = {"spectator": spectator}
        eval(self.code, evaldict)
        # extract wrapper by name
        new = evaldict[self.name]
        # assign docstring and defaults
        new.__doc__ = self.basemethod.__doc__
        new.__defaults__ = self.defaults
        return types.MethodType(new, inst)

    def __get__(self, inst, cls):
        """Return a watched method.

        If the instance has no :class:`Specator` then the
        basemethod is returned instead. Of course, access
        from the class itself will reveal the descriptor
        itself.
        """
        if inst is None:
            return self
        elif has_watcher(inst):
            return self.watched_method(inst)
        else:
            return types.MethodType(self.basemethod, inst)


class WatchableType(object):
    """A base class for introspection"""
    pass


def expose_as(name, base, *methods):
    """Create a named :class:`WatchableType` with :class:`MethodSpectators`.
    
    See :func:`expose` for more info.
    """
    return expose(base, *methods, name=name)


def expose(base, *methods, **kwargs):
    """Create a :class:`WatchableType` with :class:`MethodSpectators`.
    
    Parameters
    ----------
    base : type
        The base which will be subclassed as a :class:`WatchableType`.
    *method : str
        A series of method names which should be overriden with :class:`MethodSpectators`
        descriptors on the subclass. When a :class:`Spectator` is registered to an instance
        of a :class:`WatchableType`, those descriptors will notify it that a method has
        been called. It is then the responsibility of the spectator to trigger callbacks
        and ultimately, the base method. Errors will be raised if the base class lacks a
        given method.
    **kwargs : options
        Pass a 'name' to name the subclass.
    """
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
    """Check if am instance or class is a :class:`WatchableType`

    Returns
    -------
    A boolean value.
    """
    check = issubclass if inspect.isclass(value) else isinstance
    return check(value, WatchableType)


def watch(value, *args, **kwargs):
    """Register a :class:`Spectator` to a watchable instance.

    Parameters
    ----------
    value : type or :class:`WatchableType`
        If given as a class, ``*args`` and ``**kwargs`` are used to
        create an instance, and register an instance to it. If an
        instance is given, a spectator is simply registered.
    *args : any
        Arguments passed to ``value`` if it's given as a type.
    **kwargs : any
        Keyword arguments passed to ``value`` if it's given as a type.

    Returns
    -------
    A :class:`Spectator` instance or, if ``value`` was given as a type,
    a tuple containing a :class:`WatchableType` constructed by passing
    ``*args`` and ``**kwargs`` to ``value`` and a spectator which was
    registered to it (in that order).
    """
    if inspect.isclass(value):
        value = value(*args, **kwargs)
        return value, watch(value)
    if isinstance(value, WatchableType):
        wtype = type(value)
    else:
        raise TypeError("Expected a WatchableType, not %r." % value)
    spectator = getattr(value, "_instance_spectator", None)
    if not isinstance(spectator, Spectator):
        spectator = (kwargs.get("spectator") or Spectator(wtype))
        value._instance_spectator = spectator
    return spectator


def unwatch(value):
    """Remove a :class:`Specator` from the given value.

    Returns
    -------
    The removed spectator.
    """
    if not isinstance(value, WatchableType):
        raise TypeError("Expected a WatchableType, not %r." % value)
    spectator = watcher(value)
    try:
        del value._instance_spectator
    except:
        pass
    return spectator


def has_watcher(value):
    """Check if the given value has a registered :class:`Spectator`

    Returns
    -------
    A boolean value.
    """
    return (isinstance(value, WatchableType) and
        getattr(value, "_instance_spectator", None) is not None)


def watcher(value):
    """Get the :class:`Spectator` registered to the given value, or ``None``"""
    if not isinstance(value, WatchableType):
        raise TypeError("Expected a WatchableType, not %r." % value)
    return getattr(value, "_instance_spectator", None)
