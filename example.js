var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });var leftEmitter;var ball;
function preload() {    game.load.spritesheet('balls', 'balls.png', 17, 17);}
function create() {    leftEmitter = game.add.emitter(50, game.world.centerY - 200);    
    leftEmitter.bounce.setTo(0.5, 0.5);    
    leftEmitter.setXSpeed(100, 200);    
    leftEmitter.setYSpeed(-50, 50);    
    leftEmitter.makeParticles('balls', 0, 250, 1, true);    
    ball = game.add.sprite(100,100, "balls", 2);    
    ball.scale.x = 5;    
    ball.scale.y = 5;    
    game.physics.enable(ball, Phaser.Physics.ARCADE);    
    leftEmitter.start(false, 5000, 20);}
function update() {    game.physics.arcade.collide(ball, leftEmitter , change, null, this);}
function change(a,  {    a_frame = 3,    b_frame = 3})
