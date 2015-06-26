// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

define([
    "nbextensions/widgets/widgets/js/widget",
    "jquery",
], function(widget, $){

    var BaseLinkModel = widget.WidgetModel.extend({

        update_value: function(source, target) {
            if (this.updating) {
                return;
            }
            this.updating = true;
            try {
                if (target[0]) {
                    target[0].set(target[1], source[0].get(source[1]));
                    target[0].save_changes();
                }
            } finally {
                this.updating = false;
            }
        },

        cleanup: function() {
            // Stop listening to "change" and "destroy" events of the source and target
            if (this.source) {
                this.stopListening(this.source[0], "change:" + this.source[1], null, this);
                this.stopListening(this.source[0], "destroy", null, this);
            }
            if (this.target) {
                this.stopListening(this.target[0], "change:" + this.target[1], null, this);
                this.stopListening(this.target[0], "destroy", null, this);
            }
        },

    }, {

        serializers: _.extend({
            target: {deserialize: widget.unpack_models},
            source: {deserialize: widget.unpack_models},
        }, widget.WidgetModel.serializers),

    });

    var LinkModel = BaseLinkModel.extend({

        initialize: function() {
            this.on("change", this.update_bindings, this);
        },

        update_bindings: function() {
            this.cleanup();
            this.source = this.get("source");
            this.target = this.get("target");
            if (this.source) {
                this.listenTo(this.source[0], "change:" + this.source[1], function() {
                    this.update_value(this.source, this.target);
                }, this);
                this.update_value(this.source, this.target);
                this.listenToOnce(this.source[0], "destroy", this.cleanup, this);
            }
            if (this.target) {
                this.listenTo(this.target[0], "change:" + this.target[1], function() {
                    this.update_value(this.target, this.source);
                }, this);
                this.listenToOnce(this.target[0], "destroy", this.cleanup, this);
            }
        },

    });

    var DirectionalLinkModel = BaseLinkModel.extend({

        initialize: function() {
            this.on("change", this.update_bindings, this);
        },

        update_bindings: function() {
            this.cleanup();
            this.source = this.get("source");
            this.target = this.get("target");
            if (this.source) {
                this.listenTo(this.source[0], "change:" + this.source[1], function() {
                    this.update_value(this.source, this.target);
                }, this);
                this.update_value(this.source, this.target);
                this.listenToOnce(this.source[0], "destroy", this.cleanup, this);
            }
            if (this.target) {
                this.listenToOnce(this.target[0], "destroy", this.cleanup, this);
            }
        },

    });

    return {
        "LinkModel": LinkModel,
        "DirectionalLinkModel": DirectionalLinkModel,
    }
});
