from unittest import TestCase
from contextlib import contextmanager
from widgets.widget_singleoutput import SingleOutput
from ipywidgets.widgets.widget import Widget
from ipywidgets import widget_output


class TestSingleOutputWidget(TestCase):
    def test_init(self):
        w = SingleOutput(value=6)
        self.assertEqual(w.value, 6)

    def test_assignement(self):
        w = SingleOutput()
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
        w = SingleOutput()
        self.assertIsInstance(w, Widget)


if __name__ == "__main__":
    unittest.main()
