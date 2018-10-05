import {
    DescriptionView, DescriptionStyleModel
} from './widget_description';

import {
    CoreDescriptionModel, CoreDOMWidgetModel
} from './widget_core';

import {
   DOMWidgetModel, DOMWidgetView, unpack_models
} from '@jupyter-widgets/base';

import {
  Menu, Widget
} from '@phosphor/widgets';

import {
    IconModel, IconView
} from './widget_icon';

import {
  CommandRegistry
} from '@phosphor/commands';

import {
  MessageLoop
} from '@phosphor/messaging';


export
class MenuItemModel extends CoreDescriptionModel {
    defaults() {
        return {...super.defaults(),
            _model_name: 'MenuItemModel',
            _view_name: 'MenuItemView'
        };
    }
    static serializers = {
        ...CoreDescriptionModel.serializers,
        items: {deserialize: unpack_models},
    };
}


export
class MenuModel extends CoreDescriptionModel {
    defaults() {
        return {...super.defaults(),
            _model_name: 'MenuModel',
            _view_name: 'MenuView',
            checked: null,
            icon: null,
            disabled: false,
        };
    }
    static serializers = {
        ...CoreDOMWidgetModel.serializers,
        items: {deserialize: unpack_models},
        icon: {deserialize: unpack_models},
    };
}

export
class MenuView extends DOMWidgetView {
    render() {
        super.render();

        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-toggle-buttons');

        this.update();
    }

    buildMenu(menu: MenuModel, commands: CommandRegistry, command_prefix: String) {
        let menuWidget = new Menu({commands: commands});
        let items: Array<MenuModel> = menu.get('items');
        if(!items)
            return;
        items.forEach(async (item: MenuModel, index: number) => {
            let cmd = command_prefix + String(index);
            let subitems = item.get('items');
            if (subitems !== null) {
                let subMenu = await this.buildMenu(item, commands, command_prefix + ':sub' + String(index));
                subMenu.title.label = item.get('description');
                menuWidget.addItem({type: 'submenu', submenu: subMenu});
            } else {
                menuWidget.addItem({command: cmd});
            }
            commands.addCommand(cmd, {
                // mnemonic: 2,
                // caption: 'Close the current tab',
                label: () => item.get('description'),
                isToggled: () => item.get('value') === true,
                isEnabled: () => item.get('disabled') !== true,
                execute: () => {
                    console.log('Click', item.get('description'));
                    let checked = item.get('checked')
                    if(item.get('checkable')) {
                        item.set('value', !item.get('value'))
                        item.save_changes()
                    }
                    item.send({event: 'click'}, {})
                    this.model.trigger('click', item)
                },
            });
            // make sure the dom elements are created
            // menuWidget.onUpdateRequest(Msg.UpdateRequest)
            MessageLoop.sendMessage(menuWidget, Widget.Msg.UpdateRequest);
            let iconDiv = menuWidget.contentNode.querySelector(`.p-Menu-item[data-command="${cmd}"] .p-Menu-itemIcon`)
            let icon = item.get('icon');
            if(icon) {
                let iconView = <IconView> await this.create_child_view(icon)
                // if (description.length === 0 && this.iconView) {
                //     this.iconView.el.classList.add('center');
                // }
                iconDiv.appendChild(iconView.el);
            }
            // this.iconView.listenTo(icon, 'change', () => this.update())
            // counter++;
        });
        return menuWidget;
    }

    buildMainMenu() {
        let commands = new CommandRegistry();
        let counter = 0;
        let menuWidget = this.buildMenu(this.model, commands, 'command:');
        return menuWidget;
    }
    
    update(options?) {
        let commands = new CommandRegistry();
        let counter = 0;
        let menuWidget = this.buildMainMenu();
        this.menu = menuWidget;
        // let items: Array<MenuModel> = this.model.get('items');
        
        // this.menu = new Menu({commands: commands});
        // let counter = 0;
        // items.forEach((item: MenuItemModel) => {
        //     let cmd = 'command:'+String(counter);
        //     this.menu.addItem({ command:  cmd});
        //     commands.addCommand(cmd, {
        //         label: item.get('description'),
        //         // mnemonic: 2,
        //         // caption: 'Close the current tab',
        //         execute: () => {
        //             console.log('Click', item.get('description'));
        //             item.send({event: 'click'}, {})
        //         }
        //     });
        //     counter++;

        // })
        // this.el.appendChild(menu.node)
        // menu.attach(this.el);
        // menu.add
        // let menuItems = items.map((item) => {
        //     // return new MenuItem(text: item.get('description'))
        // })
        // this.displayed.then(() => {
        //     Widget.attach(this.menu, this.el);
        // })
        let button = document.createElement('button')
        button.innerHTML = 'Test'
        button.onclick = (event) => {
            console.log('click')
            event.preventDefault();
            var rect = button.getBoundingClientRect();
            var x = rect.left;
            var y = rect.bottom;
            menuWidget.open(x, y);
        }
        this.el.appendChild(button)
    }
    menu: Menu;

}
