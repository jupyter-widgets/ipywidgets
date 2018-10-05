// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetView, StyleModel, unpack_models
} from '@jupyter-widgets/base';

import {
    CoreDOMWidgetModel
} from './widget_core';

import {
    IconModel, IconView
} from './widget_icon';

import {
    MenuModel, MenuView
} from './widget_menu';

import {
  Menu, Widget
} from '@phosphor/widgets';


import {
    JUPYTER_CONTROLS_VERSION
} from './version';

import * as _ from 'underscore';

export
class ButtonStyleModel extends StyleModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'ButtonStyleModel',
            _model_module: '@jupyter-widgets/controls',
            _model_module_version: JUPYTER_CONTROLS_VERSION,

        });
    }

    public static styleProperties = {
        button_color: {
            selector: '',
            attribute: 'background-color',
            default: null
        },
        font_weight: {
            selector: '',
            attribute: 'font-weight',
            default: ''
        }
    };
}

export
class ButtonModel extends CoreDOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            description: '',
            tooltip: '',
            disabled: false,
            icon: null,
            menu: null,
            menu_delay: null,
            default_action: null,
            button_style: '',
            _view_name: 'ButtonView',
            _model_name: 'ButtonModel',
            style: null
        });
    }
    static serializers = {
        ...CoreDOMWidgetModel.serializers,
        icon: {deserialize: unpack_models},
        menu: {deserialize: unpack_models},
        default_action: {deserialize: unpack_models}
    };
}

export
class ButtonView extends DOMWidgetView {
    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('jupyter-button');
        this.el.classList.add('widget-button');
        this.listenTo(this.model, 'change:button_style', this.update_button_style);
        this.set_button_style();
        this.update(); // Set defaults.
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed. The model may have been
     * changed by another view or by a state update from the back-end.
     */
    async update() {
        this.el.disabled = this.model.get('disabled');
        this.el.setAttribute('title', this.model.get('tooltip'));

        let description = this.model.get('description');
        let icon : IconModel = this.model.get('icon');
        let default_action = this.model.get('default_action');
        let previous_default_action = this.model.previous('default_action');
        if(previous_default_action) {
            previous_default_action.off('change:value', this.update)
        }
        if(default_action) {
            description = description || default_action.get('description');
            icon = icon || default_action.get('icon');
            this.listenTo(default_action, 'change:value', this.update)
        }
        let menu : MenuModel = this.model.get('menu');
        if(default_action && default_action.get('value') === true) {
            this.el.classList.add('mod-active');
        } else {
            this.el.classList.remove('mod-active');
        }
        this.el.innerHTML = '';
        if (description.length || icon) {
            if(this.iconView) {
                this.iconView.remove()
                this.iconView = null;
            }
            this.el.textContent = '';
            let el_icon_proxy = document.createElement('div');
            let el_caret_proxy = document.createElement('div');
            if (icon) {
                this.el.appendChild(el_icon_proxy);
            }
            this.el.appendChild(document.createTextNode(description));
            if (menu) {
                this.el.appendChild(el_caret_proxy);
            }
            if (icon) {
                this.iconView = <IconView> await this.create_child_view(icon)
                if (description.length === 0 && this.iconView) {
                    this.iconView.el.classList.add('center');
                }
                // this.el.appendChild(this.iconView.el);
                if (el_icon_proxy.parentNode == this.el)
                    this.el.replaceChild(this.iconView.el, el_icon_proxy);
                this.iconView.listenTo(icon, 'change', () => this.update())
            }
            if (menu) {
                this.menuView = <MenuView> await this.create_child_view(menu);
                // this.listenToMenu(this.menu);
                // menu.on('click', (menu : MenuModel) => {
                //     console.log('clicked', menu)
                //     // this.model.set('menu_last', menu);
                //     // if(this.model.get('menu_memory')) {
                //     //     this.model.set('icon', menu.get('icon'))
                //     //     this.model.set('description', menu.get('description'))
                //     // }
                //     this.touch()
                // })
                let i = document.createElement('i');
                i.classList.add('fa');
                i.classList.add('fa-caret-down');
                i.classList.add('widget-button-menu-sub-button');
                // menuButton.appendChild(i)
                // this.el.appendChild(menuButton);
                // this.el.appendChild(i);
                if (el_caret_proxy.parentNode == this.el)
                    this.el.replaceChild(i, el_caret_proxy);
                var downTimer = null;
                let openMenu = () => {
                    var rect = this.el.getBoundingClientRect();
                    var x = rect.left;
                    var y = rect.bottom;
                    this.menuView.menu.open(x, y);

                }
                this.el.onmousedown = (event) => {
                    console.log('mouse down')
                    if(this.model.get('menu_delay') !== null) {
                        downTimer = window.setTimeout(() => {
                            console.log('timeout, show menu')
                            openMenu()
                        }, this.model.get('menu_delay')*1000)
                    }
                }
                this.el.onmouseup = (event) => {
                    console.log('mouse down')
                    clearTimeout(downTimer)
                }
                this.el.onclick = (event) => {
                    console.log('click')
                    if(this.model.get('menu_delay') === null) {
                        console.log('onclick show menu')
                        event.preventDefault();
                        openMenu();
                    }
                }

            }
        }
        return super.update();
    }

    /*listenToMenu(menu : Menu) {
        menu.on()
        let items: Array<MenuModel> = menu.get('items');
        items.forEach(async (item: MenuModel, index: number) => {
        }
    }*/

    update_button_style() {
        this.update_mapped_classes(ButtonView.class_map, 'button_style');
    }

    set_button_style() {
        this.set_mapped_classes(ButtonView.class_map, 'button_style');
    }

    /**
     * Dictionary of events and handlers
     */
    events(): {[e: string]: string} {
        // TODO: return typing not needed in Typescript later than 1.8.x
        // See http://stackoverflow.com/questions/22077023/why-cant-i-indirectly-return-an-object-literal-to-satisfy-an-index-signature-re and https://github.com/Microsoft/TypeScript/pull/7029
        return {'click': '_handle_click'};
    }

    /**
     * Handles when the button is clicked.
     */
    _handle_click(event) {
        event.preventDefault();
        let default_action = this.model.get('default_action');
        if(default_action) {
            if(default_action.get('checkable')) {
                // if default_action is part of a boolean group, its state might not even change
                default_action.set('value', !default_action.get('value'))
                default_action.save_changes()
            }
            default_action.send({event: 'click'}, {})
            if(default_action && default_action.get('value') === true) {
                this.el.classList.add('mod-active');
            } else {
                this.el.classList.remove('mod-active');
            }
        }
        this.send({event: 'click'});
    }

    /**
     * The default tag name.
     *
     * #### Notes
     * This is a read-only attribute.
     */
    get tagName() {
        // We can't make this an attribute with a default value
        // since it would be set after it is needed in the
        // constructor.
        return 'button';
    }

    el: HTMLButtonElement;
    iconView: IconView;
    menuView: MenuView;

    static class_map = {
        primary: ['mod-primary'],
        success: ['mod-success'],
        info: ['mod-info'],
        warning: ['mod-warning'],
        danger: ['mod-danger']
    };
}
