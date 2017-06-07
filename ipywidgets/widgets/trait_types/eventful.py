from .spectate import watch, unwatch, has_watcher, watcher, expose_as, watchable, Spectator
from traitlets import TraitType, Undefined
from traitlets.utils.bunch import Bunch
from contextlib import contextmanager


class Callback(object):

    notify = True

    def __init__(self, owner, trait, etype, callback, notify=None):
        """A base class defining the fundamental attributes of an eventful callback

        Parameters
        ----------
        owner : HasTraits
            The instance which owns the given trait.
        trait : TraitType
            The trait whose values will have a :class:`Spectator`.
        etype : str
            The type of event this callback will handle (e.g. setting items).
        func : callable
            A callable object responsible for creating an event report. The
            signature must be ``(value, data)`` where ``value`` is the value
            of the given trait, and ``data`` is information about a method
            which was called on that object.
        notify : bool
            When an event report is generated, this determines whether the owner
            should be notified of it. Setting notify to False could be used by a
            wrapper to capture and then modify an event before notifying.
        """
        self.owner = owner
        self.trait = trait
        self.etype = etype
        self.func = callback
        if notify is not None:
            self.notify = notify

    def __eq__(self, other):
        """Compare this callback to a callable or other callback.

        If compared to an object which is not a Callback,
        a check is made to see if it is the function of this
        callback instead.
        """
        if not isinstance(other, Callback):
            return self.func == other
        else:
            return other is self


