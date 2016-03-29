// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

var widget = require('./widget');
var utils = require('./utils');
var box = require('./widget_box');
var $ = require('./jquery');
var _ = require('underscore');

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
        this.childrenViews = new widget.ViewList(this.addChildView, this.removeChildView, this);
        this.accordionButtons = [];
        this.accordionContainers = [];
        this.viewIndices = {};

        this.listenTo(this.model, 'change:children', function(model, value, options) {
            this.childrenViews.update(value);
        }, this);
        this.listenTo(this.model, 'change:selected_index', this.updateSelectedIndex, this);
        this.listenTo(this.model, 'change:_titles', this.updateTitles, this);
        this.listenTo('displayed', this.updateTitles, this);
        this.childrenViews.update(this.model.get('children'));
    },

    render: function() {
        this.el.className = 'widget-accordion';
    },

    updateTitles: function(model, value, options) {
        var titles = this.model.get('_titles');
        this.accordionButtons.forEach(function(el, index) {
            if (titles.length > index) {
                el.innerText = titles[index];
            } else {
                el.innerText = 'Tab ' + String(index);
            }
        }, this);
    },

    updateSelectedIndex: function(model, value, options) {
        if (options === undefined || options.updated_view != this) {
            this.activateTab(this.model.get('selected_index'));
        }
    },

    activateTab: function (index) {
        this.accordionContainers.forEach(function(el, subIndex) {
            if (subIndex === index) {
                this.accordionButtons[subIndex].classList.add('active');
                this.accordionContainers[subIndex].classList.add('active');
                this.accordionContainers[subIndex].style.display = '';
            } else {
                this.accordionButtons[subIndex].classList.remove('active');
                this.accordionContainers[subIndex].classList.remove('active');
                this.accordionContainers[subIndex].style.display = 'none';
            }
        }, this);
    },

    removeChildView: function(view) {
        var index = this.viewIndices[view.id];
        delete this.viewIndices[view.id];

        this.accordionButtons.splice(index, 1);
        this.accordionContainers.splice(index, 1);
    },

    addChildView: function(model) {
        return this.create_child_view(model).then((function(view) {
            var index = this.accordionContainers.length;
            this.viewIndices[view.id] = index;

            var button = document.createElement('button');
            button.className = 'tabButton';
            this.accordionButtons.push(button);
            this.el.appendChild(button);

            var container = document.createElement('div');
            container.className = 'container';
            this.accordionContainers.push(container);
            this.el.appendChild(container);

            container.appendChild(view.el);

            // Trigger the displayed event of the child view.
            this.displayed.then(function() {
                view.trigger('displayed', that);
            });
            return view;

            // Listen for the tab button click
            button.onclick = (function() {
                this.model.set('selected_index', index);
                view.touch();
            }).bind(this);
        }).bind(this))
            .catch(utils.reject('Couldn\'t add child view to box', true));
    },

    /**
     * We remove this widget before removing the children as an optimization
     * we want to remove the entire container from the DOM first before
     * removing each individual child separately.
     */
    remove: function() {
        AccordionView.__super__.remove.apply(this, arguments);
        this.childrenViews.remove();
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
        tab_text.onclick = function() {
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
    }
});

module.exports = {
    SelectionContainerModel: SelectionContainerModel,
    AccordionModel: AccordionModel,
    AccordionView: AccordionView,
    TabModel: TabModel,
    TabView: TabView
};
