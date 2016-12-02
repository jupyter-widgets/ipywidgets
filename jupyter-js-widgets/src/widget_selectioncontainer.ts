// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetModel, DOMWidgetView, ViewList
} from './widget';

import {
    BoxModel, JupyterPhosphorPanelWidget
} from './widget_box';

import {
    TabBar
} from 'phosphor/lib/ui/tabbar';

import {
    Panel
} from 'phosphor/lib/ui/panel';

import {
    Title
} from 'phosphor/lib/ui/title';

import {
    Widget
} from 'phosphor/lib/ui/widget';

import {
    each, enumerate
} from 'phosphor/lib/algorithm/iteration';

import {
    indexOf
} from 'phosphor/lib/algorithm/searching';

import * as _ from 'underscore';
import * as utils from './utils';
import * as $ from 'jquery';

export
class SelectionContainerModel extends BoxModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'SelectionContainerModel',
            selected_index: 0,
            _titles: {}
        });
    }
}

export
class AccordionModel extends SelectionContainerModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'AccordionModel',
            _view_name: 'AccordionView'
        });
    }
}

export
class AccordionView extends DOMWidgetView {
    initialize(parameters){
        super.initialize(parameters)
        this.children_views = new ViewList(this.add_child_view, this.remove_child_view, this);
        this.listenTo(this.model, 'change:children', (model, value, options) => {
            this.children_views.update(value);
        });
    }

    /**
     * Called when view is rendered.
     */
    render() {
        this.el.className = 'jupyter-widgets widget-container widget-accordion';

        this.listenTo(this.model, 'change:selected_index', function(model, value, options) {
            this.update_selected_index(options);
        });
        this.listenTo(this.model, 'change:_titles', function(model, value, options) {
            this.update_titles(options);
        });
        this.children_views.update(this.model.get('children'));
        this.update_titles();
        this.update_selected_index();
    }

    /**
     * Set header titles
     */
    update_titles() {
        let titles = this.model.get('_titles');
        for (let i = 0; i < this.pages.length; i++) {
            if (titles[i] !== void 0) {
                this.pages[i].firstChild.textContent = titles[i];
            }
        }
    }

    /**
     * Make the rendering and selected index consistent.
     */
    update_selected_index(options?) {
        let new_index = this.model.get('selected_index');
        this.pages.forEach((page, index) => {
            if (index === new_index) {
                page.classList.add('accordion-active');
                // TODO: use CSS transitions?
                $(page.lastElementChild).slideDown('fast');
            } else {
                page.classList.remove('accordion-active');
                $(page.lastElementChild).slideUp('fast');
            }
        })
    }

    /**
     * Called when a child is removed from children list.
     */
    remove_child_view(view) {
        let page = this.view_pages[view.cid];
        this.pages.splice(this.pages.indexOf(page), 1);
        delete this.view_pages[view.cid];
        page.parentNode.removeChild(page);
        view.remove();
    }

    /**
     * Called when a child is added to children list.
     */
    add_child_view(model) {
        let page = document.createElement('div');
        page.classList.add('accordion-page');
        let header = document.createElement('div');
        header.classList.add('accordion-header');
        header.textContent = `Page ${this.pages.length}`;
        header.onclick = () => {
            let index = this.pages.indexOf(page);
            this.model.set('selected_index', index);
            this.touch();
        }
        let content = document.createElement('div');
        content.classList.add('accordion-content');
        page.appendChild(header);
        page.appendChild(content);
        this.pages.push(page);
        this.el.appendChild(page);
        this.update_titles();
        this.update_selected_index;
        return this.create_child_view(model).then((view) => {
            this.view_pages[view.cid] = page;
            content.appendChild(view.el);

            // Trigger the displayed event of the child view.
            this.displayed.then(() => {
                view.trigger('displayed', this);
            });
            return view;
        }).catch(utils.reject('Could not add child view to box', true));
    }

    /**
     * We remove this widget before removing the children as an optimization
     * we want to remove the entire container from the DOM first before
     * removing each individual child separately.
     */
    remove() {
        super.remove();
        this.children_views.remove();
    }

    children_views: ViewList;
    pages: HTMLDivElement[] = [];
    view_pages: {[key: string]: HTMLDivElement} = Object.create(null);
}

export
class TabModel extends SelectionContainerModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'TabModel',
            _view_name: 'TabView'
        });
    }
}

// We implement our own tab widget since Phoshpor's TabPanel uses an absolute
// positioning BoxLayout, but we want a more an html/css-based Panel layout.

export
class TabView extends DOMWidgetView {

    _createElement(tagName: string) {
        this.pWidget = new JupyterPhosphorPanelWidget({ view: this });
        return this.pWidget.node;
    }

