var IDF = (function() {
    var module = {};

    module.IDFactory = function() {
        this.lastID = 0;
        this.discardedIDs = [];
    }

    module.IDFactory.prototype.getNewID = function () {
        // Use a discarded ID, if available
        if (this.discardedIDs.length > 0) {
            return this.discardedIDs.pop();
        }

        // Use a new ID, if available
        this.lastID++;
        if (this.lastID == 0) {
            throw "Maximum number of ids reached!";
        }
        return this.lastID;
    };

    module.IDFactory.prototype.discardID = function (id) {
        // Save the ID for later use
        this.discardedIDs.push(id);
    };

    module.KeyMap = function() {
        this.idFactory = new module.IDFactory();
        this.keys = {};
    }

    module.KeyMap.prototype.registerKey = function (key) {
        if (this.keys[key]) {
            throw "Key (" + key + ") already registered!";
        }

        this.keys[key] = this.idFactory.getNewID();
        return this.keys[key];
    };

    module.KeyMap.prototype.unregisterKey = function (key) {
        if (!this.keys[key]) {
            throw "Key (" + key + ") not registered!";
        }

        this.idFactory.discardID(this.keys[key]);
        delete this.keys[key];
    };

    module.KeyMap.prototype.getKeyID = function (key) {
        if (!this.keys[key]) {
            throw "Key (" + key + ") not registered!";
        }

        return this.keys[key];
    };

    return module;
}());
