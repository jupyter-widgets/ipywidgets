import sys
import types
import spectate
from weakref import ref
from collections import defaultdict
from traitlets import TraitType, Container, Undefined, TraitError
from traitlets.utils.bunch import Bunch


class Notifier(object):

    def __init__(self, cb, v):
        self.callback = cb
        self.value = v
        self._events = defaultdict(list)

    def __call__(self, etype, **data):
        self._events[etype].append(data)

    def send(self):
        lineage = list(self.callback.trait._lineage())
        validate = self.callback.trait._validate_change
        for etype, data in self._events.items():
            change = validate(Bunch(
                owner=self.callback.owner,
                events=list(map(Bunch, data)),
                name=lineage[-1].name,
                depth=len(lineage),
                value=self.value,
                type="item",
            ))
            self.callback.owner.notify_change(change)
            change.type = "nested"
            self.callback.owner.notify_change(change)
        self._events.clear()


class Callback(object):
    """A wrapper for the callbacks of an :class:`Eventful` subclass.
    """

    notify = False

    def __init__(self, owner, trait, function):
        """Define the attributes of a callback.

        Parameters
        ----------
        owner : HasTraits
            The instance which owns the given trait.
        trait : TraitType
            The trait whose values will have a :class:`Spectator`.
        function : callable
            The callback method defined on an :class:`Eventful` subclass.
        """
        self._owner = ref(owner)
        self.trait = trait
        self.function = function

    def __eq__(self, other):
        """Compare this callback to a callable or other callback.

        If compared to an object which is not a Callback,
        a check is made to see if it is the function of this
        callback instead.
        """
        if not isinstance(other, Callback):
            return self.function == other
        else:
            return other is self

    def __repr__(self):
        if self.index is not None:
            return "%s(%s, %s)" % (type(self).__name__, self.index, self.function)
        else:
            return "%s(%s)" % (type(self).__name__, self.function)

    @property
    def owner(self):
        o = self._owner()
        if o is None:
            raise RuntimeError("You must retain a reference to the owner of "
                "%r to prevent it from being garbage collected." % self.trait)
        return o


class Beforeback(Callback):

    def __call__(self, value, call):
        """A callback that responds before a method call has been made.

        Parameters
        ----------
        value : any
            The value of the trait, whose method was called.
        call: Bunch
            Data created by :class:`Specatator` about what
            method was called, and with what arguments.

        Returns
        -------
        The output of the callback's handler function.

        Notifications
        -------------
        If/when this callback notifies its owner, it passes a :class:`Bunch` containing:

        + ``name``: The name of the trait that changed.
        + ``owner``: The owner of the trait that changed.
        + ``type``: The name of the event passed to the ``notify`` closure
        + ``events``: A list of all the data passed to the ``notify`` closure.

        See :mod:`spectate` for more info on beforebacks and afterbacks.
        """
        if self.function is not None:
            notify = Notifier(self, value)
            result = self.function(value, call, notify)
            notify.send()
            return result


class Afterback(Callback):

    def __call__(self, value, answer):
        """A callback that responds before a method call has been made

        Parameters
        ----------
        value : any
            The value of the trait, whose method was called.
        answer: Bunch
            Data created by :class:`Specatator` about what
            method was called, and with what arguments.

        Notifications
        -------------
        If/when this callback notifies its owner, it passes a :class:`Bunch` containing:

        + ``name``: The name of the trait that changed.
        + ``owner``: The owner of the trait that changed.
        + ``type``: The name of the event passed to the ``notify`` closure
        + ``events``: A list of all the data passed to the ``notify`` closure.

        See :mod:`spectate` for more info on beforebacks and afterbacks.
        """
        notify = Notifier(self, value)
        if self.function is None:
            if callable(answer.before):
                answer.before(answer.value, notify)
        else:
            self.function(value, answer, notify)
        notify.send()