    _setElement(el: HTMLElement) {
        if (this.el || el !== this.pWidget.node) {
            // TabViews don't allow setting the element beyond the initial creation.
            throw new Error('Cannot reset the DOM element.');
        }

        this.el = this.pWidget.node;
        this.$el = $(this.pWidget.node);
     }

    /**
     * Public constructor.
     */
    initialize(parameters) {
        super.initialize(parameters);
        this.childrenViews = new ViewList(
            this.addChildView,
            (view) => {view.remove()},
            this
        );
        this.listenTo(this.model, 'change:children', () => this.updateTabs());
        this.listenTo(this.model, 'change:_titles', () => this.updateTitles());
    }

    /**
     * Called when view is rendered.
     */
    render() {
        this.pWidget.addClass('jupyter-widgets');
        this.pWidget.addClass('widget-container');
        this.pWidget.addClass('widget-tab');

        this.tabBar = new TabBar({insertBehavior: 'none'});
        this.tabBar.tabsMovable = false;
        this.tabBar.addClass('widget-tab-bar');
        this.tabBar.currentChanged.connect(this._onTabChanged, this);

        this.tabContents = new Panel();
        this.tabContents.addClass('widget-tab-contents');

        this.pWidget.addWidget(this.tabBar);
        this.pWidget.addWidget(this.tabContents);
        this.updateTabs();
        this.update();
    }

    /**
     * Render tab views based on the current model's children.
     */
    updateTabs() {
        // While we are updating, the index may not be valid, so deselect the
        // tabs before updating so we don't get spurious changes in the index.
        this.updatingTabs = true;
        let oldTitle = this.tabBar.currentTitle;
        this.tabBar.currentIndex = -1;
        this.childrenViews.update(this.model.get('children'));
        this.tabBar.currentIndex = this.model.get('selected_index');
        let newTitle = this.tabBar.currentTitle;
        if (oldTitle !== newTitle) {
            if (oldTitle && oldTitle.owner) {
                oldTitle.owner.hide();
            }
            if (newTitle && newTitle.owner) {
                newTitle.owner.show();
            }
        }
        this.updatingTabs = false;
    }

    /**
     * Called when a child is added to children list.
     */
    addChildView(model, index) {
        // Placeholder title to keep our position in the tab bar while we create the view.
        let label = this.model.get('_titles')[index] || (index+1).toString();
        let tempTitle = new Title({label});
        this.tabBar.addTab(tempTitle);
        return this.create_child_view(model).then((view: DOMWidgetView) => {
            let widget = view.pWidget;
            widget.hide();
            widget.addClass('widget-tab-child');
            this.tabContents.addWidget(widget);

            let title = widget.title;
            title.closable = false;
            title.label = tempTitle.label;

            let i = indexOf(this.tabBar.titles, tempTitle);
            // insert after tempTitle so that if tempTitle is selected,
            // after this the replacement title will be selected.
            this.tabBar.insertTab(i+1, title);
            this.tabBar.removeTab(tempTitle);
            view.on('remove', () => this.tabBar.removeTab(title));

            if (this.tabBar.currentTitle === title) {
                widget.show();
            }
            return view;
        }).catch(utils.reject('Could not add child view to box', true));
    }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update() {
        // Update the selected index in the overall update method because it
        // should be run after the tabs have been updated. Otherwise the
        // selected index may not be a valid tab in the tab bar.
        this.updateSelectedIndex();
        return super.update();
    }

    /**
     * Updates the tab page titles.
     */
    updateTitles() {
        var titles = this.model.get('_titles') || {};
        each(enumerate(this.tabBar.titles), ([i, title]) => {
            title.label = titles[i] || (i+1).toString();
        });
    }

    /**
     * Updates the selected index.
     */
    updateSelectedIndex() {
        let current = this.model.get('selected_index');
        let previous = this.model.previous('selected_index');
        if (current === void 0) {
            current = 0;
        }
        let titles = this.tabBar.titles;
        if (0 <= current && current < titles.length) {
            if(previous !== void 0 && previous !== current) {
                let previousTitle = titles.at(previous);
                let previousWidget = previousTitle ? previousTitle.owner : null;
                if (previousWidget) {
                    previousWidget.hide();
                }
            }
            this.tabBar.currentIndex = current;
            let currentWidget = this.tabBar.currentTitle.owner;
            if (currentWidget) {
                currentWidget.show();
            }
        }
    }

    remove() {
        this.tabBar = null;
        this.tabContents = null;

        // Remove this widget before children so that the entire container
        // leaves the DOM at once.
        super.remove();
        this.childrenViews.remove();
    }

    _onTabChanged(sender: TabBar, args: TabBar.ICurrentChangedArgs) {
        if (!this.updatingTabs) {
            this.model.set('selected_index', args.currentIndex);
            this.touch();
        }
    }

    updatingTabs: boolean = false;
    childrenViews: ViewList;
    tabBar: TabBar;
    tabContents: Panel;
    pWidget: JupyterPhosphorPanelWidget;
}
