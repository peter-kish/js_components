var CB = (function() {
    var _entityIDFactory = new IDF.IDFactory();

    var module = {};

    var _eventKeyMap = new IDF.KeyMap();

    module.getEventID = function (name) {
        try {
            return _eventKeyMap.getKeyID(name);
        } catch (err) {
            return null;
        }
    }

    module.registerEvent = function (name) {
        return _eventKeyMap.registerKey(name);
    }

    module.unregisterEvent = function (name) {
        _eventKeyMap.unregisterKey(name);
    }

    var _listeners = [];
    var _stepListeners = [];
    var _EVT_STEP = module.registerEvent("evtStep");
    var _EVT_ENTITY_ADD = module.registerEvent("evtEntityAdd");
    var _EVT_ENTITY_REMOVE = module.registerEvent("evtEntityRemove");

    module.addListener = function(listener) {
        listener.eventID = module.getEventID(listener.type);
        if (!listener.eventID)
            listener.eventID = module.registerEvent(listener.type);

        if (listener.eventID == _EVT_STEP) {
            _stepListeners.push(listener);
        } else {
            _listeners.push(listener);
        }
    }

    module.removeListener = function(listener) {
    	// TODO
    }

    module.trigger = function(eventType, eventData) {
        var id = 0;
        if ((typeof eventType) == "string")
            id = module.getEventID(eventType);
        else if ((typeof eventType) == "number")
            id = eventType;

        if (id == _EVT_STEP) {
            for (var i = 0; i < _stepListeners.length; i++) {
                _stepListeners[i].onEvent(eventData);
            }
        } else {
            for (var i = 0; i < _listeners.length; i++) {
                if (_listeners[i].eventID == id) {
                    _listeners[i].onEvent(eventData);
                }
            }
        }
    }

    // Entity manager
    module.Manager = function() {
    	this.entities = [];
    }

    module.Manager.prototype.entityExists = function(entity) {
        for (var i = 0; i < this.entities.length; i++) {
    		if (this.entities[i] == entity) {
    			return true;
    		}
    	}

        return false;
    }

    module.Manager.prototype.addEntity = function(entity) {
        if (!this.entityExists(entity)) {
            entity.parentManager = this;
            this.entities.push(entity);
            module.trigger(_EVT_ENTITY_ADD, entity);
        }
    }

    module.Manager.prototype.removeEntity = function(entity) {
    	entity.alive = false;
        module.trigger(_EVT_ENTITY_REMOVE, entity);
    }

    module.Manager.prototype.draw = function () {
        module.trigger(_EVT_STEP, this);

        var j = 0;
        while(j < this.entities.length) {
            if (!this.entities[j].alive) {
                this.entities.splice(j, 1);
            } else {
                j++;
            }
        }
    };

    // Entity
    module.Entity = function(manager) {
    	this.components = [];
        this.parentManager = null;
        this.alive = true;
        if (manager) manager.addEntity(this);
        this.id = _entityIDFactory.getNewID();
    }

    module.Entity.prototype.addComponent = function(component) {
        if (!this.hasComponent(component.id)) {
        	component.parentEntity = this;
        	this.components.push(component);
        }
    }

    module.Entity.prototype.removeComponent = function(component) {
    	// TODO
    }

    module.Entity.prototype.hasComponent = function(name) {
        var component = this.getComponent(name);
        return component != null;
    }

    module.Entity.prototype.getComponent = function (name) {
        var id = 0;
        if ((typeof name) == "string")
            id = module.getComponentID(name);
        else if ((typeof name) == "number")
            id = name;

        for (var i = 0; i < this.components.length; i++) {
            if (this.components[i].id == id) {
                return this.components[i];
            }
        }
        return null;
    };

    module.Entity.prototype.draw = function () {
        for (var i = 0; i < this.components.length; i++) {
            if (this.components[i].draw) this.components[i].draw();
        }
    };

    var _componentKeyMap = new IDF.KeyMap();

    module.getComponentID = function(name) {
        try {
            return _componentKeyMap.getKeyID(name);
        } catch (err) {
            return null;
        }
    }

    module.registerComponent = function(name) {
        return _componentKeyMap.registerKey(name);
    }

    module.unregisterComponent = function(name) {
        _componentKeyMap.unregisterKey(name);
    }

    // Base component
    module.Component = function(entity, name) {
        if (name) {
            this.id = module.getComponentID(name);
            if (this.id == null) {
                this.id = module.registerComponent(name);
            }
        }

        this.parentEntity = null;
        if (entity) entity.addComponent(this);
    }

    return module;
}());
