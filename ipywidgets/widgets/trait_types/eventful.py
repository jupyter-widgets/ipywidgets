from .spectate import watch, unwatch, has_watcher, watcher, expose_as, watchable, Spectator
from traitlets import TraitType, Undefined
from traitlets.utils.bunch import FrozenBunch as Bunch
from contextlib import contextmanager


class Callback(object):

    notify = True

    def __init__(self, owner, trait, etype, callback, notify=None):
        """Define the attributes of a callback.

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

        Notifications
        -------------
        If/when this callback notifies its owner, it passes a :class:`Bunch` containing:

        + ``name``: The name of the trait that changed.
        + ``owner``: The owner of the trait that changed.
        + ``type``: The name of the event that occured in the trait's value.
        + ``event``: The raw event data returned by this beforeback.

        See :mod:`spectate` for more info on beforebacks and afterbacks.
        """
        call = call.copy(trait=self.trait, type=self.etype, owner=self.owner)
        if self.func is not None:
            event = self.func(value, call)
            if self.notify and event is not None:
                self.owner.notify_change(
                    Bunch(name=self.trait.name, event=event,
                        type=self.etype, owner=self.owner))
            return event
            


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

        Returns
        -------
        The output of the callback's handler function. This should be data
        that, if notify equals ``True``, is sent immediately to the owner as
        a notification.

        Notifications
        -------------
        If/when this callback notifies its owner, it passes a :class:`Bunch` containing:

        + ``name``: The name of the trait that changed.
        + ``owner``: The owner of the trait that changed.
        + ``type``: The name of the event that occured in the trait's value.
        + ``event``: The raw event data returned by this afterback.

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

        1. If the trait had a previous value, all event callbacks this trait registered to its :class:`Spectator` are removed.
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

    @property
    def active_events(self):
        return self._active_events[:]

    def event(self, type, methods, before=None, after=None):
        """Define an active event.

        Parameters
        ----------
        type : str
            The type of the new event (e.g. 'change')
        methods : str or list of str
            The method(s) this event should be triggered on.
        before : callable
            A beforeback that will be called before the base method. Its 
            signature should be ``(value, call)`` where ``value`` is the
            value whose methods are being watched, and ``call`` is data
            about a call which was made to one of them.
        after : callable
            An afterback that will be called after the base method. Its
            signature should be ``(value, answer)`` where ``value`` is
            the value whose methods are being watched, and ``answer``
            is data about the **result** of a call which was made to one
            of them.

        Beforebacks and Afterbacks
        --------------------------
        While the functions registered here are callbacks in the strictest
        sense, they are more like "event reporters" - they are responsible
        for capturing the data trail of a trait value's event, and passing
        that data on to trait owners so it can be distributed to event
        observers. To report an event, there are two different callbacks:

        + Beforebacks - a callback triggered before a given method.
        + Afterbacks - a callback triggered after a given method.
        
        Beforebacks and afterbacks are stored in pairs which intercommunicate
        so that the state of an object before a mutative method is called, can
        be compared to its state afterwards. These pairs can be defined in one
        of two ways:

        + `Type I` : Create two functions, and pass them to this method's ``'before'`` and ``'after'`` arguments.
        + `Type II` : Create one function which defines, and then returns a closure. The function itself is the
        beforeback, and the closure it returns is an afterback, thus the function should be passed to this method's
        ``'before'`` argument.

        Callback Definitions
        --------------------

        + **Beforebacks**

            + Signature: ``(new, call)``

                1. ``new``: the value to be set on the trait.
                2. ``call``: a bunch with the keys:

                    + ``name``: name of the method called.
                    + ``args``: the arguments that method was called with.
                    + ``kwargs``: the keyword arguments the method was called with.

            + Return: ``None``, value, or an afterback

                1. If `None` no notifications are distributed to ``@observer`` handlers.
                1. The value is distributed to its associated afterback. However, if no afterback
                is defined, it is passed directly to ``@observer`` handlers under ``change['event']``.
                2. The afterback is a callable with a signature ``(returned)``

                    + ``returned`` is the direct output of the called method.
                    + Just like a distinct afterback, it can return ``None`` to prevent notifications,
                    or a value which gets distributed to event observers under ``report['event']``.
        
        + **Afterbacks**

            + Signature: ``(new, answer)``

                1. ``new``: the value to be set on the trait.
                2. ``answer``: a bunch with the keys:

                    + ``name``: name of the method called.
                    + ``value``: the value returned by that call.
                    + ``before:`` if a beforeback was defined, this is the value it returned.

            + Return: ``None`` or a value

                1. ``None`` to prevents notifications.
                2. Any other value gets distributed to event observers under ``report['event']``.

        Event Notifications
        -------------------
        Notifications from events can be captured by trait owners with :func:`traitlets.observe` or
        the method :meth:`traitlets.HasTraits.observe`, by specifying that ``type=<event>`` where
        ``<event>`` is the string that was passed to the ``'type'`` argument of this method.
        """
        for method in (methods if isinstance(methods, (list, tuple)) else (methods,)):
            self._active_events.append((type, method, before, after))
        return self

    def setup_events(self):
        """Store events from the event map as active events.

        Here methods with the naming scheme ``_before_<event>`` and ``_after_<event>``
        where ``<event>`` is a key in the :attr:`Eventful.event_map`` are gathered in pairs
        and then passed to :meth:`Eventful.event` as seperate before and afterbacks. If one
        the named methods is absent a placeholder :class:`Beforeback` or :class:`Afterback`
        is used instead.
        """
        for name, on in self.event_map.items():
            for method in (on if isinstance(on, (tuple, list)) else (on,)):
                before = getattr(self, "_before_" + name, None)
                after = getattr(self, "_after_" + name, None)
                if not (before is None and after is None):
                    self.event(type=name, methods=method,
                        before=before, after=after)

    def _validate(self, owner, value):
        """Registers a spectator and event callbacks to a validated value.

        1. If this trait had a previous value, all event callbacks this trait registered to its :class:`Spectator` are removed.
        2. The new value is validated and wrapped in a :class:`WatchableType` subclass.
        3. Callbacks are then registered to the watchable instance.
        4. The watchable instance (not the value it wrapped) is set as the new value.

        Parameters
        ----------
        owner : :class:`traitlets.HasTraits`
            The owner of the trait.
        value : any
            The the owner's proposed value for this trait.
        """
        try:
            old = getattr(owner, self.name)
        except:
            pass
        else:
            if watchable(old) and has_watcher(old):
                spectator = watcher(old)
                for etype, method, before, after in self.active_events:
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
        """Creates a watchable type subclass based on ``self.klass``

        The methods that are exposed to spectation are taken from this trait's list of active
        events. To see more details about how these methods are exposed, see :mod:`spectate`.
        """
        methods = (e[1] for e in self.active_events)
        return expose_as(self.type_name, klass, *methods)

    def watch(self, owner, value):
        """Register a spectator to the value and active events to the spectator
        """
        self._register_defined_events(owner, watch(value))

    @contextmanager
    def abstracted_once(self, value, event, notify=False):
        hold = []
        _abstraction = None

        def abstraction(*args, **kwargs):
            if len(hold) == 0:
                hold.append((args, kwargs))
            else:
                if _abstraction is not None:
                    return _abstraction(*args, **kwargs)[0]
                else:
                    raise TypeError("This abstraction can only be called once.")

        yield abstraction

        if len(hold):
            args, kwargs = hold[0]
            with self.abstracted(value, event, notify) as _abstraction:
                _abstraction(*args, **kwargs)

    @contextmanager
    def abstracted(self, value, event, notify=False):
        """A context manager for creating a superset of events.

        The manager captures multiple calls to a yielded "abstracted" event
        (a closure) and redirects them to the event as if they had been made
        by a user of the given value. However, instead of notifying each time
        a call is made, the events therin are captured and repackaged as one
        list of events which is sent to the trait's owner.
        
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
        single : bool
            If ``True`` then 

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
        for etype, method, before, after in self.active_events:
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
    """Create a closure that captures and repackages an event.
    
    Yields a closure which captures event calls. Upon exiting the
    context the given beforeback is called with those arguments,
    and it's results are captured. If the closure is returned as
    an afterback in a Type I callback pair then then given afterback
    is called with the results captured earlier. The output of this
    last call is then repackaged as a list of events.

    Parameters
    ----------
    method : str
        The name of the method the before/afterback are associated with.
    beforeback : callable
        The beforeback associated with defining an event's data for the given method.
    afterback : callable
        The afterback associate with defining an event's data for the given method. 
    """
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
    """Creates a Type II event definition from a Type I definition.
    
    + `Type I` : A seperate beforeback and afterback pair.
    + `Type II` : An afterback closure defined in and returned by a beforeback.

    Parameters
    ----------
    method : str
        The name of the method the before/afterback are associated with.
    beforeback : callable
        The beforeback associated with defining an event's data for the given method.
    afterback : callable
        The afterback associate with defining an event's data for the given method.
    """
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
