import copy
from unittest import TestCase
from traitlets import HasTraits, observe
from ..eventful import Eventful, Bunch, Beforeback, Afterback, Redirect
from .. import spectate


class CopyClass(object):
    def __new__(cls, old=None):
        new = super(CopyClass, cls).__new__(cls)
        if old is not None:
            for key, value in old.__dict__.items():
                setattr(new, key, value)
        return new


def test_beforeback():
    trait = 'trait' # would be an Eventful trait
    owner = 'owner' # would be a HasTraits instance
    before = lambda inst, call: (inst, call)
    bb = Beforeback(owner, trait, 'type', before)

    inst, call = bb(owner, Bunch())
    assert call == Bunch(owner=owner,
        type='type', trait=trait)


class TestAfterback(TestCase):

    def test_afterback_value(self):
        owner = HasTraits()
        class FakeEventful(object):
            def __init__(self):
                self.name = 'name'
        trait = FakeEventful()
        value = 'value'

        call = Bunch(name='func', args=(), kwargs={})

        # beforeback returns a value for an afterback
        before = lambda inst, call: (inst, call)
        after = lambda inst, answer: (inst, answer)

        make_answer = lambda : Bunch(before=before(value, call),
            name='placeholder_method_name', value=None)

        ab = Afterback(owner, trait, 'type', after)

        answer = make_answer()
        result = ab(value, answer)
        assert result == (value, answer)

    def test_afterback_closure(self):
        owner = HasTraits()
        class FakeEventful(object):
            def __init__(self):
                self.name = 'name'
        trait = FakeEventful()
        value = 'value'

        call = Bunch(name='func', args=(), kwargs={})

        # beforeback returns a closure instead of a value
        before = lambda inst, call: lambda value: (inst, call, value)

        make_answer = lambda : Bunch(before=before(value, call),
            name='placeholder_method_name', value=None)

        # afterback must be None to trigger closure
        ab = Afterback(owner, trait, 'type', None)

        result = ab(value, make_answer())
        assert result == (value, call, None)

    def test_afterback_notify(self):
        log = []

        class NotifyLogger(HasTraits):

            def notify_change(self, change):
                log.append(change)
                super(NotifyLogger, self).notify_change(change)

            @observe('trait_name', type='event_type')
            def _log_change(self, change):
                log.append(change)

        owner = NotifyLogger()

        class FakeEventful(object):
            def __init__(self):
                self.name = 'trait_name'

        trait = FakeEventful()
        
        value = 'value'

        before = lambda inst, call: call
        after = lambda inst, answer: answer

        call = Bunch(name='func', args=(), kwargs={})
        make_answer = lambda : Bunch(
            before=before(value, call),
            name='func', value=None)

        ab = Afterback(owner, trait, 'event_type', after)

        answer = make_answer()

        ab(value, answer)

        change = Bunch(name='trait_name', owner=owner,
            type='event_type', event=answer)

        assert len(log) == 2

        def check(logged):
            assert logged == change
        map(check, log)

def test_redirect():
    class Test(CopyClass):
        target_method_called = False
        target_beforeback_called = False
        target_afterback_called = False
        origin_method_called = False
        origin_beforeback_called = False
        origin_afterback_called = False
        def origin(self, a):
            self.origin_method_called = True
            return a
        def target(self, b):
            self.target_method_called = True
            return b + 1

    WatchableTest = spectate.expose_as('WatchableTest', Test, 'origin', 'target')
    test, spectator = spectate.watch(WatchableTest)

    def before_target(inst, call):
        inst.target_beforeback_called = True
        return call
    def after_target(inst, answer):
        inst.target_afterback_called = True
        return (inst, answer.before, answer.value)

    spectator.callback('target', before_target, after_target)

    def is_not_target(inst, call):
        # redirect should not trigger this
        assert False

    spectator.callback('target', is_not_target)

    def before_origin(inst, call):
        inst.origin_beforeback_called = True
        r = Redirect('origin', 'target', inst, call.args, call.kwargs)
        assert inst.target_beforeback_called
        return call, r
    def after_origin(inst, answer):
        assert inst.origin_method_called
        assert not test.target_method_called

        call, redirect = answer.before
        out = redirect(answer.value)

        call.update(name='target')
        assert inst.target_afterback_called
        assert out == (inst, call, answer.value)
        inst.origin_afterback_called = True

    spectator.callback('origin', before_origin, after_origin)    

    test.origin(0)

    assert test.origin_beforeback_called
    assert test.origin_afterback_called


class TestEvenftul(TestCase):

    def test_builtin_event_registration(self):
        class Test(CopyClass):
            def long_method_name(self):
                pass
        class MyEventful(Eventful):
            klass = Test
            event_map = {'method': 'long_method_name'}
            def _before_method(self, inst, call): pass
            def _after_method(self, inst, answer): pass

        e = MyEventful(Test())
        assert len(e._active_events) == 1
        assert e._active_events[0] == (
            'method', 'long_method_name',
            e._before_method, e._after_method)

    def test_user_event_registration(self):
        class Test(CopyClass):
            def long_method_name(self):
                pass

        e = Eventful(default_value=Test())
        before = lambda inst, call: None
        after = lambda inst, answer: None
        e.event('method', 'long_method_name', before, after)
        assert len(e._active_events) == 1
        assert e._active_events[0] == (
            'method', 'long_method_name',
            before, after)

    def test_watchable_type_creation(self):
        class Test(CopyClass):
            def long_method_name(self):
                pass

        before = lambda inst, call: None
        after = lambda inst, answer: None

        class MyHasTraits(HasTraits):
            e = Eventful(default_value=Test()).event(
                'method', 'long_method_name',
                before, after)

        method = MyHasTraits.e.watchable_type.long_method_name
        assert isinstance(method, spectate.MethodSpectator)

    def test_watchable_type_wrapping(self):
        class Test(CopyClass):
            def long_method_name(self):
                pass

        before = lambda inst, call: None
        after = lambda inst, answer: None

        class MyHasTraits(HasTraits):
            e = Eventful(default_value=Test()).event(
                'method', 'long_method_name',
                before, after)

        mht = MyHasTraits()
        value = mht.e
        assert isinstance(value, spectate.WatchableType)
        reg = mht.e._instance_spectator._callback_registry
        callbacks = tuple(c.func for c in reg['long_method_name'][0])
        assert callbacks == (before, after)

    def test_unwatch_old_values(self):
        class Test(CopyClass):
            def long_method_name(self):
                pass

        def callback(value, call):
            assert False, "An old value should not notify callbacks"

        class MyHasTraits(HasTraits):
            e = Eventful(default_value=Test()).event(
                "method", "long_method_name", callback)

        mht = MyHasTraits()

        old = mht.e

        # assigning a new value should
        # unregister callbacks assigned
        # to the old one
        mht.e = Test()

        # the registered callback should
        # no longer get called through
        # the old value
        old.long_method_name()
