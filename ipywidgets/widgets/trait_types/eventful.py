from .spectate import watch, unwatch, watcher, expose_as, watchable
from traitlets import TraitType, Undefined
from traitlets.utils.bunch import Bunch


class Callback(object):

    def __init__(self, owner, trait, etype, callback):
        self.owner = owner
        self.trait = trait
        self.etype = etype
        self.func = callback

    def __eq__(self, other):
        if not isinstance(other, Callback):
            return self.func == other
        else:
            return other is self


class Beforeback(Callback):

    def __call__(self, inst, call):
        call = call.copy()
        call.update(
            trait=self.trait,
            owner=self.owner,
            type=self.etype)
        return self.func(inst, call)


class Afterback(Callback):

    def __call__(self, inst, answer):
        if self.func is None:
            result = answer['before']
            if (isinstance(result, Redirect)
                and result.origin is not None):
                origin = result.origin
            else:
                origin = self.etype

            event = (result(answer.value) if
                callable(result) else result)
        else:
            origin = self.etype
            event = self.func(inst, answer)
        if None not in (origin, event):
            self.owner.notify_change(Bunch(
                type=origin, event=event,
                name=self.trait.name,
                owner=self.owner))
        return event


class Redirect(object):

    def __init__(self, origin, target, inst, args, kwargs):
        self.origin = origin
        registry = inst._instance_spectator._callback_registry
        # Eventful._setup_events registers first
        b, a = registry.get(target, [(None, None)])[0]

        if b is not None:
            call = Bunch(name=target,
                kwargs=kwargs.copy(),
                args=args[:])
            bval = b(inst, call)
        else:
            bval = None

        if a is not None:
            self.trigger = lambda value: a(inst, Bunch(
                before=bval, name=target, value=value))
        elif callable(bval):
            self.trigger = bval

    def __call__(self, value):
        # trigger afterbacks
        return self.trigger(value)

    @staticmethod
    def trigger(value):
        pass


class Eventful(TraitType):

    klass = None
    event_map = {}
    type_name = None
    watchable_type = None

    def __init__(self, *args, **kwargs):
        super(Eventful, self).__init__(*args, **kwargs)
        default_value = self.default()
        if self.klass is None and default_value is not Undefined:
            self.klass = type(default_value)
        self._active_events = []
        self.setup_events()

    def event(self, type, on, before=None, after=None):
        for method in (on if isinstance(on, (list, tuple)) else (on,)):
            self._active_events.append((type, method, before, after))
        return self

    def setup_events(self):
        for name, on in self.event_map.items():
            for method in (on if isinstance(on, (tuple, list)) else (on,)):
                before = getattr(self, "_before_"+name, None)
                after = getattr(self, "_after_"+name, None)
                if not (before is None and after is None):
                    self.event(type=name, on=method,
                        before=before, after=after)

    def _validate(self, owner, value):
        try:
            old = getattr(owner, self.name)
        except:
            pass
        else:
            if watchable(old) and watcher(old) is not None:
                spectator = watcher(old)
                for etype, method, before, after in self._active_events:
                    if before is not None or after is not None:
                        spectator.remove_callback(method, before, after)
        value = super(Eventful, self)._validate(owner, value)
        if value is not None:
            if not watchable(value):
                value = self._cast(value)
            self.watch(owner, value)
        return value

    def _cast(self, value):
        return (self.watchable_type or self.expose(type(value)))(value)

    def expose(self, klass):
        methods = (e[1] for e in self._active_events)
        return expose_as(self.type_name, klass, *methods)

    def watch(self, owner, value):
        self._register_defined_events(owner, watch(value))

    def _register_defined_events(self, owner, spectator):
        for e in self._active_events:
            etype, on, before, after = e
            if before is not None or after is not None:
                spectator.callback(on,
                    before=Beforeback(owner, self, etype, before),
                    after=Afterback(owner, self, etype, after))

    def redirect_once(self, origin, target, inst, args=(), kwargs={}):
        value = self.event_map[target]
        target = value[0] if isinstance(value, (list, tuple)) else value
        return Redirect(inst, origin, target, args, kwargs)

    def redirect(self, origin, target, inst, args=None, kwargs=None):
        value = self.event_map[target]
        target = value[0] if isinstance(value, (list, tuple)) else value

        if args is None and kwargs is not None:
            args = [() for i in range(len(kwargs))]
        elif kwargs is None and args is not None:
            kwargs = [{} for i in range(len(args))]
        if len(args) != len(kwargs):
            raise ValueError("Uneven args (%s) and kwargs (%s) lists")

        redirects = [Redirect(inst, origin, target, a, kw)
            for a, kw in zip(args, kwargs)]
        def redirect(value):
            events = []
            for r in redirects:
                events.append(r(value))
            return events
        return redirect

    def class_init(self, cls, name):
        super(Eventful, self).class_init(cls, name)
        if self.klass is not None and self.watchable_type is None:
            self.watchable_type = self.expose(self.klass)
