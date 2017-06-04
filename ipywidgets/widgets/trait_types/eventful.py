from .spectate import watch, unwatch, watcher, expose_as, watchable, Spectator
from traitlets import TraitType, Undefined
from traitlets.utils.bunch import Bunch
from contextlib import contextmanager


class Callback(object):

    def __init__(self, owner, trait, etype, callback, notify=True):
        self.owner = owner
        self.trait = trait
        self.etype = etype
        self.func = callback
        self.notify = True

    def __eq__(self, other):
        if not isinstance(other, Callback):
            return self.func == other
        else:
            return other is self


class Beforeback(Callback):

    def __call__(self, inst, call):
        call.update(trait=self.trait, type=self.etype, owner=self.owner)
        return self.func(inst, call)


class Afterback(Callback):

    def __call__(self, inst, answer):
        if self.func is None:
            result = answer.before
            event = (result(answer.value) if
                callable(result) else result)
        else:
            event = self.func(inst, answer)
        if event is not None and self.notify:
            self.owner.notify_change(Bunch(event=event,
                name=self.trait.name, type=self.etype))
        return event


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
                before = getattr(self, "_before_" + name, None)
                after = getattr(self, "_after_" + name, None)
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
            watcher(value).owner = owner
        return value

    def _cast(self, value):
        return (self.watchable_type or self.expose(type(value)))(value)

    def expose(self, klass):
        methods = (e[1] for e in self._active_events)
        return expose_as(self.type_name, klass, *methods)

    def watch(self, owner, value):
        self._register_defined_events(owner, watch(value))

    @contextmanager
    def abstracted(self, value, event, notify=False):
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
            # will raise attribute error if not present
            before, after, name = getattr(self, event), None, event

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
