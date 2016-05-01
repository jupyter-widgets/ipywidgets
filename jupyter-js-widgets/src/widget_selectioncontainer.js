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
        }).catch(utils.reject('Couldn\'t add child view to box', true));
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
