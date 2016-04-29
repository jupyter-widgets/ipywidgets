// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var widget = require('./widget');
var utils = require('./utils');
var box = require('./widget_box');
var _ = require('underscore');
var TabBar = require('phosphor-tabs').TabBar;
var Title = require('phosphor-widget').Title;

var SelectionContainerModel = box.BoxModel.extend({
    defaults: _.extend({}, box.BoxModel.prototype.defaults, {
        _model_name: 'SelectionContainerModel',
        selected_index: 0,
        _titles: {}
    })
});

var AccordionModel = SelectionContainerModel.extend({
    defaults: _.extend({}, SelectionContainerModel.prototype.defaults, {
        _model_name: 'AccordionModel',
        _view_name: 'AccordionView'
    })
});

var AccordionView = widget.DOMWidgetView.extend({
    initialize: function(){
        AccordionView.__super__.initialize.apply(this, arguments);

        this.containers = [];
        this.model_containers = {};
        this.children_views = new widget.ViewList(this.add_child_view, this.remove_child_view, this);
        this.listenTo(this.model, 'change:children', function(model, value, options) {
            this.children_views.update(value);
        }, this);
    },

    render: function() {
        /**
         * Called when view is rendered.
         */
        var guid = 'panel-group' + utils.uuid();
        this.el.id = guid;
        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('panel-group');

        this.listenTo(this.model, 'change:selected_index', function(model, value, options) {
            this.update_selected_index(options);
        }, this);
        this.listenTo(this.model, 'change:_titles', function(model, value, options) {
            this.update_titles(options);
        }, this);
        this.on('displayed', function() {
            this.update_titles();
        }, this);
        this.children_views.update(this.model.get('children'));
    },

    /**
     * Set tab titles
     */
    update_titles: function() {
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
    },

    /**
     * Only update the selection if the selection wasn't triggered
     * by the front-end.  It must be triggered by the back-end.
     */
    update_selected_index: function(options) {
        if (options === undefined || options.updated_view != this) {
            var old_index = this.model.previous('selected_index');
            var new_index = this.model.get('selected_index');
            /* old_index can be out of bounds, this check avoids raising
               a javascript error. */
            this.collapseTab(old_index);
            this.expandTab(new_index);
        }
    },

    /**
     * Collapses an accordion tab.
     * @param  {number} index
     */
    collapseTab: function(index) {
        var page = this.containers[index].children('.collapse');

        if (page.hasClass('in')) {
            page.removeClass('in');
            page.collapse('hide');
        }
    },

    /**
     * Expands an accordion tab.
     * @param  {number} index
     */
    expandTab: function(index) {
        var page = this.containers[index].children('.collapse');

        if (!page.hasClass('in')) {
            page.addClass('in');
            page.collapse('show');
        }
    },

    remove_child_view: function(view) {
        /**
         * Called when a child is removed from children list.
         * TODO: does this handle two different views of the same model as children?
         */
        var model = view.model;
        var accordion_group = this.model_containers[model.id];
        this.containers.splice(accordion_group.container_index, 1);
        delete this.model_containers[model.id];
        accordion_group.remove();
    },

    add_child_view: function(model) {
        /**
         * Called when a child is added to children list.
         */
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
        accordion_toggle.textContent('Page ' + index);
        accordion_heading.appendChild(accordion_toggle);

        var accordion_body = document.createElement('div');
        accordion_body.id = uuid;
        accordion_body.className = 'panel-collapse collapse';
        accordion_group.appendChild(accordion_body);

        var accordion_inner = document.createElement('div');
        accordion_inner.classList.add('panel-body');
        accordion_body.appendChild(accordion_inner);

        var container_index = this.containers.push(accordion_group) - 1;
        accordion_group.container_index = container_index;
        this.model_containers[model.id] = accordion_group;

        var dummy = document.createElement('div');
        accordion_inner.appendChild(dummy);
        return this.create_child_view(model).then(function(view) {

            dummy.parentNode.replaceChild(dummy, view.el);

            that.update_selected_index();
            that.update_titles();

            // Trigger the displayed event of the child view.
            that.displayed.then(function() {
                view.trigger('displayed', that);
            });
            return view;
        }).catch(utils.reject('Could not add child view to box', true));
    },

    remove: function() {
        /**
         * We remove this widget before removing the children as an optimization
         * we want to remove the entire container from the DOM first before
         * removing each individual child separately.
         */
        AccordionView.__super__.remove.apply(this, arguments);
        this.children_views.remove();
    }
});

