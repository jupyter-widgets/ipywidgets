// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    DOMWidgetView, ViewList, JupyterPhosphorWidget
} from '@jupyter-widgets/base';

import {
    BoxModel
} from './widget_box';

import {
    TabBar
} from '@phosphor/widgets';

import {
    TabPanel
} from './phosphor/tabpanel';

import {
    Accordion
} from './phosphor/accordion';

import {
    Panel, Widget
} from '@phosphor/widgets';

import {
    each, ArrayExt
} from '@phosphor/algorithm';

import {
    Message, MessageLoop
} from '@phosphor/messaging';

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

// We implement our own tab widget since Phoshpor's TabPanel uses an absolute
// positioning BoxLayout, but we want a more an html/css-based Panel layout.

export
class JupyterPhosphorAccordionWidget extends Accordion {
    constructor(options: JupyterPhosphorWidget.IOptions & Accordion.IOptions) {
        let view = options.view;
        delete options.view;
        super(options);
        this._view = view;
    }

    /**
     * Process the phosphor message.
     *
     * Any custom phosphor widget used inside a Jupyter widget should override
     * the processMessage function like this.
     */
    processMessage(msg: Message) {
        super.processMessage(msg);
        this._view.processPhosphorMessage(msg);
    }

    /**
     * Dispose the widget.
     *
     * This causes the view to be destroyed as well with 'remove'
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        super.dispose();
        if (this._view) {
            this._view.remove();
        }
        this._view = null;
    }

    private _view: DOMWidgetView;
}


export
class AccordionView extends DOMWidgetView {

    _createElement(tagName: string) {
        this.pWidget = new JupyterPhosphorAccordionWidget({ view: this });
        return this.pWidget.node;
    }

    _setElement(el: HTMLElement) {
        if (this.el || el !== this.pWidget.node) {
            // Accordions don't allow setting the element beyond the initial creation.
            throw new Error('Cannot reset the DOM element.');
        }

        this.el = this.pWidget.node;
        this.$el = $(this.pWidget.node);
     }

    initialize(parameters){
        super.initialize(parameters);
        this.children_views = new ViewList(this.add_child_view, this.remove_child_view, this);
        this.listenTo(this.model, 'change:children', () => this.updateChildren());
        this.listenTo(this.model, 'change:selected_index', () => this.update_selected_index());
        this.listenTo(this.model, 'change:_titles', () => this.update_titles());
    }

    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        let accordion = this.pWidget;
        accordion.addClass('jupyter-widgets');
        accordion.addClass('widget-accordion');
        accordion.addClass('widget-container');
        accordion.selection.selectionChanged.connect((sender) => {
            if (!this.updatingChildren) {
                this.model.set('selected_index', accordion.selection.index);
                this.touch();
            }
        });

        this.children_views.update(this.model.get('children'));
        this.update_titles();
        this.update_selected_index();
    }

    /**
     * Update children
     */
    updateChildren() {
        // While we are updating, the index may not be valid, so deselect the
        // tabs before updating so we don't get spurious changes in the index,
        // which would then set off another sync cycle.
        this.updatingChildren = true;
        this.pWidget.selection.index = null;
        this.children_views.update(this.model.get('children'));
        this.update_selected_index();
        this.updatingChildren = false;
    }

    /**
     * Set header titles
     */
    update_titles() {
        let collapsed = this.pWidget.collapseWidgets;
        let titles = this.model.get('_titles');
        for (let i = 0; i < collapsed.length; i++) {
            if (titles[i] !== void 0) {
                collapsed[i].widget.title.label = titles[i];
            }
        }
    }

    /**
     * Make the rendering and selected index consistent.
     */
    update_selected_index() {
        this.pWidget.selection.index = this.model.get('selected_index');
    }

    /**
     * Called when a child is removed from children list.
     */
    remove_child_view(view) {
        this.pWidget.removeWidget(view.pWidget);
        view.remove();
    }

    /**
     * Called when a child is added to children list.
     */
    add_child_view(model, index) {
        // Placeholder widget to keep our position in the tab panel while we create the view.
        let accordion = this.pWidget;
        let placeholder = new Widget();
        placeholder.title.label = this.model.get('_titles')[index] || '';
        accordion.addWidget(placeholder);
        return this.create_child_view(model).then((view: DOMWidgetView) => {
            let widget = view.pWidget;
            widget.title.label = placeholder.title.label;
            let collapse = accordion.collapseWidgets[accordion.indexOf(placeholder)];
            collapse.widget = widget;
            placeholder.dispose();
            return view;
        }).catch(utils.reject('Could not add child view to box', true));
    }

