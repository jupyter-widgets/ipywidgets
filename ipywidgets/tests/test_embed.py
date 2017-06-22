
import json
import os
import re
import tempfile
import shutil

import traitlets

from ..widgets import IntSlider, IntText, Widget, jslink, HBox, widget_serialization
from ..embed import embed_data, embed_snippet, embed_minimal_html, dependency_state

try:
    from io import StringIO
except ImportError:
    from StringIO import StringIO


class CaseWidget(Widget):
    """Widget to test dependency traversal"""

    a = traitlets.Instance(Widget, allow_none=True).tag(sync=True, **widget_serialization)
    b = traitlets.Instance(Widget, allow_none=True).tag(sync=True, **widget_serialization)

    _model_name = traitlets.Unicode('CaseWidgetModel').tag(sync=True)

    other = traitlets.Dict().tag(sync=True, **widget_serialization)




class TestEmbed:

    def teardown(self):
        for w in tuple(Widget.widgets.values()):
            w.close()

    def test_embed_data_simple(self):
        w = IntText(4)
        state = dependency_state(w, drop_defaults=True)
        data = embed_data(views=w, drop_defaults=True, state=state)

        state = data['manager_state']['state']
        views = data['view_specs']

        assert len(state) == 3
        assert len(views) == 1

        model_names = [s['model_name'] for s in state.values()]
        assert 'IntTextModel' in model_names

    def test_embed_data_two_widgets(self):
        w1 = IntText(4)
        w2 = IntSlider(min=0, max=100)
        jslink((w1, 'value'), (w2, 'value'))
        state = dependency_state([w1, w2], drop_defaults=True)
        data = embed_data(views=[w1, w2], drop_defaults=True, state=state)

        state = data['manager_state']['state']
        views = data['view_specs']

        assert len(state) == 7
        assert len(views) == 2

        model_names = [s['model_name'] for s in state.values()]
        assert 'IntTextModel' in model_names
        assert 'IntSliderModel' in model_names

    def test_embed_data_complex(self):
        w1 = IntText(4)
        w2 = IntSlider(min=0, max=100)
        jslink((w1, 'value'), (w2, 'value'))

        w3 = CaseWidget()
        w3.a = w1

        w4 = CaseWidget()
        w4.a = w3
        w4.other['test'] = w2

        # Add a circular reference:
        w3.b = w4

        # Put it in an HBox
        HBox(children=[w4])

        state = dependency_state(w3)

        assert len(state) == 9

        model_names = [s['model_name'] for s in state.values()]
        assert 'IntTextModel' in model_names
        assert 'IntSliderModel' in model_names
        assert 'CaseWidgetModel' in model_names
        assert 'LinkModel' in model_names

        # Check that HBox is not collected
        assert 'HBoxModel' not in model_names

        # Check that views make sense:

        data = embed_data(views=w3, drop_defaults=True, state=state)
        assert state is data['manager_state']['state']
        views = data['view_specs']
        assert len(views) == 1


    def test_snippet(self):
        w = IntText(4)
        state = dependency_state(w, drop_defaults=True)
        snippet = embed_snippet(views=w, drop_defaults=True, state=state)

        lines = snippet.splitlines()

        # Check first line with regex
        re.match('<script src=".*?"></script>', lines[0])

        # Check simple equality on intermediate lines
        assert (
            lines[1] == '<script type="application/vnd.jupyter.widget-state+json">' and
            lines[-4] == '</script>' and
            lines[-3] == '<script type="application/vnd.jupyter.widget-view+json">' and
            lines[-1] == '</script>'
            )

        # Check state and view pass simple sanity checks:
        manager_state = json.loads('\n'.join(lines[2:-4]))
        state = manager_state['state']
        view = json.loads(lines[-2])

        assert isinstance(state, dict)
        assert len(state) == 3
        assert isinstance(view, dict)

    def test_minimal_html_filename(self):
        w = IntText(4)

        tmpd = tempfile.mkdtemp()

        try:
            output = os.path.join(tmpd, 'test.html')
            state = dependency_state(w, drop_defaults=True)
            embed_minimal_html(output, views=w, drop_defaults=True, state=state)
            # Check that the file is written to the intended destination:
            with open(output, 'r') as f:
                content = f.read()
            assert content.splitlines()[0] == '<!DOCTYPE html>'
        finally:
            shutil.rmtree(tmpd)

    def test_minimal_html_filehandle(self):
        w = IntText(4)
        output = StringIO()
        state = dependency_state(w, drop_defaults=True)
        embed_minimal_html(output, views=w, drop_defaults=True, state=state)
        content = output.getvalue()
        assert content.splitlines()[0] == '<!DOCTYPE html>'