var TabModel = SelectionContainerModel.extend({
    defaults: _.extend({}, SelectionContainerModel.prototype.defaults, {
        _model_name: 'TabModel',
        _view_name: 'TabView'
    })
});

var TabView = widget.DOMWidgetView.extend({
    initialize: function() {
        /**
         * Public constructor.
         */
        TabView.__super__.initialize.apply(this, arguments);
        this.childrenViews = new widget.ViewList(
            this.addChildView,
            this.removeChildView,
            this
        );
        this.listenTo(this.model, 'change:children',
            function(model, value) { this.childrenViews.update(value); },
            this
        );
        this.listenTo(this.model, 'change:_titles',
            function(model, value, options) { this.updateTitles(options); },
            this
        );
    },

    render: function() {
        /**
         * Called when view is rendered.
         */
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
            parent.tabBar.attach(parent.el);
            parent.el.appendChild(parent.tabContents);
        });
    },

    addChildView: function(model) {
        /**
         * Called when a child is added to children list.
         */
        var parent = this;

        return this.create_child_view(model).then(function(child) {
            var current = parent.el.querySelector('.mod-active');
            if (current) {
                current.classList.remove('mod-active');
            }

            child.el.classList.add('widget-tab-child');
            child.el.classList.add('mod-active');

            parent.tabContents.appendChild(child.el);
            parent.tabBar.addItem({
                title: new Title({ text: '', closable: true })
            });
            var tab = parent.tabBar.itemAt(parent.tabBar.itemCount() - 1);

            parent.displayed.then(function() {
                child.trigger('displayed', parent);
                parent.update();
            });

            child.on('remove', function() { parent.tabBar.removeItem(tab); });

            return child;
        }).catch(utils.reject('Could not add child view to box', true));
    },

    removeChildView: function(child) { child.remove(); },

    update: function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        this.updateTitles();
        this.updateSelectedIndex(options);
        return TabView.__super__.update.call(this);
    },

    /**
     * Updates the tab page titles.
     */
    updateTitles: function() {
        var titles = this.model.get('_titles') || {};
        for (var i = this.tabBar.itemCount() - 1; i > -1; i--) {
            this.tabBar.itemAt(i).title.text = titles[i] || (i + 1) + '';
        }
    },

    /**
     * Updates the selected index.
     */
    updateSelectedIndex: function(options) {
        if (options === undefined || options.updated_view !== this) {
            var index = this.model.get('selected_index');
            if (typeof index === 'undefined') {
                index = 0;
            }
            if (0 <= index && index < this.tabBar.itemCount()) {
                this.selectPage(index);
            }
        }
    },

    /**
     * Select a page.
     */
    selectPage: function(index) {
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
    },

    remove: function() {
        /*
         * The tab bar needs to be disposed before its node is removed by the
         * super call, otherwise phosphor's Widget.detach will throw an error.
         */
        this.tabBar.dispose();
        /**
         * We remove this widget before removing the children as an optimization
         * we want to remove the entire container from the DOM first before
         * removing each individual child separately.
         */
        TabView.__super__.remove.apply(this, arguments);
        this.childrenViews.remove();
    },

    _onTabChanged: function(sender, args) {
        this.model.set('selected_index', args.index, { updated_view: this });
        this.touch();
    },

    _onTabCloseRequested: function(sender, args) {
        /*
         * When a tab is removed, the titles dictionary must be reset for all
         * indices that are larger than the index of the tab that was removed.
         */
        var len = this.model.get('children').length;
        var titles = this.model.get('_titles') || {};
        delete titles[args.index];
        for (var i = args.index + 1; i < len; i++) {
            titles[i - 1] = titles[i];
            delete titles[i];
        }

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
});

module.exports = {
    SelectionContainerModel: SelectionContainerModel,
    AccordionModel: AccordionModel,
    AccordionView: AccordionView,
    TabModel: TabModel,
    TabView: TabView
};