class Eventful(TraitType):
    """An eventful trait which can track changes to mutable data types.

    This trait provides a generic API for defining descriptors that can respond
    to method calls on the instance which get assigned to it. For example,
    standard traits do not response when users calls ``list.append`` to mutate
    a list attached to a `HasTraits` object. An ``Eventful`` trait on the other
    hand provided it has defined the appropriate attributes and methods.

    In order to report an event that has occurred on a trait value, we need
    an ``events`` dictionary, and callback methods. The ``events`` dictionary
    maps nicknames to one or more real method names. For example, to track when
    users set the contents of a dictionary we might say ``events = {"setitem":
    ["__setitem__", "setdefault"]}``. With this in place we can then define
    callbacks that trigger before or after the methods we specified in ``events``.
    The callbacks (hereafter referred to as Beforebacks and Afterbacks respectively)
    should be named ``_before_setitem`` and/or ``_after_setitem`` on Eventful
    subclasses that correspond to key in the ``events`` dictionary. It's these
    Beforebacks and Afterbacks that give you the tools to create notifications:

    + Beforeback:
        + Signature: `(value, call, notify)`
            1. ``value``: the instance whose method was called.
            2. ``call``: a bunch with the keys:
                + ``name``: name of the method called
                + ``args``: the arguments that method was called with
                + ``kwargs``: the keyword arguments the method was called with
            3. ``notify``: An object for sending notifications with the signature ``(type, **data)``.
                + ``type``: A string indication the type of event to be sent.
                + ``data``: Information that will be passed to ``@observe`` handlers under ``change['events']``
        + Return: a value, or an Afterback
            2. If a value is returned, it is sent to its corresponding Afterback.
            3. The afterback is a callable with a signature `(returned, notify)`
                + ``returned``: is the output of the called method.
                + ``notify``: is the same as above.

    + Afterback
        + Signature: `(value, answer, notify)`
        	1. `value`: the value held by the trait.
        	2. `answer`: a bunch with the keys:
        		+ `name`: name of the method called
        		+ `value`: the value returned by that call
        		+ `before`: if a Beforeback was defined, this is the value it returned.
            3. ``notify``: is the same as above.

    Attributes
    ----------
    events : dict of strings or lists
        A dictionary which maps nicknames to one or many method names in the
        form ``{nickname: method_1}`` or ``{nickname: [method_1, method_2]}``.
    _before_<nickname> :
        Methods of the form ``(self, value, call, notify)``.
    _after_<nickname> :
        Methods of the form ``(self, value, answer, notify)``.
    """

    events = {}

    def register_events(self, owner, value):
        spectator = spectate.watch(value)
        for method, before, after in self.iter_events():
            if not (before is None and after is None):
                spectator.callback(method,
                    Beforeback(owner, self, before),
                    Afterback(owner, self, after)
                )

    def iter_events(self):
        for name, on in self.events.items():
            for method in (on if isinstance(on, (tuple, list)) else (on,)):
                yield (
                    method,
                    getattr(self, "_before_" + name, None),
                    getattr(self, "_after_" + name, None),
                )

    def set(self, obj, val):
        if type(val).__module__ == "__builtin__":
            msg = "Cannot set builtins like %r on eventful traits."
            raise TraitError(msg % type(val))
        else:
            super(Eventful, self).set(obj, val)

    def _validate(self, owner, value):
        if self.name in owner._trait_values:
            old = getattr(owner, self.name)
            if spectate.watchable(old) and spectate.watcher(old):
                spectator = spectate.watcher(old)
                for method, before, after in self.iter_events():
                    if before is not None or after is not None:
                        spectator.remove_callback(method, before, after)
        value = super(Eventful, self)._validate(owner, value)
        if value is not None:
            if not spectate.watchable(value):
                value = self._cast(value)
            self._watch(owner, value)
        return value

    def _cast(self, value):
        """Returns a watchable value."""
        wtype = self._expose(type(value))
        try:
            value.__class__ = wtype
        except TypeError:
            return wtype(value)
        else:
            return value

    def _expose(self, cls):
        """Creates a watchable type subclass based on ``cls``.

        The methods that are exposed to spectation are taken from this trait's list of active
        events. To see more details about how these methods are exposed, see :mod:`spectate`.
        """
        methods = set(e[0] for e in self.iter_events())
        return spectate.expose_as(cls.__name__, cls, *methods)

    def _watch(self, owner, value):
        """Register a spectator to the value and active events to the spectator
        """
        self.register_events(owner, value)

    def _validate_change(self, change):
        return change
