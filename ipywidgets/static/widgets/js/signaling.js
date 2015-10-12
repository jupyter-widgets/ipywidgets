
// This is a duplication of phosphorjs' signaling library.

define([], function(widget, $){

    /**
     * An object used for loosely coupled inter-object communication.
     *
     * A signal is emitted by an object in response to some event. User
     * code may connect listener functions (slots) to the signal to be
     * notified when that event occurs. This is a simple and efficient
     * form of the pub-sub pattern which promotes type-safe and loosely
     * coupled communication between objects.
     */
    var Signal = (function () {
        /**
         * Construct a new signal.
         */
        function Signal() {
            this._m_slots = null;
        }
        /**
         * Connect a slot to the signal.
         *
         * Slot connections are not de-duplicated. If the slot is connected
         * to the signal multiple times, it will be invoked multiple times
         * when the signal is emitted.
         *
         * It is safe to connect a slot while the signal is being emitted.
         * The slot will be invoked the next time the signal is emitted.
         */
        Signal.prototype.connect = function (slot, thisArg, name) {
            var wrapper = new SlotWrapper(slot, thisArg, name);
            var slots = this._m_slots;
            if (slots === null) {
                this._m_slots = wrapper;
            }
            else if (slots instanceof SlotWrapper) {
                this._m_slots = [slots, wrapper];
            }
            else {
                slots.push(wrapper);
            }
        };
        /**
         * Disconnect a slot from the signal.
         *
         * This will remove all connections to the slot, even if the slot
         * was connected multiple times. If no slot is provided, all slots
         * will be disconnected.
         *
         * It is safe to disconnect a slot while the signal is being emitted.
         * The slot is removed immediately and will not be invoked.
         */
        Signal.prototype.disconnect = function (slot, thisArg) {
            var slots = this._m_slots;
            if (slots === null) {
                return;
            }
            if (slots instanceof SlotWrapper) {
                if (!slot || slots.equals(slot, thisArg)) {
                    slots.clear();
                    this._m_slots = null;
                }
            }
            else if (!slot) {
                var array = slots;
                for (var i = 0, n = array.length; i < n; ++i) {
                    array[i].clear();
                }
                this._m_slots = null;
            }
            else {
                var rest = [];
                var array = slots;
                for (var i = 0, n = array.length; i < n; ++i) {
                    var wrapper = array[i];
                    if (wrapper.equals(slot, thisArg)) {
                        wrapper.clear();
                    }
                    else {
                        rest.push(wrapper);
                    }
                }
                if (rest.length === 0) {
                    this._m_slots = null;
                }
                else if (rest.length === 1) {
                    this._m_slots = rest[0];
                }
                else {
                    this._m_slots = rest;
                }
            }
        };
        /**
         * Test whether a slot is connected to the signal.
         */
        Signal.prototype.isConnected = function (slot, thisArg) {
            var slots = this._m_slots;
            if (slots === null) {
                return false;
            }
            if (slots instanceof SlotWrapper) {
                return slots.equals(slot, thisArg);
            }
            var array = slots;
            for (var i = 0, n = array.length; i < n; ++i) {
                if (array[i].equals(slot, thisArg)) {
                    return true;
                }
            }
            return false;
        };

        /**
         * Emit the signal and invoke its connected slots. 
         *
         * Slots are invoked in the order in which they are connected.
         */
        Signal.prototype.emit = function (sender, args) {
            var slots = this._m_slots;
            if (slots === null) {
                return;
            }
            if (slots instanceof SlotWrapper) {
                slots.invoke(sender, args);
            }
            else {
                var array = slots;
                for (var i = 0, n = array.length; i < n; ++i) {
                    array[i].invoke(sender, args);
                }
            }
        };
        return Signal;
    })();


    /**
     * A thin wrapper around a slot function and context object.
     */
    var SlotWrapper = (function () {
        /**
         * Construct a new slot wrapper.
         */
        function SlotWrapper(slot, thisArg, name) {
            this._m_slot = slot;
            this._m_thisArg = thisArg;
            this._m_name = name;
        }
        /**
         * Clear the contents of the slot wrapper.
         */
        SlotWrapper.prototype.clear = function () {
            this._m_slot = null;
            this._m_thisArg = null;
        };
        /**
         * Test whether the wrapper equals a slot and context.
         */
        SlotWrapper.prototype.equals = function (slot, thisArg) {
            return this._m_slot === slot && this._m_thisArg === thisArg;
        };
        /**
         * Invoke the wrapper slot with the given sender and args.
         *
         * This is a no-op if the wrapper has been cleared.
         */
        SlotWrapper.prototype.invoke = function (sender, args) {
            if (this._m_slot) {
                this._m_slot.call(this._m_thisArg, sender, args);
            }
        };
        return SlotWrapper;
    })();

    return {
        Signal: Signal,
        SlotWrapper: SlotWrapper,
    };
});
