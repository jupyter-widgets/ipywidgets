"""Run IPython widget javascript tests

run with `python -m jstest`
"""

# Copyright (c) IPython Development Team.
# Distributed under the terms of the Modified BSD License.

import os

try:
    from unittest.mock import patch
except ImportError:
    from mock import patch # py2

from jupyter_notebook import jstest
from ipywidgets.install import install

here = os.path.dirname(__file__)


class WidgetTestController(jstest.JSController):
    """Javascript test subclass that installs widget nbextension in test environment"""
    def __init__(self, section, *args, **kwargs):
        # if not section:
        #     section = os.path.join(here, 'tests')
        super(WidgetTestController, self).__init__(section, *args, **kwargs)
        # # FIXME: temporary workaround waiting for rm-widgets PR
        includes = '--includes=' + os.path.join(jstest.get_js_test_dir(), 'util.js')
        test_cases = os.path.join(here, 'tests', self.section)
        self.cmd = ['casperjs', 'test', includes, test_cases, '--engine=%s' % self.engine]
    
    def setup(self):
        super(WidgetTestController, self).setup()
        with patch.dict(os.environ, self.env):
            install(user=True, enable=True)


def prepare_controllers(options):
    """Monkeypatched prepare_controllers for running widget js tests
    
    instead of notebook js tests
    """
    if options.testgroups:
        groups = options.testgroups
    else:
        groups = ['']
    return [ WidgetTestController(g) for g in groups ], []


def main():
    with patch.object(jstest, 'prepare_controllers', prepare_controllers):
        jstest.main()


if __name__ == '__main__':
    main()
