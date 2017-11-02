// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DescriptionView, DescriptionStyleModel
} from './widget_description';

import {
    uuid
} from './utils';

import * as reactDOM from 'react-dom';
import * as React from 'react';

export
class DropdownView extends DescriptionView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();

        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-dropdown');

        this.listbox = document.createElement('div');

        this.listbox.id = this.label.htmlFor = uuid();
        this.el.appendChild(this.listbox);
        this.update();
    }

    update() {
        reactDOM.render(<b>hi!</b>, this.listbox);
    }

    listbox: HTMLDivElement;
}
