// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import '@fortawesome/fontawesome-free/css/all.min.css';
import '@fortawesome/fontawesome-free/css/v4-shims.min.css';

import WidgetManagerProvider from './plugin';
import * as output from './output';

export default WidgetManagerProvider;

export {
  registerWidgetManager
} from './plugin';

export {
  WidgetManager
} from './manager';

export {
  WidgetRenderer
} from './renderer';

export {
  output
};

