var INPUT = (function() {
    var module = {};

    var _inputs = [];

    module.UP = 0;
    module.DOWN = 1;
    module.LEFT = 2;
    module.RIGHT = 3;
    module.SHOOT = 4;

    _inputs[module.UP] = false;
    _inputs[module.DOWN] = false;
    _inputs[module.LEFT] = false;
    _inputs[module.RIGHT] = false;
    _inputs[module.SHOOT] = false;

    var _evtKeyHit = CB.registerEvent("evtKeyHit");
    var _evtKeyReleased = CB.registerEvent("evtKeyReleased");

    document.addEventListener('keydown', function(event) {
        if(event.keyCode == 37) {
            _inputs[module.LEFT] = true;
            CB.trigger(_evtKeyHit, module.LEFT);
        } else if (event.keyCode == 38) {
            _inputs[module.UP] = true;
            CB.trigger(_evtKeyHit, module.UP);
        } else if (event.keyCode == 39) {
            _inputs[module.RIGHT] = true;
            CB.trigger(_evtKeyHit, module.RIGHT);
        } else if (event.keyCode == 40) {
            _inputs[module.DOWN] = true;
            CB.trigger(_evtKeyHit, module.DOWN);
        } else if (event.keyCode == 32) {
            _inputs[module.SHOOT] = true;
            CB.trigger(_evtKeyHit, module.SHOOT);
        }
    });

    document.addEventListener('keyup', function(event) {
        if(event.keyCode == 37) {
            _inputs[module.LEFT] = false;
            CB.trigger(_evtKeyReleased, module.LEFT);
        } else if (event.keyCode == 38) {
            _inputs[module.UP] = false;
            CB.trigger(_evtKeyReleased, module.UP);
        } else if (event.keyCode == 39) {
            _inputs[module.RIGHT] = false;
            CB.trigger(_evtKeyReleased, module.RIGHT);
        } else if (event.keyCode == 40) {
            _inputs[module.DOWN] = false;
            CB.trigger(_evtKeyReleased, module.DOWN);
        } else if (event.keyCode == 32) {
            _inputs[module.SHOOT] = false;
            CB.trigger(_evtKeyReleased, module.SHOOT);
        }
    });

    module.isKeyDown = function(key) {
        return _inputs[key];
    }

    return module;
}());
