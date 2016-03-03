// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var widget = require('./widget');
var utils = require('./utils');
var box = require('./widget_box');
var _ = require('underscore');

var SelectionContainerModel = box.BoxModel.extend({
    defaults: _.extend({}, box.BoxModel.prototype.defaults, {
        _model_name: 'SelectionContainerModel',
        selected_index: 0,
        _titles: {}
    }),
});

var AccordionModel = SelectionContainerModel.extend({
    defaults: _.extend({}, SelectionContainerModel.prototype.defaults, {
        _model_name: 'AccordionModel',
        _view_name: 'AccordionView'
    }),
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
        }).catch(utils.reject('Couldn\'t add child view to box', true));
    },

    remove: function() {
        /**
         * We remove this widget before removing the children as an optimization
         * we want to remove the entire container from the DOM first before
         * removing each individual child separately.
         */
        AccordionView.__super__.remove.apply(this, arguments);
        this.children_views.remove();
    },
});

var TabModel = SelectionContainerModel.extend({
    defaults: _.extend({}, SelectionContainerModel.prototype.defaults, {
        _model_name: 'TabModel',
        _view_name: 'TabView'
    }),
});

var TabView = widget.DOMWidgetView.extend({
    initialize: function() {
        /**
         * Public constructor.
         */
        TabView.__super__.initialize.apply(this, arguments);
        this.containers = [];
        this.children_views = new widget.ViewList(this.add_child_view, this.remove_child_view, this);
        this.listenTo(this.model, 'change:children', function(model, value) {
            this.children_views.update(value);
        }, this);
    },

    render: function() {
        /**
         * Called when view is rendered.
         */
        var uuid = 'tabs'+utils.uuid();

        this.tabs = document.createElement('div');
        this.tabs.id = uuid;
        this.tabs.classList.add('nav');
        this.tabs.classList.add('nav-tabs');
        this.el.appendChild(this.tabs);

        this.tab_contents = document.createElement('div');
        this.tab_contents.setAttribute('id', uuid + 'Content');
        this.el.appendChild(this.tab_contents);

        this.children_views.update(this.model.get('children'));
    },

    update_attr: function(name, value) { // TODO: Deprecated in 5.0
        /**
         * Set a css attr of the widget view.
         */
        if (['padding', 'margin', 'height', 'width'].indexOf(name) !== -1) {
            this.el.style[name] = value;
        } else {
            this.tabs.style[name] = value;
        }
    },

    remove_child_view: function(view) {
        /**
         * Called when a child is removed from children list.
         */
        this.containers.splice(view.parent_tab.tab_text_index, 1);
        view.parent_tab.remove();
        view.parent_container.remove();
        view.remove();
    },

    add_child_view: function(model) {
        /**
         * Called when a child is added to children list.
         */
        var index = this.containers.length;
        var uuid = utils.uuid();

        var that = this;
        var tab = document.createElement('li');
        tab.style['list-style-type'] = 'none';
        this.tabs.appendChild(tab);

        var tab_text = document.createElement('a');
        tab_text.setAttribute('href', '#' + uuid);
        tab_text.setAttribute('data-toggle', 'tab');
        tab_text.textContent = 'Page ' + index;
        tab.appendChild(tab_text);
        tab_text.onclick = () => {
          that.model.set('selected_index', index, {updated_view: that});
          that.touch();
          that.select_page(index);
        };

        tab.tab_text_index = that.containers.push(tab_text) - 1;

        var dummy = document.createElement('div');

        var contents_div = document.createElement('div');
        contents_div.id = uuid;
        contents_div.classList.add('tab-pane');
        contents_div.classList.add('fade');
        contents_div.appendChild(dummy);
        that.tab_contents.appendChild(contents_div);

        this.update();
        return this.create_child_view(model).then(function(view) {
            dummy.replaceWith(view.$el);
            view.parent_tab = tab;
            view.parent_container = contents_div;

            // Trigger the displayed event of the child view.
            that.displayed.then(function() {
                view.trigger('displayed', that);
                that.update();
            });
            return view;
        }).catch(utils.reject('Could not add child view to box', true));
    },

    update: function(options) {
        /**
         * Update the contents of this view
         *
         * Called when the model is changed.  The model may have been
         * changed by another view or by a state update from the back-end.
         */
        this.update_titles();
        this.update_selected_index(options);
        return TabView.__super__.update.apply(this);
    },

    /**
     * Updates the tab page titles.
     */
    update_titles: function() {
        var titles = this.model.get('_titles');
        var that = this;
        _.each(titles, function(title, page_index) {
           var tab_text = that.containers[page_index];
            if (tab_text !== undefined) {
                tab_text.text(title);
            }
        });
    },

    /**
     * Updates the tab page titles.
     */
    update_selected_index: function(options) {
        if (options === undefined || options.updated_view != this) {
            var selected_index = this.model.get('selected_index');
            if (0 <= selected_index && selected_index < this.containers.length) {
                this.select_page(selected_index);
            }
        }
    },

    select_page: function(index) {
        /**
         * Select a page.
         */
        var tab_li = this.tabs.getElementsByClassName('li');
        if (tab_li.length) {
          tab_li[0].classList.remove('active');
        }
        this.containers[index].tab('show');
    },

    remove: function() {
        /**
         * We remove this widget before removing the children as an optimization
         * we want to remove the entire container from the DOM first before
         * removing each individual child separately.
         */
        TabView.__super__.remove.apply(this, arguments);
        this.children_views.remove();
    },
});

module.exports = {
    SelectionContainerModel: SelectionContainerModel,
    AccordionModel: AccordionModel,
    AccordionView: AccordionView,
    TabModel: TabModel,
    TabView: TabView
};
