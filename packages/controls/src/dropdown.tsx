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
        this.label.htmlFor = uuid();
        this.el.appendChild(this.listbox);
        this.update();
    }

    update() {
        let labels = this.model.get('_options_labels');
        let options = labels.map((label, index) => {
            return (
            <option value={index}>
                {label.replace(/ /g, '\xa0')}
            </option>);
        });
        let selectedIndex = this.model.get('index');
        let value = selectedIndex === null ? '' : selectedIndex;
        reactDOM.render(
            <select id={this.label.htmlFor}
              value={value}
              disabled={this.model.get('disabled')}
              onChange={(event) => {
                  this.model.set('index', parseInt(event.target.value));
                  this.touch();
              }}>
              <option value='' disabled></option>
            {options}
            </select>
            , this.listbox);
    }

    listbox: HTMLDivElement;
}


interface IProps {
    disabled: boolean;
    labels: string[];
    selectedIndex: number;
    handleChange: (event: Event) => void;
  }

class DropDown extends React.Component<IProps, {}> {
    render() {
        this.setState();
        let options = labels.map((label, index) => {
            return (
            <option value={index}>
                {label.replace(/ /g, '\xa0')}
            </option>);
        });
        let selectedIndex = this.model.get('index');
        let value = selectedIndex === null ? '' : selectedIndex;
        reactDOM.render(
            <select id={this.label.htmlFor}
              value={value}
              disabled={this.model.get('disabled')}
              onChange={(event) => {
                  this.model.set('index', parseInt(event.target.value));
                  this.touch();
              }}>
              <option value='' disabled></option>
            {options}
            </select>
            , this.listbox);
    }
    props: IProps;
}
