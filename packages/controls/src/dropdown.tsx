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
        let id = this.label.htmlFor = uuid();
        let items = this.model.get('_options_labels');
        let options = items.map(i => {
            return <option data-value={encodeURIComponent(i)} value={i}>{i.replace(/ /g, '\xa0')}</option>;
        });
        reactDOM.render(
            <select id={id} disabled={this.model.get('disabled')}>
            {options}
            </select>
            , this.listbox);
    }

    listbox: HTMLDivElement;
}
