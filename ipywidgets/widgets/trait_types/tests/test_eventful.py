import copy
from unittest import TestCase
from traitlets import HasTraits, observe, Bunch, TraitType
from ..eventful import Eventful, Bunch, Beforeback, Afterback, redirect, abstracted
from .. import spectate


class CopyClass(object):
    """Creates a new instance with attributes of an old one"""
    def __new__(cls, old=None):
        new = super(CopyClass, cls).__new__(cls)
        if old is not None:
            for key, value in old.__dict__.items():
                setattr(new, key, value)
        return new


def event_form(*args, **data):
    if len(args) == 3:
        args += (None,)
    owner, name, etype, event = args
    return Bunch(name=name, type=etype, owner=owner,
        event=(Bunch(**data) if data else event))


class TestCallbacks(TestCase):

    def test_beforeback(self):
        trait = 'trait' # would be an Eventful trait
        owner = 'owner' # would be a HasTraits instance
        before = lambda inst, call: (inst, call)
        bb = Beforeback(owner, trait, 'type', before)

        value, call = bb(1, Bunch())

        assert value == 1
        assert call == Bunch(owner=owner,
            type='type', trait=trait)

    def test_beforeback_notify(self):
        owner = HasTraits()
        trait = TraitType()
        trait.name = "name"

        log = []
        # store notifications in the log
        owner.notify_change = lambda change: log.append(change)

        before = lambda value, call: (value, call)

        bb_notify_false = Beforeback(owner, trait, 'type', before, notify=False)
        bb_notify_true = Beforeback(owner, trait, 'type', before, notify=True)

        _, false_bunch = bb_notify_false(False, Bunch())
        _, true_bunch = bb_notify_true(True, Bunch())

        assert len(log) == 1
        assert log[0] == event_form(owner, "name", "type", (True, true_bunch))

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


class TestEvenftul(TestCase):

    def test_builtin_event_registration(self):
        class Test(CopyClass):
            def my_method(self):
                pass
        class MyEventful(Eventful):
            klass = Test
            event_map = {'method': 'full_method_name'}
            def _before_method(self, inst, call): pass
            def _after_method(self, inst, answer): pass

        e = MyEventful(Test())
        assert len(e._active_events) == 1
        assert e._active_events[0] == (
            'method', 'full_method_name',
            e._before_method, e._after_method)

    def test_user_event_registration(self):
        class Test(CopyClass):
            def full_method_name(self):
                pass

        e = Eventful(default_value=Test())
        before = lambda inst, call: None
        after = lambda inst, answer: None
        e.event('method', 'full_method_name', before, after)
        assert len(e._active_events) == 1
        assert e._active_events[0] == (
            'method', 'full_method_name',
            before, after)

    def test_watchable_type_creation(self):
        class Test(CopyClass):
            def full_method_name(self):
                pass

        before = lambda inst, call: None
        after = lambda inst, answer: None

        class MyHasTraits(HasTraits):
            e = Eventful(default_value=Test()).event(
                'method', 'full_method_name',
                before, after)

        method = MyHasTraits.e.watchable_type.full_method_name
        assert isinstance(method, spectate.MethodSpectator)

    def test_watchable_type_wrapping(self):
        class Test(CopyClass):
            def full_method_name(self):
                pass

        before = lambda inst, call: None
        after = lambda inst, answer: None

        class MyHasTraits(HasTraits):
            e = Eventful(default_value=Test()).event(
                'method', 'full_method_name',
                before, after)

        mht = MyHasTraits()
        value = mht.e
        assert isinstance(value, spectate.WatchableType)
        reg = mht.e._instance_spectator._callback_registry
        callbacks = tuple(c.func for c in reg['full_method_name'][0])
        assert callbacks == (before, after)

    def test_unwatch_old_values(self):
        class Test(CopyClass):
            def full_method_name(self):
                pass

        def callback(value, call):
            assert False, "An old value should not notify callbacks"

        class MyHasTraits(HasTraits):
            e = Eventful(default_value=Test()).event(
                "method", "full_method_name", callback)

        mht = MyHasTraits()

        old = mht.e

        # assigning a new value should
        # unregister callbacks assigned
        # to the old one
        mht.e = Test()

        # the registered callback should
        # no longer get called through
        # the old value
        old.full_method_name()


