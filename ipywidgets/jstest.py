"""Run IPython widget javascript tests

run with `gulp tests; python -m jstest`
"""

# Copyright (c) IPython Development Team.
# Distributed under the terms of the Modified BSD License.

import os

try:
    from unittest.mock import patch
except ImportError:
    from mock import patch # py2

from notebook import jstest
from ipywidgets.install import install

here = os.path.dirname(__file__)


class WidgetTestController(jstest.JSController):
    """Javascript test subclass that installs widget nbextension in test environment"""
    def __init__(self, section, *args, **kwargs):
        extra_args = kwargs.pop('extra_args', None)
        super(WidgetTestController, self).__init__(section, *args, **kwargs)
        
        test_cases = os.path.join(here, 'tests', 'bin', 'tests', self.section)
        self.cmd = ['casperjs', 'test', test_cases, '--engine=%s' % self.engine]

        if extra_args is not None:
            self.cmd = self.cmd + extra_args
    
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
    return [ WidgetTestController(g, extra_args=options.extra_args) for g in groups ], []


def main():
    with patch.object(jstest, 'prepare_controllers', prepare_controllers):
        jstest.main()


if __name__ == '__main__':
    main()
