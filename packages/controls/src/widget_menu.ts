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
  CommandRegistry
} from '@phosphor/commands';

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
class MenuModel extends CoreDOMWidgetModel {
    defaults() {
        return {...super.defaults(),
            _model_name: 'MenuModel',
            _view_name: 'MenuView'
        };
    }
    static serializers = {
        ...CoreDOMWidgetModel.serializers,
        items: {deserialize: unpack_models},
    };
}

export
class MenuView extends DOMWidgetView {
    render() {
        super.render();

        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-inline-hbox');
        this.el.classList.add('widget-toggle-buttons');

        // this.buttongroup = document.createElement('div');
        // this.el.appendChild(this.buttongroup);

        this.update();
        // this.set_button_style();
    }
    
    update(options?) {
        let items: Array<MenuItemModel> = this.model.get('items');
        let commands = new CommandRegistry();
        this.menu = new Menu({commands: commands});
        let counter = 0;
        items.forEach((item: MenuItemModel) => {
            let cmd = 'command:'+String(counter);
            this.menu.addItem({ command:  cmd});
            commands.addCommand(cmd, {
                label: item.get('description'),
                // mnemonic: 2,
                // caption: 'Close the current tab',
                execute: () => {
                    console.log('Click', item.get('description'));
                    item.send({event: 'click'}, {})
                }
            });
            counter++;

        })
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
            this.menu.open(x, y);
        }
        this.el.appendChild(button)
    }
    menu: Menu;

}
