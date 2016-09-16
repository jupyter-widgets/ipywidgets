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
        this.containers = [];
        this.model_containers = {};
        this.children_views = new ViewList(this.add_child_view, this.remove_child_view, this);
        this.listenTo(this.model, 'change:children', function(model, value, options) {
            this.children_views.update(value);
        });
    }

    /**
     * Called when view is rendered.
     */
    render() {
        var guid = 'panel-group' + utils.uuid();
        this.el.id = guid;
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('panel-group');

        this.listenTo(this.model, 'change:selected_index', function(model, value, options) {
            this.update_selected_index(options);
        });
        this.listenTo(this.model, 'change:_titles', function(model, value, options) {
            this.update_titles(options);
        });
        this.on('displayed', function() {
            this.update_titles();
        });
        this.children_views.update(this.model.get('children'));
    }

    /**
     * Set tab titles
     */
    update_titles() {
        var titles = this.model.get('_titles');
        var that = this;
        _.each(titles, function(title, page_index) {
            var accordion = that.containers[page_index];
            if (accordion !== undefined) {
                accordion
                    .children('.panel-heading')
                    .find('.accordion-toggle')
                    .text(title);
            }
        });
    }

    /**
     * Only update the selection if the selection wasn't triggered
     * by the front-end.  It must be triggered by the back-end.
     */
    update_selected_index(options?) {
        if (options === undefined || options.updated_view != this) {
            var old_index = this.model.previous('selected_index');
            var new_index = this.model.get('selected_index');
            /* old_index can be out of bounds, this check avoids raising
               a javascript error. */
            if (0 <= old_index && old_index < this.containers.length) {
                this.collapseTab(old_index);
            }
            if (0 <= new_index && new_index < this.containers.length) {
                this.expandTab(new_index);
            }
        }
    }

    /**
     * Collapses an accordion tab.
     * @param  {number} index
     */
    collapseTab(index) {
        var pages = this.containers[index].querySelectorAll('.collapse');
        for (var page of pages) {
            if (page.classList.contains('in')) {
                page.classList.remove('in');
                //page.style['visibility'] = 'hidden';
            }
        }
    }

    /**
     * Expands an accordion tab.
     * @param  {number} index
     */
    expandTab(index) {
        var pages = this.containers[index].querySelectorAll('.collapse');
        for (var page of pages) {
            if (!page.classList.contains('in')) {
                page.classList.add('in');
                //page.style['visibility'] = 'visible';
            }
        }
    }

    /**
     * Called when a child is removed from children list.
     * TODO: does this handle two different views of the same model as children?
     */
    remove_child_view(view) {
        var model = view.model;
        var accordion_group = this.model_containers[model.id];
        this.containers.splice(accordion_group['container_index'], 1);
        delete this.model_containers[model.id];
        accordion_group.remove();
    }

    /**
     * Called when a child is added to children list.
     */
    add_child_view(model) {
        var index = this.containers.length;
        var uuid = utils.uuid();
        var accordion_group = document.createElement('div');
        accordion_group.className = 'panel panel-default';
        this.el.appendChild(accordion_group);

        var accordion_heading = document.createElement('div');
        accordion_heading.classList.add('panel-heading');
        accordion_group.appendChild(accordion_heading);

        var that = this;
        var accordion_toggle = document.createElement('a');
        accordion_toggle.classList.add('accordion-toggle');
        accordion_toggle.setAttribute('data-toggle', 'collapse');
        accordion_toggle.setAttribute('data-parent', '#' + this.el.id);
        accordion_toggle.setAttribute('href', '#' + uuid);
        accordion_toggle.onclick = function() {
          that.model.set('selected_index', index, {updated_view: that});
          that.touch();
        };
        accordion_toggle.textContent = `Page ${index}`;
        accordion_heading.appendChild(accordion_toggle);

        var accordion_body = document.createElement('div');
        accordion_body.id = uuid;
        accordion_body.className = 'panel-collapse collapse';
        accordion_group.appendChild(accordion_body);

        var accordion_inner = document.createElement('div');
        accordion_inner.classList.add('panel-body');
        accordion_body.appendChild(accordion_inner);

        var container_index = this.containers.push(accordion_group) - 1;
        // TODO: Fix container_index to be an attached property or something that we keep track of, rather than an attribute directly on the node.
        accordion_group['container_index'] = container_index;
        this.model_containers[model.id] = accordion_group;

        var dummy = document.createElement('div');
        accordion_inner.appendChild(dummy);
        return this.create_child_view(model).then(function(view) {

            dummy.parentNode.replaceChild(view.el, dummy);

            that.update_selected_index();
            that.update_titles();

            // Trigger the displayed event of the child view.
            that.displayed.then(function() {
                view.trigger('displayed', that);
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

    containers: any[];
    model_containers: any;
    children_views: ViewList;
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

        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-tab');

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
