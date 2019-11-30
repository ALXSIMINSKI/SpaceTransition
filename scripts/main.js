var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        acrade: {
            gravity: {y: 0},
            debug: false
        }
    },
    transparent: true,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var meteoritesConfig = {
    angularDrag: 2,
    angularVelocity: 60
};

var game = new Phaser.Game(config);

var font = { fontSize: '32px', fill: '#ee4243' };
var timeAlive = 0;
var timeAliveText;
var canvasHeight = config.height;
var canvasWidth = config.width;
var gameState = 0;
var player;
var poster;
var startPoint;
var meteorites;
var cursors;
var meteoritesLooks = [];

function preload() {
    this.load.image('startMeteorite', 'images/meteorites/meteorite1.png');
    this.load.image('defaultMeteorite', 'images/meteorites/meteorite2.png');
    this.load.image('helmet', 'images/meteorites/helmet.png');
    this.load.image('curiosity', 'images/meteorites/curiosity.png');
    this.load.image('ironman', 'images/meteorites/ironman.png');
    this.load.image('captain', 'images/meteorites/captain.png');
    this.load.image('lenin', 'images/meteorites/lenin.png');
    this.load.spritesheet('dude', 'images/dude.png', {frameWidth: 32, frameHeight: 48});
    this.load.spritesheet('poster', 'images/poster.png', {frameWidth: 400, frameHeight: 100});
}

function create() {
    meteoritesLooks = ['defaultMeteorite', 'helmet', 'curiosity', 'ironman', 'captain', 'lenin'];

    this.physics.world.setBounds(0, 0, canvasWidth, canvasHeight, true, true, true, false);

    meteorites = this.physics.add.group(meteoritesConfig);

    startPoint = this.physics.add.image(canvasWidth-200, canvasHeight/2, 'startMeteorite');
    startPoint.body.setImmovable(true);

    player = this.physics.add.sprite(canvasWidth-250, canvasHeight/2 - 100, 'dude', 4);
    player.setBounce(0);
    player.setCollideWorldBounds(true);

    poster = this.physics.add.sprite(canvasWidth/3, canvasHeight/2, 'poster');

    timeAliveText = this.add.text(16, 16, 'Time: 0.00' , font);

    defineAnimations(this.anims);

    defineColliders(this.physics);

    defineTimers(this.time);

    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    if(player.y > canvasHeight) {
        stopGame();
    }
    if(gameState === 1) {
        if (cursors.left.isDown) {
            player.setVelocityX(-200);
            player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(200);
            player.anims.play('right', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }
    }
    if (cursors.up.isDown) {
        if(gameState === 0) {
            startGame();
        } else if(player.body.touching.down) {
            player.setVelocityY(-300);
        }
    }
}

function meteoriteCollidePlayerReaction(player, collidedMeteorite) {
    collidedMeteorite.setAngularVelocity(Math.random()*300);
}

function meteoriteCollideMeteoriteReaction(meteorite1, meteorite2) {

}

function startGame() {
    poster.setVelocityX(-100);
    gameState = 1;
    startPoint.setVelocityX(-100);
    player.body.setGravityY(300);
    meteoritesFlow.paused = false;
    timer.paused = false;
    interestingMeteoritesFlow.paused = false;
}

function stopGame() {
    poster.x = canvasWidth/3;
    poster.y = canvasHeight/2;
    poster.setVelocityX(0);
    timeAliveText.setText('Time: 0.00');
    timeAlive = 0;
    gameState = 0;
    startPoint.setVelocityX(0);
    startPoint.x = canvasWidth-200;
    startPoint.y = canvasHeight/2;
    player.setVelocityX(0);
    player.setVelocityY(0);
    player.body.setGravityY(0);
    player.anims.play('turn');
    player.x = canvasWidth-250;
    player.y = canvasHeight/2 - 100;
    meteoritesFlow.paused = true;
    timer.paused = true;
    interestingMeteoritesFlow.paused = true;
    meteorites.clear(true, true);
}

function defineColliders(physics) {
    physics.add.collider(player, meteorites, meteoriteCollidePlayerReaction);
    physics.add.collider(player, startPoint);
    physics.add.collider(meteorites, meteorites, meteoriteCollideMeteoriteReaction);
}

function defineTimers(time) {
    meteoritesFlow = time.addEvent({delay: 600, callback: createNewMeteorite, callbackScope: this, loop: true});
    meteoritesFlow.paused = true;

    interestingMeteoritesFlow = time.addEvent({delay: 10000, callback: createNewInterestingMeteorite, callbackScope: this, loop: true});
    interestingMeteoritesFlow.paused = true;

    timer = time.addEvent({delay: 10, callback: increaseTimeAlive, callbackScope: this, loop: true});
    timer.paused = true;

    posterDefectTimer = time.addEvent({delay: (Math.random()*500) + 100, callback: posterDefect, callbackScope: this, loop: true});
}

function defineAnimations(animations) {
    animations.create({
        key: 'posterDefectOff',
        frames: [{key: 'poster', frame: 1}],
        framerate: 10
    });

    animations.create({
        key: 'posterDefectOn',
        frames: [{key: 'poster', frame: 0}],
        framerate: 10
    });

    animations.create({
        key: 'left',
        frames: animations.generateFrameNumbers('dude', {start: 0, end: 3}),
        framerate: 10,
        repeat: -1
    });

    animations.create({
        key: 'right',
        frames: animations.generateFrameNumbers('dude', {start: 5, end: 8}),
        framerate: 10,
        repeat: -1
    });

    animations.create({
        key: 'turn',
        frames: [{key: 'dude', frame: 4}],
        framerate: 20
    });
}

function createNewMeteorite() {
    var m = meteorites.create(canvasWidth + 100, Math.random() * canvasHeight + 100, meteoritesLooks[0]);
    m.setVelocity(-1*Math.random()*30 - 90, (Math.random()*20) - 10);
}

function createNewInterestingMeteorite() {
    var m = meteorites.create(canvasWidth + 100, Math.random() * canvasHeight + 100, meteoritesLooks[Math.round(Math.random()*(meteoritesLooks.length - 1))]);
    m.setVelocity(-1*Math.random()*30 - 90, (Math.random()*20) - 10);
}

function increaseTimeAlive() {
    timeAlive += 0.01;
    timeAliveText.setText('Time: ' + Math.trunc(timeAlive*100) / 100);
}

function posterDefect() {
    if(Math.random() > 0.5) {
        poster.anims.play('posterDefectOff', true);
    } else {
        poster.anims.play('posterDefectOn', true);
    }
}