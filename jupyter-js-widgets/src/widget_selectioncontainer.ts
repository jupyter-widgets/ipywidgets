// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetModel, DOMWidgetView, ViewList
} from './widget';

import {
    BoxModel
} from './widget_box';

import {
    TabBar
} from 'phosphor/lib/ui/tabbar';

import {
    Title
} from 'phosphor/lib/ui/title';

import {
    Widget
} from 'phosphor/lib/ui/widget';

import {
    each, enumerate
} from 'phosphor/lib/algorithm/iteration';

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

export
class TabView extends DOMWidgetView {
    /**
     * Public constructor.
     */
    initialize(parameters) {
        super.initialize(parameters)
        this.childrenViews = new ViewList(
            this.addChildView,
            this.removeChildView,
            this
        );
        this.listenTo(this.model, 'change:children',
            function(model, value) { this.childrenViews.update(value); });
        this.listenTo(this.model, 'change:_titles',
            function(model, value, options) { this.updateTitles(options); });
    }

    /**
     * Called when view is rendered.
     */
    render() {
        var parent = this;
        this.el.className = 'jupyter-widgets widget-container widget-tab';

        this.tabBar = new TabBar();
        this.tabBar.tabsMovable = false;
        this.tabBar.addClass('widget-tab-bar');
        this.tabBar.currentChanged.connect(this._onTabChanged, this);
        this.tabBar.tabCloseRequested.connect(this._onTabCloseRequested, this);

        this.tabContents = document.createElement('div');
        this.tabContents.className = 'widget-tab-contents';

        this.childrenViews.update(this.model.get('children'));

        this.displayed.then(function() {
            Widget.attach(parent.tabBar, parent.el)
            parent.el.appendChild(parent.tabContents);
        });
    }

    /**
     * Called when a child is added to children list.
     */
    addChildView(model) {
        var parent = this;

        return this.create_child_view(model).then(function(child) {
            var current = parent.el.querySelector('.mod-active');
            if (current) {
                current.classList.remove('mod-active');
            }

            child.el.classList.add('widget-tab-child');
            child.el.classList.add('mod-active');

            // TODO: add a child widget, rather than DOM nodes
            parent.tabContents.appendChild(child.el);
            let title = new Title({ label: '', closable: true })
            parent.tabBar.addTab(title);

            parent.displayed.then(function() {
                child.trigger('displayed', parent);
                parent.update();
            });

            child.on('remove', function() { parent.tabBar.removeTab(title); });

            return child;
        }).catch(utils.reject('Could not add child view to box', true));
    }

    removeChildView(child) { child.remove(); }

    /**
     * Update the contents of this view
     *
     * Called when the model is changed.  The model may have been
     * changed by another view or by a state update from the back-end.
     */
    update(options?) {
        this.updateTitles();
        this.updateSelectedIndex(options);
        return super.update();
    }

    /**
     * Updates the tab page titles.
     */
    updateTitles() {
        var titles = this.model.get('_titles') || {};
        for (let i = 0, len = this.tabBar.titles.length; i < len; i++) {
            this.tabBar.titles.at(i).label = titles[i] || (i + 1).toString();
        }
    }

    /**
     * Updates the selected index.
     */
    updateSelectedIndex(options?) {
        if (options === undefined || options.updated_view !== this) {
            var index = this.model.get('selected_index');
            if (typeof index === 'undefined') {
                index = 0;
            }
            if (0 <= index && index < this.tabBar.titles.length) {
                this.selectPage(index);
            }
        }
    }

    /**
     * Select a page.
     */
    selectPage(index) {
        this.tabBar.currentIndex = index;

        var actives = this.el.querySelectorAll('.mod-active');
        if (actives.length) {
            for (var i = 0, len = actives.length; i < len; i++) {
                actives[i].classList.remove('mod-active');
            }
        }

        var active = this.el.querySelectorAll('.widget-tab-child')[index];
        if (active) {
            active.classList.add('mod-active');
        }
    }

    remove() {
        /*
         * The tab bar needs to be disposed before its node is removed by the
         * super call, otherwise phosphor's Widget.detach will throw an error.
         */
        this.tabBar.dispose();
        /*
         * We remove this widget before removing the children as an optimization
         * we want to remove the entire container from the DOM first before
         * removing each individual child separately.
         */
        super.remove();
        this.childrenViews.remove();
    }

    _onTabChanged(sender, args) {
        this.model.set('selected_index', args.currentIndex, { updated_view: this });
        this.touch();
    }

    _onTabCloseRequested(sender, args) {
        /*
         * When a tab is removed, the titles dictionary must be reset for all
         * indices that are larger than the index of the tab that was removed.
         */
        var len = this.model.get('children').length;
        var titles = _.extend({}, this.model.get('_titles')) || {};
        delete titles[args.index];
        for (var i = args.index + 1; i < len; i++) {
            titles[i - 1] = titles[i];
        }
        delete titles[len - 1];

        var children = _.filter(
            this.model.get('children'),
            function(child, index) { return index !== args.index; }
        );

        this.model.set(
            { 'children': children, '_titles': titles },
            { updated_view: this }
        );
        this.touch();
    }

    childrenViews: ViewList;
    tabBar: TabBar;
    tabContents: HTMLDivElement;
}
