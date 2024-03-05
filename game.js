var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var worldWidth = 9600;

function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('bush', 'assets/bush.png');
    this.load.image('stone', 'assets/stone.png');
    this.load.image('tree', 'assets/tree.png');
    this.load.spritesheet('dude', 'assets/dude.png',
    { frameWidth: 32, frameHeight: 48 }
    );
    this.load.image('fon1', 'assets/fon.png');
}

function create ()
{
    this.add.tileSprite(0, 0, worldWidth, 1080, 'fon1').setOrigin(0, 0);
    //this.add.image(1100, 500, 'sky');
    //this.add.image(1100, 500, 'star');
    //platforms
    var platforms;

    platforms = this.physics.add.staticGroup();
    for(var x=0;x<worldWidth; x=x+400){
        console.log(x);
        platforms.create(x,1048,'ground').setOrigin(0,0).refreshBody();
    }
   //trees
    var tree;

    tree = this.physics.add.staticGroup();
    for(var x=0;x<worldWidth; x=x+Phaser.Math.FloatBetween(700,800)){
        console.log(x);
        tree.create(x,1048,'tree').setOrigin(0,1).setScale(Phaser.Math.FloatBetween(0.8,1)).setDepth().refreshBody();
    }
    //bushes
    var bush;

    bush = this.physics.add.staticGroup();
    for(var x=0;x<worldWidth; x=x+Phaser.Math.FloatBetween(700,800)){
        console.log(x);
        bush.create(x,1048,'bush').setOrigin(0,1).setScale(Phaser.Math.FloatBetween(0.8,1)).refreshBody();
    }
    //stones
    var stone;

    stone = this.physics.add.staticGroup();
    for(var x=1000;x<worldWidth; x=x+Phaser.Math.FloatBetween(1000,1100)){
        console.log(x);
       stone.create(x,1048,'stone').setOrigin(0,1).setScale(Phaser.Math.FloatBetween(0.8,1)).refreshBody();
    }

    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.cameras.main.setBounds(0,0,worldWidth,window.innerHeight);
    this.physics.world.setBounds(0,100,worldWidth,window.innerHeight);
    this.cameras.main.startFollow(player);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    player.body.setGravityY(300);
    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    stars.children.iterate(function (child) {
    
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    
    });
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    function collectStar (player, star)
{
    star.disableBody(true, true);
}
    var score = 0;
    var scoreText;
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    function collectStar (player, star)
{
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);
}
bombs = this.physics.add.group();

this.physics.add.collider(bombs, platforms);

this.physics.add.collider(player, bombs, hitBomb, null, this);
function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
    gameOverText = this.add.text(200, 130, 'Game Over', { fontSize: '60px', fill: '#000' })

}
function collectStar (player, star)
{
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    }
}
}
function update ()
{
    if (cursors.left.isDown)
{
    player.setVelocityX(-220);

    player.anims.play('left', true);
}
else if (cursors.right.isDown)
{
    player.setVelocityX(220);

    player.anims.play('right', true);
}
else
{
    player.setVelocityX(0);

    player.anims.play('turn');
}

if (cursors.up.isDown && player.body.touching.down)
{
    player.setVelocityY(-450);
}
}