class TestAbstraction(TestCase):

    def test_redirect(self):

        name = "test"

        index = 0

        def beforeback(instance, call):
            assert call.name == name
            args, kwargs = calls[index]
            assert instance == args[0]
            assert call.args == args[1:]
            assert call.kwargs == kwargs
            return call

        def afterback(instance, answer):
            assert answer.name == name
            args, kwargs = calls[index]
            assert answer.value == values[index]
            # check that the returned value
            # came from the associated beforback
            assert instance == args[0]
            assert answer.before.args == args[1:]
            assert answer.before.kwargs == kwargs

        re = redirect(name, beforeback, afterback)

        calls = []
        values = []
        def trigger(value, *args, **kwargs):
            calls.append((args, kwargs))
            values.append(value)
            re(*args, **kwargs)(value)

        placeholder_instance = "x"

        trigger(1, placeholder_instance, 10)
        index += 1
        trigger(2, placeholder_instance, 10, 11)
        index += 1
        trigger(3, placeholder_instance, 10, b=11)
        index += 1
        trigger(4, placeholder_instance, a=10, b=11)

        index = 0
        calls = []
        values = []
        def callback(instance, call):
            args, kwargs = calls[index]
            assert instance == args[0]
            assert call.args == args[1:]
            assert call.kwargs == kwargs
            def after(value):
                assert value == values[index]
            return after

        re = redirect("test", callback)

        trigger(1, placeholder_instance, 10)
        index += 1
        trigger(2, placeholder_instance, 10, 11)
        index += 1
        trigger(3, placeholder_instance, 10, b=11)
        index += 1
        trigger(4, placeholder_instance, a=10, b=11)

    def test_abstracted(self):
        # placehold method name
        method = "x"
        calls = []
        answers = []
        placeholder_instance = "y"

        def before(inst, call):
            assert inst is placeholder_instance
            calls.append(call)
            return call

        def after(inst, answer, index=[0]):
            assert inst is placeholder_instance
            assert calls[index[0]] == answer.before
            answers.append(answer)
            index[0] += 1
            return answer

        with abstracted(method, before, after) as test:
            test(placeholder_instance, 1)
            test(placeholder_instance, 1, 2)
            test(placeholder_instance, 1, a=2)
            test(placeholder_instance, a=1, b=2)
        
        assert len(calls) == 4

        test_answers = test(None)

        assert test_answers == answers

    def test_abstracted_method(self):

        class Test(CopyClass):
            target_method_called = False
            target_beforeback_called = False
            target_afterback_called = False
            origin_method_called = False
            origin_beforeback_called = False
            origin_afterback_called = False
            def origin_method(self, a):
                self.origin_method_called = True
                return a
            def target_method(self, b):
                self.target_method_called = True
                return b + 1

        WatchableTest = spectate.expose_as('WatchableTest',
            Test, 'origin_method', 'target_method')

        class TestTrait(Eventful):

            klass = Test
            type_name = "Test"
            event_map = dict(origin='origin_method', target='target_method')

            def _before_origin(self, value, call):
                value.origin_beforeback_called = True
                with self.abstracted(value, "target") as target:
                    target(*call.args, **call.kwargs)
                    target(*call.args, **call.kwargs)
                assert value.target_beforeback_called
                return call, target

            def _after_origin(self, value, answer):
                value.origin_afterback_called = True

                assert value.origin_method_called
                assert not value.target_method_called

                call, target = answer.before
                result = target(answer.value)

                assert value.target_afterback_called

                before = call.copy(type="target", name="target_method")
                answer = answer.copy(name="target_method", before=before)
                call = call.copy(type="target", name="target_method")

                assert len(result) == 2
                for r in result:
                    assert r == answer

            def _before_target(self, value, call):
                value.target_beforeback_called = True
                return call

            def _after_target(self, value, answer):
                value.target_afterback_called = True
                return answer

        class HasTestTrait(HasTraits):
            test = TestTrait()

        htt = HasTestTrait()
        htt.test = Test()
        test = htt.test

        spectator = spectate.watcher(test)

        def is_not_target(inst, call):
            # the abstraction should not trigger this
            assert False

        spectator.callback('target_method', is_not_target) 

        test.origin_method(0)

        assert test.origin_beforeback_called
        assert test.origin_afterback_called