    remove() {
        this.children_views = null;
        super.remove();
    }

    children_views: ViewList<DOMWidgetView>;
    pWidget: Accordion;
    updatingChildren: boolean;
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
class JupyterPhosphorTabPanelWidget extends TabPanel {
    constructor(options: JupyterPhosphorWidget.IOptions & TabPanel.IOptions) {
        let view = options.view;
        delete options.view;
        super(options);
        this._view = view;
        // We want the view's messages to be the messages the tabContents panel
        // gets.
        MessageLoop.installMessageHook(this.tabContents, (handler, msg) => {
            // There may be times when we want the view's handler to be called
            // *after* the message has been processed by the widget, in which
            // case we'll need to revisit using a message hook.
            this._view.processPhosphorMessage(msg);
            return true;
        });
    }

    /**
     * Dispose the widget.
     *
     * This causes the view to be destroyed as well with 'remove'
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        super.dispose();
        if (this._view) {
            this._view.remove();
        }
        this._view = null;
    }

    private _view: DOMWidgetView;
}




export
class TabView extends DOMWidgetView {

    _createElement(tagName: string) {
        this.pWidget = new JupyterPhosphorTabPanelWidget({
            view: this,
        });
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
            (view) => {view.remove();},
            this
        );
        this.listenTo(this.model, 'change:children', () => this.updateTabs());
        this.listenTo(this.model, 'change:_titles', () => this.updateTitles());
    }

    /**
     * Called when view is rendered.
     */
    render() {
        super.render();
        let tabs = this.pWidget;
        tabs.addClass('jupyter-widgets');
        tabs.addClass('widget-container');
        tabs.addClass('widget-tab');
        tabs.tabsMovable = true;
        tabs.tabBar.insertBehavior = 'none'; // needed for insert behavior, see below.
        tabs.tabBar.currentChanged.connect(this._onTabChanged, this);
        tabs.tabBar.tabMoved.connect(this._onTabMoved, this);

        tabs.tabBar.addClass('widget-tab-bar');
        tabs.tabContents.addClass('widget-tab-contents');

        // TODO: expose this option in python
        tabs.tabBar.tabsMovable = false;


        this.updateTabs();
        this.update();
    }

    /**
     * Render tab views based on the current model's children.
     */
    updateTabs() {
        // While we are updating, the index may not be valid, so deselect the
        // tabs before updating so we don't get spurious changes in the index,
        // which would then set off another sync cycle.
        this.updatingTabs = true;
        this.pWidget.currentIndex = null;
        this.childrenViews.update(this.model.get('children'));
        this.pWidget.currentIndex = this.model.get('selected_index');
        this.updatingTabs = false;
    }

    /**
     * Called when a child is added to children list.
     */
    addChildView(model, index) {
        // Placeholder widget to keep our position in the tab panel while we create the view.
        let label = this.model.get('_titles')[index] || '';
        let tabs = this.pWidget;
        let placeholder = new Widget();
        placeholder.title.label = label;
        tabs.addWidget(placeholder);
        return this.create_child_view(model).then((view: DOMWidgetView) => {
            let widget = view.pWidget;
            widget.title.label = placeholder.title.label;
            widget.title.closable = false;

            let i = ArrayExt.firstIndexOf(tabs.widgets, placeholder);
            // insert after placeholder so that if placholder is selected, the
            // real widget will be selected now (this depends on the tab bar
            // insert behavior)
            tabs.insertWidget(i+1, widget);
            placeholder.dispose();
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
        let titles = this.model.get('_titles') || {};
        each(this.pWidget.widgets, (widget, i) => {
            widget.title.label = titles[i] || '';
        });
    }

    /**
     * Updates the selected index.
     */
    updateSelectedIndex() {
        this.pWidget.currentIndex = this.model.get('selected_index');
    }

    remove() {
        this.childrenViews = null;
        super.remove();
    }

    _onTabChanged(sender: TabBar<Widget>, args: TabBar.ICurrentChangedArgs<Widget>) {
        if (!this.updatingTabs) {
            let i = args.currentIndex;
            this.model.set('selected_index', i === -1 ? null : i);
            this.touch();
        }
    }

    /**
     * Handle the `tabMoved` signal from the tab bar.
     */
    _onTabMoved(sender: TabBar<Widget>, args: TabBar.ITabMovedArgs<Widget>): void {
        let children = this.model.get('children').slice();
        ArrayExt.move(children, args.fromIndex, args.toIndex);
        this.model.set('children', children);
        this.touch();
    }

    updatingTabs: boolean = false;
    childrenViews: ViewList<DOMWidgetView>;
    pWidget: JupyterPhosphorTabPanelWidget;
}
