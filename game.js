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
var worldWidth = config.width *5;
var life = 5;
var lifeText;
var score = 0;
var scoreText;

function preload() {
    this.load.image('fon', 'assets/fon.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('heart', 'assets/heart.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('bush', 'assets/bush.png');
    this.load.image('stone', 'assets/stone.png');
    this.load.image('tree', 'assets/tree.png');
    this.load.spritesheet('dude', 'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
    this.load.spritesheet('dude', 'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
    this.load.image('sg_start', 'assets/skyground_start.png');
    this.load.image('sg_body', 'assets/skyground_body.png');
    this.load.image('sg_end', 'assets/skyground_end.png');
}

function create() {
    //background
    this.add.tileSprite(0, 0, worldWidth, 1080, 'fon')
        .setOrigin(0, 0);

    //platforms
    var platforms;

    platforms = this.physics.add.staticGroup();
    
    for (var x = 0; x < worldWidth; x = x + 400) {
        console.log(x);
        platforms.create(x, 1048, 'ground')
            .setOrigin(0, 0)
            .refreshBody();
    }

    //skyground
    var skyground;

    skyground = this.physics.add.staticGroup();
    
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(400, 600)) {
        var y = Phaser.Math.FloatBetween(128 * 6, 128 * 7)
        console.log(x, y);
        skyground.create(x, y, 'sg_start')
            .setOrigin(0, 0)
            .refreshBody();

        for (var i = 1; i < Phaser.Math.FloatBetween(1, 5); i++) {
            skyground.create(x + 128, y, 'sg_body')
                .setOrigin(0, 0)
                .refreshBody();
        }

        skyground.create(x + 256, y, 'sg_end')
            .setOrigin(0, 0)
            .refreshBody();
    }

    //trees
    var tree;

    tree = this.physics.add.staticGroup();
    
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(700, 800)) {
        console.log(x);
        tree.create(x, 1048 + 10, 'tree')
            .setOrigin(0, 1)
            .setScale(Phaser.Math.FloatBetween(0.8, 1))
            .setDepth(Phaser.Math.FloatBetween(0, 10))
            .refreshBody();
    }
    //bushes
    var bush;

    bush = this.physics.add.staticGroup();
    
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(600, 700)) {
        console.log(x);
        bush.create(x, 1048, 'bush')
            .setOrigin(0, 1)
            .setScale(Phaser.Math.FloatBetween(0.4, 0.6))
            .setDepth(Phaser.Math.FloatBetween(0, 10))
            .refreshBody();
    }

    //stones
    var stone;

    stone = this.physics.add.staticGroup();
    
    for (var x = 1000; x < worldWidth; x = x + Phaser.Math.FloatBetween(500, 700)) {
        console.log(x);
        stone.create(x, 1048, 'stone')
            .setOrigin(0, 1)
            .setScale(Phaser.Math.FloatBetween(0.4, 0.6))
            .setDepth(Phaser.Math.FloatBetween(0, 10))
            .refreshBody();
    }

    //player
    player = this.physics.add.sprite(100, 450, 'dude');

    player
        .setBounce(0.2)
        .setCollideWorldBounds(true)
        .setDepth(5)

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    player.body
        .setGravityY(200);
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, skyground);

    cursors = this.input.keyboard.createCursorKeys();
    
    //camera
    this.cameras.main.setBounds(0, 0, worldWidth, window.innerHeight);
    this.physics.world.setBounds(0, 100, worldWidth, window.innerHeight);
    this.cameras.main.startFollow(player);

    //score
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' })
        .setOrigin(0, 0)
        .setScrollFactor(0);
    
    //life
    lifeText = this.add.text(1500, 16, showLife(), { fontSize: '32px', fill: '#000' })
        .setOrigin(0, 0)
        .setScrollFactor(0);

    //stars
    stars = this.physics.add.group({
        key: 'star',
        repeat: 99,
        setXY: { x: 20, y: 0, stepX: 100 }
    });

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(stars, skyground);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    //bombs
    bombs = this.physics.add.group({
        key: 'bomb',
        repeat: 14,
        setXY: { x: 20, y: 0, stepX: 300 }
    });
    bombs.children.iterate(function (child) {

        child
            .setBounceY(Phaser.Math.FloatBetween(0.5, .8))
            .setCollideWorldBounds(true)
            .setVelocityX(Phaser.Math.FloatBetween(-500, 500))
            .setVelocityY(Phaser.Math.FloatBetween(-500, 500))
    });

    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(bombs, skyground);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

}
function update() {
    //keyboard
    if (cursors.left.isDown) {
        player.setVelocityX(-220);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(220);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-450);
    }
    
    if(cursors.down.isDown){
        player.setVelocityY(450);
    }
}
    //function for life
    function showLife(){
        var lifeLine = 'Life:'
         for (var i = 0; i < life; i++) { 
            lifeLine += '💕'
        } 
        return lifeLine 
    }

    //function for bombs
    function hitBomb(player, bomb) {
        /*life -= 1;
        lifeText.setText(showLife());
        
        if(life==0){
            gameOver = true;
            gameOverText = this.add.text(600, 500, 'Game Over', { fontSize: '100px', fill: '#000' })
            player.setTint(0xff0000)
            player.anims.play('turn')
        }*/
        score-=10
        scoreText.setText('Score: ' + score);

    }

    //function for stars
    function collectStar(player, star) {
        star.disableBody(true, true);

        score += 10;
        scoreText.setText('Score: ' + score);

        if (stars.countActive(true) === 0) {
            stars.children.iterate(function (child) {

                child.enableBody(true, child.x, 0, true, true);

            });

            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            var bomb = bombs.create(x, 16, 'bomb');
            
            bomb
                .setBounce(1)
                .setCollideWorldBounds(true)
                .setVelocity(Phaser.Math.Between(-200, 200), 20);

        }
    }
    //reset
    var resetButton = this.add.text(400, 450, 'reset').setInteractive();
        resetButton.on('pointerdown', function () {      
            refreshBody();  //в цій функції описати всі дії для перезавантаження     
        });
