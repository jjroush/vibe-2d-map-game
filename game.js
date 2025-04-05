const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let npcs = [];
let challenges = [
    { text: "Solve this math problem: 2 + 2 = ?", answer: "4" },
    { text: "What color is the sky?", answer: "blue" },
    { text: "How many fingers do you have?", answer: "10" }
];

// Grid settings
const TILE_SIZE = 32;
const GRID_WIDTH = 25;
const GRID_HEIGHT = 19;
let playerGridX = 12;
let playerGridY = 9;
let isMoving = false;
let currentDirection = 'down';
let gameScene;

function preload() {
    // Load assets
    this.load.spritesheet('player', 'https://labs.phaser.io/assets/sprites/dude.png', { 
        frameWidth: 32, 
        frameHeight: 48 
    });
    this.load.image('npc', 'https://labs.phaser.io/assets/sprites/phaser-ship.png');
    this.load.image('tiles', 'https://labs.phaser.io/assets/sprites/tiles.png');
}

function create() {
    gameScene = this;
    
    // Create a simple background grid
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            this.add.rectangle(
                x * TILE_SIZE + TILE_SIZE/2, 
                y * TILE_SIZE + TILE_SIZE/2, 
                TILE_SIZE, 
                TILE_SIZE, 
                0x90EE90, 
                0.3
            );
        }
    }

    // Create player animations
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'player', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // Create player
    player = this.physics.add.sprite(
        playerGridX * TILE_SIZE + TILE_SIZE/2, 
        playerGridY * TILE_SIZE + TILE_SIZE/2, 
        'player'
    );
    player.setCollideWorldBounds(true);
    player.setScale(0.8);

    // Create NPCs
    for (let i = 0; i < 3; i++) {
        const x = Phaser.Math.Between(3, GRID_WIDTH-4);
        const y = Phaser.Math.Between(3, GRID_HEIGHT-4);
        const npc = this.physics.add.sprite(
            x * TILE_SIZE + TILE_SIZE/2, 
            y * TILE_SIZE + TILE_SIZE/2, 
            'npc'
        );
        npc.setInteractive();
        npc.setScale(0.5);
        npc.challenge = challenges[i];
        npcs.push(npc);
    }

    // Setup input
    cursors = this.input.keyboard.createCursorKeys();

    // Setup NPC interaction
    npcs.forEach(npc => {
        npc.on('pointerdown', () => {
            const userAnswer = prompt(npc.challenge.text);
            if (userAnswer && userAnswer.toLowerCase() === npc.challenge.answer.toLowerCase()) {
                alert('Correct! Well done!');
                npc.destroy();
            } else {
                alert('Try again!');
            }
        });
    });
}

function update() {
    // Only process movement if not already moving
    if (!isMoving) {
        // Check for movement input
        if (cursors.left.isDown) {
            movePlayer('left');
        } else if (cursors.right.isDown) {
            movePlayer('right');
        } else if (cursors.up.isDown) {
            movePlayer('up');
        } else if (cursors.down.isDown) {
            movePlayer('down');
        } else {
            // Idle animation
            player.anims.play('turn', true);
        }
    }

    // Update player position based on grid
    player.x = playerGridX * TILE_SIZE + TILE_SIZE/2;
    player.y = playerGridY * TILE_SIZE + TILE_SIZE/2;
}

function movePlayer(direction) {
    if (isMoving) return;
    
    currentDirection = direction;
    isMoving = true;
    
    // Set animation based on direction
    if (direction === 'left') {
        player.anims.play('left', true);
        playerGridX = Math.max(0, playerGridX - 1);
    } else if (direction === 'right') {
        player.anims.play('right', true);
        playerGridX = Math.min(GRID_WIDTH - 1, playerGridX + 1);
    } else if (direction === 'up') {
        player.anims.play('turn', true);
        playerGridY = Math.max(0, playerGridY - 1);
    } else if (direction === 'down') {
        player.anims.play('turn', true);
        playerGridY = Math.min(GRID_HEIGHT - 1, playerGridY + 1);
    }
    
    // Add a small delay to make movement feel more grid-based
    if (gameScene) {
        gameScene.time.delayedCall(150, () => {
            isMoving = false;
        });
    } else {
        // Fallback if gameScene is not available
        setTimeout(() => {
            isMoving = false;
        }, 150);
    }
} 