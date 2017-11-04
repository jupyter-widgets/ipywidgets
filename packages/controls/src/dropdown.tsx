// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DescriptionView, DescriptionStyleModel
} from './widget_description';

import {
    uuid
} from './utils';

import * as ReactDOM from 'react-dom';

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
        let selectedIndex = this.model.get('index');
        let value = selectedIndex === null ? '' : selectedIndex;
        let props = {
            disabled: this.model.get('disabled'),
            labels: this.model.get('_options_labels'),
            selectedIndex: this.model.get('index'),
            id: this.label.htmlFor,
            handleChange: (event) => {
                this.model.set('index', parseInt(event.target.value, 10));
                this.touch();
            }
        };
        ReactDOM.render(React.createElement(DropDown, props), this.listbox);
    }

    listbox: HTMLDivElement;
}


interface IProps {
    disabled: boolean;
    labels: string[];
    id: string;
    selectedIndex: number;
    handleChange: (event: Event) => void;
  }

class DropDown extends React.Component<IProps, {}> {
    render() {
        let options = this.props.labels.map((label, index) => {
            return (
            <option value={index}>
                {label.replace(/ /g, '\xa0')}
            </option>);
        });
        let selectedIndex = this.props.selectedIndex;
        let value = selectedIndex === null ? '' : selectedIndex;
        return (
            <select id={this.props.id}
              value={value}
              disabled={this.props.disabled}
              onChange={this.props.handleChange}>
              <option value='' disabled></option>
            {options}
            </select>
        );
    }

    props: IProps;
}
