var CCMP = (function() {
    function _inherit(derived, base) {
    	derived.prototype = Object.create(base.prototype);
    	derived.prototype.constructor = derived;
    }

    var module = {};

    module.SHP_CIRCLE = 1;
    module.SHP_RECTANGLE = 2;

    function _shapesCollide(A, B) {
        if (A.shape == module.SHP_CIRCLE && B.shape == module.SHP_CIRCLE) {
            var satCircleA = new SAT.Circle(new SAT.Vector(A.pos.x, A.pos.y), A.shapeData.radius);
            var satCircleB = new SAT.Circle(new SAT.Vector(B.pos.x, B.pos.y), B.shapeData.radius);
            var response = new SAT.Response();
            return SAT.testCircleCircle(satCircleA, satCircleB, response);
        }
        if (A.shape == module.SHP_CIRCLE && B.shape == module.SHP_RECTANGLE) {
            var temp = A;
            A = B;
            B = temp;
        }
        if (A.shape == module.SHP_RECTANGLE && B.shape == module.SHP_CIRCLE) {
            var satPoly = new SAT.Polygon(new SAT.Vector(A.pos.x, A.pos.y),
                [new SAT.Vector(0, 0),
                new SAT.Vector(A.shapeData.width, 0),
                new SAT.Vector(A.shapeData.width, A.shapeData.height),
                new SAT.Vector(0, A.shapeData.height)]);
            var satCircle = new SAT.Circle(new SAT.Vector(B.pos.x, B.pos.y), B.shapeData.radius);
            var response = new SAT.Response();
            return SAT.testPolygonCircle(satPoly, satCircle, response);
        }

        // TODO: Add other shape combinations

        return false;
    }

    function _resolveCollision(A, B) {
        if (!A.dynamic && !B.dynamic)
            return;
        if (A.shape == module.SHP_CIRCLE && B.shape == module.SHP_CIRCLE) {
            var satCircleA = new SAT.Circle(new SAT.Vector(A.pos.x, A.pos.y), A.shapeData.radius);
            var satCircleB = new SAT.Circle(new SAT.Vector(B.pos.x, B.pos.y), B.shapeData.radius);
            var response = new SAT.Response();
            var collided = SAT.testCircleCircle(satCircleA, satCircleB, response);
            var n = new V2D.Vector2d(response.overlapV.x, response.overlapV.y);
            var overlap = n.length();
            n.normalize();
            if (collided) {
                if (A.dynamic && B.dynamic) {
                    A.pos.sub(V2D.multiply(n, overlap / 2));
                    B.pos.add(V2D.multiply(n, overlap / 2));
                } else if (A.dynamic && !B.dynamic) {
                    A.pos.sub(V2D.multiply(n, overlap));
                } else if (!A.dynamic && B.dynamic) {
                    B.pos.add(V2D.multiply(n, overlap));
                }
            }
        }
        if (A.shape == module.SHP_CIRCLE && B.shape == module.SHP_RECTANGLE) {
            var temp = A;
            A = B;
            B = temp;
        }
        if (A.shape == module.SHP_RECTANGLE && B.shape == module.SHP_CIRCLE) {
            var satPoly = new SAT.Polygon(new SAT.Vector(A.pos.x, A.pos.y),
                [new SAT.Vector(0, 0),
                new SAT.Vector(A.shapeData.width, 0),
                new SAT.Vector(A.shapeData.width, A.shapeData.height),
                new SAT.Vector(0, A.shapeData.height)]);
            var satCircle = new SAT.Circle(new SAT.Vector(B.pos.x, B.pos.y), B.shapeData.radius);
            var response = new SAT.Response();
            var collided = SAT.testPolygonCircle(satPoly, satCircle, response);
            var n = new V2D.Vector2d(response.overlapV.x, response.overlapV.y);
            var overlap = n.length();
            n.normalize();
            if (collided) {
                if (A.dynamic && B.dynamic) {
                    A.pos.sub(V2D.multiply(n, overlap / 2));
                    B.pos.add(V2D.multiply(n, overlap / 2));
                } else if (A.dynamic && !B.dynamic) {
                    A.pos.sub(V2D.multiply(n, overlap));
                } else if (!A.dynamic && B.dynamic) {
                    B.pos.add(V2D.multiply(n, overlap));
                }
            }
        }

        // TODO: Add other shape combinations
    }

    // Transformable component
    module.TransformableComponent = function(entity, x, y) {
        if (entity) CB.Component.call(this, entity, "cmpTransformable");
        if (!x)
            x = 0;
        if (!y)
            y = 0;

        this.pos = new V2D.Vector2d(x, y);
    }

    _inherit(module.TransformableComponent, CB.Component);

    module.TransformableComponent.prototype.translate = function (v) {
        this.pos.add(v);
    };

    // Direction component
    module.DirectionComponent = function(entity, x, y) {
        if (entity) CB.Component.call(this, entity, "cmpDirection");
        if (!x)
            x = 0;
        if (!y)
            y = 0;

        this.dir = new V2D.Vector2d(x, y);
    }

    _inherit(module.DirectionComponent, CB.Component);

    // Drawable component
    module.DrawableComponent = function (entity, r, color) {
        if (entity) CB.Component.call(this, entity, "cmpDrawable");
        if (!r)
            r = 16;
        if (!color)
            color = '#000000';

        this.color = color;
    }

    _inherit(module.DrawableComponent, CB.Component);

    // Camera stuff
    var _camera = new V2D.Vector2d(0, 0);
    var _cameraW = 640;
    var _cameraH = 480;
    var _cameraTarget = null;
    var _cameraTargetPos = null;

    module.setCamera = function (v) {
        _camera.set(v);
    }

    module.getCamera = function () {
        return _camera;
    }

    module.cameraFollow = function (entity) {
        if (entity.hasComponent("cmpTransformable")) {
            _cameraTarget = entity;
            _cameraTargetPos = entity.getComponent("cmpTransformable").pos;
        }
    }

    module.getCameraTarget = function () {
        return _cameraTarget;
    }

    // Reset the camera if the entity being followed is removed
    CB.addListener({
        type: "evtEntityRemove",
        onEvent: function(entity) {
            if (entity == _cameraTarget) {
                _cameraTarget = null;
                _cameraTargetPos = null;
            }
        }
    });

    // Drawing system
    CB.addListener({
        type: "evtStep",
        onEvent: function(manager) {
            if (_cameraTargetPos)
                module.setCamera(V2D.sub(_cameraTargetPos, new V2D.Vector2d(_cameraW / 2, _cameraH / 2)));

            for (var i = 0; i < manager.entities.length; i++) {
                var entity = manager.entities[i];
                if (entity.alive &&
                    entity.hasComponent("cmpDrawable") &&
                    entity.hasComponent("cmpTransformable") &&
                    entity.hasComponent("cmpShape")) {
                    var posComp = entity.getComponent("cmpTransformable");
                    var shapeComp = entity.getComponent("cmpShape");
                    var drawComp = entity.getComponent("cmpDrawable");
                    var screenPos = V2D.sub(posComp.pos, _camera);
                    if (shapeComp.shape == module.SHP_CIRCLE) {
                        // Draw the cirle
                        CDRAW.drawCircleOutline(screenPos.x, screenPos.y, shapeComp.shapeData.radius, 1, drawComp.color);

                        if (entity.hasComponent("cmpDirection")) {
                            // Draw the direction
                            var dirComp = entity.getComponent("cmpDirection");
                            var pos = screenPos;
                            var dir = V2D.add(pos, V2D.multiply(dirComp.dir, shapeComp.shapeData.radius));

                            CDRAW.drawLine(pos.x, pos.y, dir.x, dir.y, 1, drawComp.color);
                        }
                    } else if (shapeComp.shape == module.SHP_RECTANGLE) {
                        CDRAW.drawRectOutline(screenPos.x, screenPos.y, shapeComp.shapeData.width, shapeComp.shapeData.height, 1, drawComp.color);

                        if (entity.hasComponent("cmpDirection")) {
                            // Draw the direction
                            var dirComp = entity.getComponent("cmpDirection");
                            var pos = screenPos;
                            pos.add(new V2D.Vector2d(shapeComp.shapeData.width / 2, shapeComp.shapeData.height / 2));
                            var dir = V2D.add(pos, V2D.multiply(dirComp.dir, shapeComp.shapeData.radius));

                            CDRAW.drawLine(pos.x, pos.y, dir.x, dir.y, 1, drawComp.color);
                        }
                    }
                    // TODO: Draw other shapes as well
                }
            }
        }
    });

    // User controlled entity component
    module.UserControlledComponent = function (entity, speed) {
        if (entity) CB.Component.call(this, entity, "cmpUserMovement");
    }

    _inherit(module.UserControlledComponent, CB.Component);

    // User controlled movement system
    CB.addListener({
        type: "evtStep",
        onEvent: function(manager) {
            for (var i = 0; i < manager.entities.length; i++) {
                var entity = manager.entities[i];
                if (entity.alive &&
                    entity.hasComponent("cmpPhysics") &&
                    entity.hasComponent("cmpUserMovement")) {
                    var physComp = entity.getComponent("cmpPhysics");
                    var dirComp = entity.getComponent("cmpDirection");
                    var transComp = entity.getComponent("cmpTransformable");

                    // Moving
                    var moving = false;
                    var movementVector = new V2D.Vector2d(0, 0);
                    if (INPUT.isKeyDown(INPUT.LEFT)) {
                        movementVector.add(new V2D.Vector2d(-1, 0));
                        moving = true;
                    }
                    if (INPUT.isKeyDown(INPUT.RIGHT)) {
                        movementVector.add(new V2D.Vector2d(1, 0));
                        moving = true;
                    }
                    if (INPUT.isKeyDown(INPUT.UP)) {
                        movementVector.add(new V2D.Vector2d(0, -1));
                        moving = true;
                    }
                    if (INPUT.isKeyDown(INPUT.DOWN)) {
                        movementVector.add(new V2D.Vector2d(0, 1));
                        moving = true;
                    }
                    movementVector.normalize();
                    if (moving) {
                        physComp.velocity.set(movementVector);
                        dirComp.dir.set(movementVector);
                    } else {
                        physComp.velocity = new V2D.Vector2d(0, 0);
                    }
                }
            }
        }
    });

    function _fireBullet(manager, pos, dir) {
        var bullet = new CB.Entity(manager);
        var transCmp = new CCMP.TransformableComponent(bullet);
        transCmp.pos.set(V2D.add(pos, V2D.multiply(dir, 16)));
        var dirCmp = new CCMP.DirectionComponent(bullet);
        dirCmp.dir.set(dir);
        var drawableCmp = new CCMP.DrawableComponent(bullet);
        drawableCmp.color = '#FF0000';
        var collisionCmp = new CCMP.CollisionComponent(bullet);
        var shapeCmp = new CCMP.ShapeComponent(bullet);
        shapeCmp.shape = CCMP.SHP_CIRCLE;
        shapeCmp.shapeData = {
            radius: 4
        }
        var physicsCmp = new CCMP.PhysicsComponent(bullet, V2D.multiply(dir, 4));
        var projectileCmp = new CCMP.ProjectileComponent(bullet);
        var damagecmp = new CCMP.DamageComponent(bullet, 25);
    }

    // User controlled shooting system
    CB.addListener({
        type: "evtKeyHit",
        onEvent: function(key) {
            if (key == INPUT.SHOOT) {
                for (var i = 0; i < manager.entities.length; i++) {
                    var entity = manager.entities[i];
                    if (entity.alive &&
                        entity.hasComponent("cmpPhysics") &&
                        entity.hasComponent("cmpUserMovement")) {
                        var physComp = entity.getComponent("cmpPhysics");
                        var dirComp = entity.getComponent("cmpDirection");
                        var transComp = entity.getComponent("cmpTransformable");

                        // Shooting
                        _fireBullet(entity.parentManager, transComp.pos, dirComp.dir);
                    }
                }
            }
        }
    });

    // AI component
    module.AIComponent = function (entity, visibility) {
        if (entity) CB.Component.call(this, entity, "cmpAI");

        if (!visibility)
            visibility = 100;

        this.visibility = visibility;
    }

    _inherit(module.AIComponent, CB.Component);

    // AI system
    CB.addListener({
        type: "evtStep",
        onEvent: function(manager) {
            for (var i = 0; i < manager.entities.length; i++) {
                var entityA = manager.entities[i];
                if (entityA.alive && entityA.hasComponent("cmpAI")) {
                    var aiCmpA = entityA.getComponent("cmpAI")
                    for (var j = 0; j < manager.entities.length; j++) {
                        var entityB = manager.entities[j];
                        if (entityB.alive && entityB.hasComponent("cmpUserMovement")) {
                            var transCmpA = entityA.getComponent("cmpTransformable");
                            var dirCmpA = entityA.getComponent("cmpDirection");
                            var transCmpB = entityB.getComponent("cmpTransformable");
                            if (transCmpA.pos.distance(transCmpB.pos) < aiCmpA.visibility) {
                                var dir = V2D.sub(transCmpB.pos, transCmpA.pos);
                                dir.normalize();
                                dirCmpA.dir.set(dir);
                            }
                        }
                    }
                }
            }
        }
    });

    // Collision component
    module.CollisionComponent = function (entity) {
        if (entity) CB.Component.call(this, entity, "cmpCollision");
    }

    _inherit(module.CollisionComponent, CB.Component);

    // Collision system
    CB.addListener({
        type: "evtStep",
        onEvent: function(manager) {
            for (var i = 0; i < manager.entities.length; i++) {
                var entityA = manager.entities[i];
                if (entityA.alive &&
                    entityA.hasComponent("cmpTransformable") &&
                    entityA.hasComponent("cmpCollision") &&
                    entityA.hasComponent("cmpShape")) {
                    for (var j = 0; j < manager.entities.length; j++) {
                        var entityB = manager.entities[j];
                        if (entityB.alive && entityB != entityA) {
                            if (entityB.hasComponent("cmpTransformable") &&
                                entityB.hasComponent("cmpCollision") &&
                                entityB.hasComponent("cmpShape")) {

                                var thisPos = entityA.getComponent("cmpTransformable").pos;
                                var thisShape = entityA.getComponent("cmpShape").shape;
                                var thisShapeData = entityA.getComponent("cmpShape").shapeData;
                                var entityPos = entityB.getComponent("cmpTransformable").pos;
                                var entityShape = entityB.getComponent("cmpShape").shape;
                                var entityShapeData = entityB.getComponent("cmpShape").shapeData;

                                if (_shapesCollide({shape: thisShape, pos: thisPos, shapeData: thisShapeData},
                                    {shape: entityShape, pos: entityPos, shapeData: entityShapeData})) {
                                    var eventData = {};
                                    eventData.entityA = entityA;
                                    eventData.entityB = entityB;
                                    //console.log("Collision between " + eventData.entityA.id + " and " + eventData.entityB.id);
                                    CB.trigger("evtCollision", eventData);
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Shape component
    module.ShapeComponent = function(entity, shape, shapeData) {
        if (entity) CB.Component.call(this, entity, "cmpShape");
        this.shape = shape;
        this.shapeData = shapeData;
    }

    _inherit(module.ShapeComponent, CB.Component);

    // Physics component
    module.PhysicsComponent = function(entity, velocity) {
        if (entity) CB.Component.call(this, entity, "cmpPhysics");
        if (!velocity)
            velocity = new V2D.Vector2d(0, 0);

        this.velocity = new V2D.Vector2d(0, 0).set(velocity);
    }

    _inherit(module.PhysicsComponent, CB.Component);

    // Physics system
    CB.addListener({
        type: "evtStep",
        onEvent: function(manager) {
            for (var i = 0; i < manager.entities.length; i++) {
                var entity = manager.entities[i];
                if (entity.alive &&
                    entity.hasComponent("cmpPhysics") &&
                    entity.hasComponent("cmpTransformable")) {
                    var transComp = entity.getComponent("cmpTransformable");
                    var physComp = entity.getComponent("cmpPhysics");
                    transComp.translate(physComp.velocity);
                }
            }
        }
    });

    // Obstacle component
    module.ObstacleComponent = function(entity) {
        if (entity) CB.Component.call(this, entity, "cmpObstacle");
    }

    _inherit(module.ObstacleComponent, CB.Component);

    // Obstacle system
    CB.addListener({
        type: "evtCollision",
        onEvent: function(eventData) {
            if (eventData.entityA.hasComponent("cmpObstacle") &&
                eventData.entityA.hasComponent("cmpPhysics") &&
                eventData.entityB.hasComponent("cmpObstacle") &&
                eventData.entityB.hasComponent("cmpPhysics")) {
                _resolveCollision({shape: eventData.entityA.getComponent("cmpShape").shape,
                    pos: eventData.entityA.getComponent("cmpTransformable").pos,
                    shapeData: eventData.entityA.getComponent("cmpShape").shapeData,
                    dynamic: true},
                    {shape: eventData.entityB.getComponent("cmpShape").shape,
                    pos: eventData.entityB.getComponent("cmpTransformable").pos,
                    shapeData: eventData.entityB.getComponent("cmpShape").shapeData,
                    dynamic: true});
            } else {
                var staticEntity = null;
                var dynamicEntity = null;
                if (eventData.entityA.hasComponent("cmpPhysics") &&
                    eventData.entityB.hasComponent("cmpObstacle")) {
                    dynamicEntity = eventData.entityA;
                    staticEntity = eventData.entityB;
                } else if (eventData.entityA.hasComponent("cmpObstacle") &&
                    eventData.entityB.hasComponent("cmpPhysics")) {
                    dynamicEntity = eventData.entityB;
                    staticEntity = eventData.entityA;
                } else {
                    return;
                }
                _resolveCollision({shape: dynamicEntity.getComponent("cmpShape").shape,
                    pos: dynamicEntity.getComponent("cmpTransformable").pos,
                    shapeData: dynamicEntity.getComponent("cmpShape").shapeData,
                    dynamic: true},
                    {shape: staticEntity.getComponent("cmpShape").shape,
                    pos: staticEntity.getComponent("cmpTransformable").pos,
                    shapeData: staticEntity.getComponent("cmpShape").shapeData,
                    dynamic: false});
            }
        }
    });

    // Projectile component
    module.ProjectileComponent = function(entity) {
        if (entity) CB.Component.call(this, entity, "cmpProjectile");
    }

    _inherit(module.ProjectileComponent, CB.Component);

    // Projectile system
    CB.addListener({
        type: "evtCollision",
        onEvent: function(eventData) {
            if (eventData.entityA.hasComponent("cmpProjectile") && eventData.entityB.hasComponent("cmpObstacle"))
                eventData.entityA.parentManager.removeEntity(eventData.entityA);
            if (eventData.entityB.hasComponent("cmpProjectile") && eventData.entityA.hasComponent("cmpObstacle"))
                eventData.entityB.parentManager.removeEntity(eventData.entityB);
        }
    });

    // Health component
    module.HealthComponent = function(entity, maxHealth) {
        if (entity) CB.Component.call(this, entity, "cmpHealth");

        this.maxHealth = maxHealth;
        this.health = maxHealth;
    }

    _inherit(module.HealthComponent, CB.Component);

    // Damage component
    module.DamageComponent = function(entity, damage) {
        if (entity) CB.Component.call(this, entity, "cmpDamage");

        this.damage = damage;
    }

    // Damagable system
    CB.addListener({
        type: "evtCollision",
        onEvent: function(eventData) {
            if (eventData.entityB.hasComponent("cmpHealth") && eventData.entityA.hasComponent("cmpDamage")) {
                var temp = eventData.entityA;
                eventData.entityA = eventData.entityB;
                eventData.entityB = temp;
            }
            if (eventData.entityA.hasComponent("cmpHealth") && eventData.entityB.hasComponent("cmpDamage")) {
                var cmpHealth = eventData.entityA.getComponent("cmpHealth");
                var cmpDamage = eventData.entityB.getComponent("cmpDamage");
                cmpHealth.health -= cmpDamage.damage;
                if (cmpHealth.health <= 0)
                    eventData.entityA.parentManager.removeEntity(eventData.entityA);
            }
        }
    });

    return module;
}());
