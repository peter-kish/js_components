var V2D = (function() {
    var module = {};

    module.Vector2d = function(x, y) {
    	if (x) {
    		this.x = x;
    	} else {
    		this.x = 0;
    	}
    	if (y) {
    		this.y = y;
    	} else {
    		this.y = 0;
    	}
    };

    module.Vector2d.prototype.set = function (vector) {
    	this.x = vector.x;
    	this.y = vector.y;
        return this;
    };

    module.Vector2d.prototype.add = function(vector) {
    	this.x += vector.x;
    	this.y += vector.y;
    };

    module.Vector2d.prototype.sub = function(vector) {
    	this.x -= vector.x;
    	this.y -= vector.y;
    };

    module.Vector2d.prototype.multiply = function(scalar) {
    	this.x *= scalar;
    	this.y *= scalar;
    };

    module.Vector2d.prototype.dot = function(vector) {
    	return (this.x * vector.x) + (this.y * vector.y);
    }

    module.Vector2d.prototype.length = function() {
    	return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    }

    module.Vector2d.prototype.distance = function(vector) {
    	return Math.sqrt(Math.pow(vector.x - this.x, 2) + Math.pow(vector.y - this.y, 2));
    }

    module.Vector2d.prototype.chebyshevDistance = function(vector) {
      return Math.abs(this.x - vector.x) + Math.abs(this.y - vector.y);
    }

    module.Vector2d.prototype.projection = function(vector) {
    	var result = new module.Vector2d(vector.x, vector.y);
    	var scalar = (this.dot(vector)) / (Math.pow(vector.length(), 2));
    	result.multiply(scalar);
    	return result;
    }

    module.Vector2d.prototype.reflection = function(normal) {
    	var result = (new module.Vector2d()).set(this);
        var normalMultiplied = (new module.Vector2d()).set(normal);
        normalMultiplied.multiply(2 * this.dot(normal));
    	result.sub(normalMultiplied);
    	return result;
    }

    module.Vector2d.prototype.reflect = function(normal) {
    	var reflection = this.reflection(normal);
    	this.set(reflection);
    }

    module.Vector2d.prototype.normalize = function() {
        var l = this.length();
        if (l > 0)
    	   this.multiply(1 / l);
    };

    module.Vector2d.prototype.toString = function(vector) {
    	return '(' + this.x + ',' + this.y + ')';
    }

    module.Vector2d.prototype.draw = function(center) {
    	drawLine(center.x, center.y, center.x + this.x, center.y + this.y, 3, '#000000')
    }

    module.Vector2d.prototype.copy = function() {
    	return new Vector2d(this.x, this.y);
    }

    module.Vector2d.prototype.equals = function (vector) {
    	return (this.x == vector.x && this.y == vector.y);
    };

    module.add = function(v1, v2) {
    	var result = new module.Vector2d(v1.x, v1.y);
    	result.add(v2);
    	return result;
    }

    module.sub = function(v1, v2) {
    	var result = new module.Vector2d(v1.x, v1.y);
    	result.sub(v2);
    	return result;
    }

    module.multiply = function(v1, scalar) {
    	var result = new module.Vector2d(v1.x, v1.y);
    	result.multiply(scalar);
    	return result;
    }

    module.dot = function(v1, v2) {
    	var result = new module.Vector2d(v1.x, v1.y);
    	result.dot(v2);
    	return result;
    }

    module.distance = function(v1, v2) {
    	var result = new module.Vector2d(v1.x, v1.y);
    	return result.distance(v2);
    }

    module.projection = function(v1, v2) {
    	return v1.projection(v2);
    }

    module.reflection = function(v, n) {
        return v.reflection(n);
    }

    module.normalized = function(v) {
    	var result = new module.Vector2d(v.x, v.y);
    	result.normalize();
    	return result;
    }

    module.equal = function(v1, v2) {
    	return v1.equals(v2);
    }

    return module;
}());
