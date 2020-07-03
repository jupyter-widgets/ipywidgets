from unittest import TestCase
from ipywidgets.widgets.widget import Widget
from ipywidgets import widget_output


class TestSingleOutputWidget(TestCase):
    def test_init(self):
        w = widget_output.SingleOutput(value=6)
        self.assertEqual(w.value, 6)

    def test_assignement(self):
        w = widget_output.SingleOutput()
        self.assertEqual(w.value, None)
        w.value = 4
        self.assertEqual(w.value, 4)
        observations = []
        
        def f(change):
            observations.append(change.new)

        w.observe(f, "value")
        w.value = 7
        self.assertEqual(observations[0], 7)
        self.assertEqual(w.value, 7)

    def test_widget(self):
        w = widget_output.SingleOutput()
        self.assertIsInstance(w, Widget)
