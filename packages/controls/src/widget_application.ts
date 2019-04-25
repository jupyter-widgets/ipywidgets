import {
    DescriptionView, DescriptionStyleModel,
} from './widget_description';

import {
    CoreDescriptionModel, CoreDOMWidgetModel
} from './widget_core';

import {
   DOMWidgetModel, DOMWidgetView, ViewList, unpack_models
} from '@jupyter-widgets/base';

import {
  Menu, Widget, MenuBar
} from '@phosphor/widgets';

import {
    IconModel, IconView
} from './widget_icon';

import {
    MenuModel, MenuView
} from './widget_menu';

import * as screenfull from 'screenfull';

/*import {
  CommandRegistry
} from '@phosphor/commands';
*/

import {
  MessageLoop
} from '@phosphor/messaging';


export
class ApplicationModel extends CoreDescriptionModel {
    defaults() {
        return {...super.defaults(),
            _model_name: 'ApplicationModel',
            _view_name: 'ApplicationView',
            menubar: null,
            toolbar: null,
            central_widget: null,
        };
    }
    static serializers = {
        ...CoreDescriptionModel.serializers,
        menubar: {deserialize: unpack_models},
        toolbar: {deserialize: unpack_models},
        central_widget: {deserialize: unpack_models},
    };
}

export
class ApplicationView extends DescriptionView {
    async render() {
        super.render();

        this.el.classList.add('jupyter-widgets');
        // this.el.classList.add('widget-inline-vbox');
        // this.el.classList.add('widget-toggle-buttons');
        this.el.classList.add('widget-application');

        this.el_toolbar = document.createElement('div')
        this.el_toolbar.classList.add('widget-inline-hbox');
        this.el_toolbar.classList.add('jupyter-widgets')
        this.el_toolbar.classList.add('widget-container')
        this.el_toolbar.classList.add('widget-toolbar')

        this.el_menubar = document.createElement('div')
        // this.el_menubar.classList.add('widget-inline-vbox');
        // this.el_menubar.classList.add('jupyter-widgets')
        // this.el_menubar.classList.add('widget-container')
        // this.el_menubar.classList.add('widget-toolbar')

        this.el.appendChild(this.el_menubar);
        this.el.appendChild(this.el_toolbar);

        // this.el.appendChild(this.el_content)


        var toolbarViewList = new ViewList<DOMWidgetView>(async (model, index) => {
            var viewPromise  = <Promise<DOMWidgetView>> this.create_child_view(model);
            var view : DOMWidgetView = await viewPromise;
            view.el.addEventListener('jupyter-widgets-action', this.onChildCommandEvent.bind(this));
            if(view.el.nodeName === 'BUTTON') {
                view.el.onclick = () => {
                    console.log('click', index)
                    var action = model.get('default_action');
                    if(!action)
                        return;
                    var command = action.get('command');
                    if(!command)
                        return;
                    if(this.central_widget_view[command]) {
                        this.central_widget_view[command]()
                    } else if(this[command]) {
                        this[command]();
                    } else if(!command) {
                        console.log('no event handler found for command, sending event ', command);
                        this.central_widget_view.trigger(command)
                        return;
                    }
                }
            }
            this.el_toolbar.appendChild(view.el)
            this.displayed.then(() => {
                view.trigger('displayed', this);
            });
            return viewPromise;

        }, () => {

        }, 1);
        toolbarViewList.update(this.model.get('toolbar'));//.map((tuple) => tuple[0]));

        let central_widget = this.model.get('central_widget');
        this.central_widget_view = <DOMWidgetView> await this.create_child_view(central_widget);
        this.el.appendChild(this.central_widget_view.el)
        this.displayed.then(() => {
            this.central_widget_view.trigger('displayed', this);
        });/**/

        this.update();
    }

    onChildCommandEvent(e) {
        console.log('custom event command', e)
        var action = e.detail.action;
        var command = action.get('command');
        if(command !== null) {
            var default_command = `default_action_${command}`;
            // simple way to handle commands
            if(this.central_widget_view[command]) {
                this.central_widget_view[command]();
            } else if(this[default_command]) {
                this[default_command]();
            }
        }

        // in case the widget that wants to receive it can be down the DOM hierarchy, it can listen to a 
        // DOM event.
        // we 'clone' the event, and send it down the central_widget_view, we don't want it to bubble up
        // otherwise we receive it again
        let event = new CustomEvent('jupyter-widgets-action', {bubbles: false, detail: e.detail});
        this.central_widget_view.el.dispatchEvent(event);
    }

    default_action_fullscreen() {
        var el = this.central_widget_view.el;
        var old_width = el.style.width
        var old_height = el.style.height
        var restore = () => {
            if(!screenfull.isFullscreen) {
                el.style.width = old_width;
                el.style.height = old_height
                screenfull.off('change', restore)
            } else {
                el.style.width = '100vw'
                el.style.height = '100vh'
            }
            MessageLoop.postMessage(this.central_widget_view.pWidget, Widget.ResizeMessage.UnknownSize);
            // phosphor_messaging.MessageLoop.postMessage(this.childView.pWidget, phosphor_widget.Widget.ResizeMessage.UnknownSize);
        }
        screenfull.onchange(restore)
        screenfull.request(el);

    }

    default_action_restore() {
        // var el = this.el;
        // var previous_body_elements = body.childNodes;
        // while (document.body.firstChild)
        //     document.body.removeChild(document.body.firstChild);
        // document.body.appendChild(el);
        if(this.last_parent !== null) {
            document.body.removeChild(document.body.firstChild);
            this.last_body_elements.forEach((node) => {
                document.body.appendChild(node);
            })
            // TODO: are we really the last child?
            this.last_parent.appendChild(this.el)
            this.last_parent = null;
            MessageLoop.postMessage(this.pWidget, Widget.ResizeMessage.UnknownSize);
        }
    }


    default_action_maximize() {
        var el = this.el;
        if (this.last_parent === null) {
            this.last_parent = this.el.parentNode;
            this.last_body_elements = Array.prototype.slice.call(document.body.childNodes);
            while (document.body.firstChild)
                document.body.removeChild(document.body.firstChild);
            document.body.appendChild(el);
            MessageLoop.postMessage(this.pWidget, Widget.ResizeMessage.UnknownSize);
        }


    }

    
    async update(options?) {
        var menuRoot = this.model.get('menubar');
        if(menuRoot) {
            var menuRootView = <MenuView> await this.create_child_view(menuRoot);
            var menuBar = new MenuBar();
            // let commands = new CommandRegistry();
            let counter = 0;
            var menuItems = menuRoot
            // if(menuRootView.menu.
            console.log(menuRootView.menu)
            menuRootView.menu.items.forEach((menuItem) => {
                if(menuItem.type == "submenu") {
                    menuBar.addMenu(menuItem.submenu);
                    menuItem.submenu.node.addEventListener('jupyter-widgets-action', this.onChildCommandEvent.bind(this));
                    // menuItem.submenu.node.addEventListener('command', this.onChildCommandEvent);
                    (window as any).last_menu_item = menuItem;
                    console.log(menuItem.submenu.node)
                }
            })
            // this.el_menubar.appendChild(menuBar.node)
            
            this.displayed.then(() => {
                Widget.attach(menuBar, this.el_menubar);
                // menuBar.node.addEventListener('command', this.onChildCommandEvent)
            })
        }
    }
    menu: Menu;
    last_body_elements: Node[] = null;
    last_parent: Node = null;
    el_toolbar: HTMLDivElement;
    el_menubar: HTMLDivElement;
    central_widget_view: DOMWidgetView;

}