class Beforeback(Callback):

    notify = False

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
        The output of the callback's handler function. This should be data
        that, if notify equals ``True``, is sent immediately to the owner as
        a notification, or is otherwise passed to a corresponding afterback
        in its answer data under the key 'before'.

        See :mod:`spectate` for more info on beforebacks and afterbacks.
        """
        call.update(trait=self.trait, type=self.etype, owner=self.owner)
        result = self.func(value, call)
        if self.notify and result is not None:
            self.owner.notify_change(result)
        return result


class Afterback(Callback):

    def __call__(self, value, answer):
        """A callback that responds before a method call has been made

        Parameters
        ----------
        value : any
            The value of the trait, whose method was called.
        call: Bunch
            Data created by :class:`Specatator` about what
            method was called, and with what arguments.

        Returns
        -------
        The output of the callback's handler function. This should be data
        that, if notify equals ``True``, is sent immediately to the owner as
        a notification.

        See :mod:`spectate` for more info on beforebacks and afterbacks.
        """
        if self.func is None:
            result = answer.before
            event = (result(answer.value) if
                callable(result) else result)
        else:
            event = self.func(value, answer)
        if event is not None and self.notify:
            self.owner.notify_change(
                Bunch(name=self.trait.name, event=event,
                    type=self.etype, owner=self.owner))
        return event


class Eventful(TraitType):

    klass = None
    event_map = {}
    type_name = None
    watchable_type = None

    def __init__(self, *args, **kwargs):
        """Create an eventful trait.

        Values assigned to this trait have methods which trigger callbacks, and
        subsiquently notifications which can be captured via :func:`traitlets.observe`
        of :meth:`traitlets.HasTraits.observe`.

        To accomplish this, whenever a new value is set to the trait:

        1. If the trait had a previous value, its :class:`Spectator` is unregistered.
        2. The new value is validated and wrapped in a :class:`WatchableType` subclass.
        3. Callbacks are then registered to the watchable instance.
        4. The watchable instance (not the value it wrapped) is set as the new value.

        Callbacks
        ---------
        A callback pair is registered to a method in one of two ways. Either through the
        :meth:`Eventful.event` or via user defined methods named ``_before_<event>`` and/or
        ``_after_<event>`` where ``<event>`` is a key in the :attr:`Eventful.event_map` dict.
        These pairs have a beforeback (a callback which is called before a method) and an
        afterback (a callback which is called after a method).

        Attributes
        ----------
        klass : type
            The class this trait will accept. If no `klass` is defined
            by a subclass of :class:`Eventful` then one is infered from
            a default value (if one exists).
        event_map : dict
            A dictionary mapping event type names to method names present
            on the given `klass`. Method names can be given as a string or
            a list of strings. The event type names are used to specify
        type_name : str
            The name give to the :class:`.spectate.WatchableType` subclass
            generated by :func:`spectate.expose_as`.
        watchable_type : :class:`spectate.WatchableType`
            The watchable type subclass that is used to observe method calls
            on the values of this trait. If no `watchable_type` is defined
            by a subclass of :class:`Eventful` then one is generated based
            on `klass`.
        """
        super(Eventful, self).__init__(*args, **kwargs)
        default_value = self.default()
        if self.klass is None and default_value is not Undefined:
            self.klass = type(default_value)
        self._active_events = []
        self.setup_events()

    def event(self, type, methods, before=None, after=None):
        """Define an active event.

        Parameters
        ----------
        type : str
            The type of the new event (e.g. 'change')
        methods : str or list of str
            The method(s) this event should be triggered on.
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

            + Return: ``None``, value, or an afterback

                1. If `None` no notifications are distributed to ``@observer`` handlers.
                1. The value is distributed to its associated afterback. However, if no afterback
                is defined, it is passed directly to ``@observer`` handlers under ``change['event']``.
                2. The afterback is a callable with a signature ``(returned)``

                    + ``returned`` is the output of the called method.
                    + The afterback can return `None` to prevent notifications, or a value which
                    is distributed to ``@observer`` handlers under ``change['event']``.
        
        + **Afterbacks**: a callback triggered after the base method.

            + Signature: ``(new, answer)``

                1. ``new``: the value to be set on the trait.
                2. ``answer``: a bunch with the keys:

                    + ``name``: name of the method called.
                    + ``value``: the value returned by that call.
                    + ``before:`` if a beforeback was defined, this is the value it returned.

            + Return: ``None`` or a value
                1. ``None`` prevents notifications
                2. Any other value gets distributed to ``@observer`` handlers under ``change['event']``.
        """
        for method in (methods if isinstance(methods, (list, tuple)) else (methods,)):
            self._active_events.append((type, method, before, after))
        return self

    def setup_events(self):
        """Store events from the event map as active events."""
        for name, on in self.event_map.items():
            for method in (on if isinstance(on, (tuple, list)) else (on,)):
                before = getattr(self, "_before_" + name, None)
                after = getattr(self, "_after_" + name, None)
                if not (before is None and after is None):
                    self.event(type=name, methods=method,
                        before=before, after=after)

    def _validate(self, owner, value):
        try:
            old = getattr(owner, self.name)
        except:
            pass
        else:
            if watchable(old) and has_watcher(old):
                spectator = watcher(old)
                for etype, method, before, after in self._active_events:
                    if before is not None or after is not None:
                        spectator.remove_callback(method, before, after)
        value = super(Eventful, self)._validate(owner, value)
        if value is not None:
            if not watchable(value):
                value = self._cast(value)
            self.watch(owner, value)
            watcher(value).owner = owner
        return value

    def _cast(self, value):
        return (self.watchable_type or self.expose(type(value)))(value)

    def expose(self, klass):
        """Creates a watchable type subclass based on ``self.klass``"""
        methods = (e[1] for e in self._active_events)
        return expose_as(self.type_name, klass, *methods)

    def watch(self, owner, value):
        """Register a spectator to the value and active events to the spectator"""
        self._register_defined_events(owner, watch(value))

    @contextmanager
    def abstracted(self, value, event, notify=False):
        """A context manager for capturing multiple calls to an event and repackaging them.

        Return the value yielded by this manager to notify with those repackaged events.
        
        Parameters
        ----------
        value : any
            The value typically passed to a callback.
        event : str
            The name of an event in the ``event_map` dict. The value yielded
            by this manager is an "abstracted" version of that event which
            captures calls made to it and packages them into a new event.
        notify : bool
            If ``True`` then calls will create the repackaged event in addition
            to the the event being "abstracted". This means there will be many
            small notifications plus the larger repackaged one.

        Examples
        --------

        .. code-block:: python

            class EventfulValue(Eventful):
                
                klass = list
                event_map = dict(extend="extend", append="append")

                def _before_extend(self, value, call):
                    with self.abstracted(value, "append") as append:
                        for v in call.args[0]:
                            append(v)
                    return append

                def _before_append(self, value, call):
                    return Bunch(index=len(value), new=call.args[0])


            class MyClass(HasTraits):

                v = EventfulValue()

                @observe("v", type="extend")
                def _v_extension(self, change):
                    print(change)

            mc = MyClass()
            mc.v = []
            mc.v.extend([1, 2])
        """
        if event in self.event_map:
            before = getattr(self, "_before_%s" % event, None)
            after = getattr(self, "_after_%s" % event, None)
            if before is None and after is None:
                raise ValueError("The event '{0}' lacks the associated "
                    "methods '_before_{0}' or '_after_{0}'".format(event))
            method = self.event_map[event]
            if isinstance(method, (list, tuple)):
                method = method[0]
        else:
            raise ValueError('%r is not present in the event map of %r' % (event, self))

        owner = watcher(value).owner
        before = Beforeback(owner, self, event, before)
        after = Afterback(owner, self, event, after, notify)

        with abstracted(method, before, after) as _abstraction:
            done = False
            def abstraction(*args, **kwargs):
                if not done:
                    return _abstraction(value, *args, **kwargs)
                else:
                    return _abstraction(*args, **kwargs)
            yield abstraction
            done = True

    def _register_defined_events(self, owner, spectator):
        for e in self._active_events:
            etype, method, before, after = e
            if before is not None or after is not None:
                spectator.callback(method,
                    before=Beforeback(owner, self, etype, before),
                    after=Afterback(owner, self, etype, after))

    def class_init(self, cls, name):
        super(Eventful, self).class_init(cls, name)
        if self.klass is not None and self.watchable_type is None:
            self.watchable_type = self.expose(self.klass)


@contextmanager
def abstracted(method, beforeback=None, afterback=None):
    before = redirect(method, beforeback, afterback)

    hold = []
    done = False

    def abstraction(*args, **kwargs):
        if done:
            return [after(*args, **kwargs) for after in hold]
        else:
            hold.append((args, kwargs))

    yield abstraction

    hold = [before(*a, **kw) for a, kw in hold]
    done = True


def redirect(method, before=None, after=None):
    _before, _after = before, after

    def before(instance, *args, **kwargs):
        if _before is not None:
            call = Bunch(name=method, kwargs=kwargs, args=args)
            bval = _before(instance, call)
        else:
            bval = None

        if _after is not None:
            def after(value):
                answer = Bunch(before=bval, name=method, value=value)
                return _after(instance, answer)
        elif callable(bval):
            after = bval
        else:
            after = None

        return after

    return before
