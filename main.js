var manager = new CB.Manager();

function createNPC(x, y, entityManager) {
    var npc = new CB.Entity(manager);

    var transCmp = new CCMP.TransformableComponent(npc);
    transCmp.pos.set(new V2D.Vector2d(x, y));
    var dirCmp = new CCMP.DirectionComponent(npc);
    dirCmp.dir.set(new V2D.Vector2d(1, 0));
    var drawableCmp = new CCMP.DrawableComponent(npc);
    drawableCmp.color = '#0000FF';
    var collisionCmp = new CCMP.CollisionComponent(npc);
    var obstacleCmp = new CCMP.ObstacleComponent(npc);
    var shapeCmp = new CCMP.ShapeComponent(npc);
    shapeCmp.shape = CCMP.SHP_CIRCLE;
    shapeCmp.shapeData = {
        radius: 8
    }
    var physicsCmp = new CCMP.PhysicsComponent(npc);
    var healthCmp = new CCMP.HealthComponent(npc, 100);

    return npc;
}

function createPlayer(x, y, entityManager) {
    var player = createNPC(x, y, entityManager);
    var userControlledCmp = new CCMP.UserControlledComponent(player);
    player.addComponent(userControlledCmp);

    return player;
}

function createEnemy(x, y, entityManager) {
    var enemy = createNPC(x, y, entityManager);
    var aiCmp = new CCMP.AIComponent(enemy);
    enemy.addComponent(aiCmp);

    return enemy;
}

function createRock(x, y, r) {
    var rock = new CB.Entity(manager);

    var transCmp = new CCMP.TransformableComponent(rock);
    transCmp.pos.set(new V2D.Vector2d(x, y));
    var drawableCmp = new CCMP.DrawableComponent(rock);
    drawableCmp.color = '#000000';
    var collisionCmp = new CCMP.CollisionComponent(rock);
    var obstacleCmp = new CCMP.ObstacleComponent(rock);
    var shapeCmp = new CCMP.ShapeComponent(rock);
    shapeCmp.shape = CCMP.SHP_CIRCLE;
    shapeCmp.shapeData = {
        radius: r
    }

    return rock;
}

function createWall(x, y, w, h) {
    var wall = new CB.Entity(manager);

    var transCmp = new CCMP.TransformableComponent(wall);
    transCmp.pos.set(new V2D.Vector2d(x, y));
    var drawableCmp = new CCMP.DrawableComponent(wall);
    drawableCmp.color = '#000000';
    var collisionCmp = new CCMP.CollisionComponent(wall);
    var obstacleCmp = new CCMP.ObstacleComponent(wall);
    var shapeCmp = new CCMP.ShapeComponent(wall);
    shapeCmp.shape = CCMP.SHP_RECTANGLE;
    shapeCmp.shapeData = {
        width: w,
        height: h
    }

    return wall;
}

var player = createPlayer(100, 100, manager);
createEnemy(200, 100, manager);
createEnemy(300, 100, manager);
createEnemy(300, 200, manager);
createRock(100, 200, 16);
createWall(0, 0, 640, 8);
createWall(8, 8, 50, 50);
createWall(0, 480 - 8, 640, 8);
createWall(0, 8, 8, 480 - 16);
createWall(640 - 8, 8, 8, 480 - 16);

CCMP.cameraFollow(player);

var canvas = document.getElementById('renderingCanvas');
var context = canvas.getContext('2d');

CDRAW.setCanvas(canvas);

$(document).ready(function() {
    init();
});

function initAnimationFrame() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}

function init() {
    initAnimationFrame();
    draw();
}

function draw() {
    requestAnimationFrame(draw);

    // Clear the screen
    CDRAW.drawRect(0, 0, canvas.width, canvas.height, '#FFFFFF');
    manager.draw();
}
