// game.js

const config = {
    type: Phaser.AUTO,
    width: 360,
    height: 640,
    backgroundColor: '#f3f3f3',
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 }, // Adjusted gravity for falling speed
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

let score = 0;
let scoreText;
let nextCircleSize;
let nextCircleText;

const circleSizes = Array.from({ length: 15 }, (_, i) => 20 + i * 10); // 15 different sizes
let circlesGroup;
const STARTING_LINE_Y = 100; // Starting line Y position
const CONTAINER_HEIGHT = config.height - STARTING_LINE_Y; // Height of the container below the starting line
const BOUNCE = 0.3; // Bounce value

function preload() {
    // No external assets needed; we'll create circles using Graphics
}

function create() {
    const scene = this;

    // Draw the starting line at the top
    scene.add.line(0, STARTING_LINE_Y, 0, 0, config.width, 0, 0xff0000, 1).setOrigin(0);

    // Add score text
    scoreText = scene.add.text(10, 10, `Score: ${score}`, { fontSize: '18px', fill: '#000' });

    // Initialize next circle size
    nextCircleSize = randomCircleSize();
    nextCircleText = scene.add.text(200, 10, `Next: ${nextCircleSize}`, { fontSize: '18px', fill: '#000' });

    // Create a group to manage all circles
    circlesGroup = scene.physics.add.group({
        collideWorldBounds: true,
        bounceY: BOUNCE,
        bounceX: BOUNCE
    });

    // Input handler: Create a circle where the user clicks/touches
    scene.input.on('pointerdown', (pointer) => {
        createCircle(scene, nextCircleSize, pointer.x, STARTING_LINE_Y + 50); // Drop circles below the starting line
        nextCircleSize = randomCircleSize();
        nextCircleText.setText(`Next: ${nextCircleSize}`);
    });

    // Collision handler: Detect collisions between circles
    scene.physics.add.collider(circlesGroup, circlesGroup, handleCollision, null, scene);

    // Restart button functionality
    document.getElementById('restart-button').addEventListener('click', () => {
        gameOverTriggered = false;
        score = 0;
        scoreText.setText(`Score: ${score}`);
        circlesGroup.clear(true, true); // Clear existing circles
    });
}

function update() {
    const scene = this;

    // Check if the entire container is filled up to the starting line
    let filledHeight = 0;

    circlesGroup.getChildren().forEach(circle => {
        if (circle.y + circle.displayHeight / 2 > STARTING_LINE_Y) {
            const circleBottom = circle.y + circle.displayHeight / 2;
            const heightAboveLine = circleBottom - STARTING_LINE_Y;

            if (heightAboveLine > 0) {
                filledHeight = Math.max(filledHeight, heightAboveLine);
            }
        }
    });

    if (filledHeight >= CONTAINER_HEIGHT && !gameOverTriggered) {
        gameOver();
    }
}

// Function to create a new circle
function createCircle(scene, size, x, y) {
    const textureKey = `circle_${size}_${Phaser.Math.Between(0, 10000)}`;

    const graphics = scene.add.graphics({ fillStyle: { color: getColorBySize(size) } });
    graphics.fillCircle(size / 2, size / 2, size / 2);
    graphics.generateTexture(textureKey, size, size);
    graphics.destroy();

    const circle = scene.physics.add.sprite(x, y, textureKey);
    circle.setDisplaySize(size, size);
    circle.size = size; // Custom property to store size
    circle.body.setCircle(size / 2);
    circle.setCollideWorldBounds(true);
    circle.body.setGravityY(400); // Adjusted gravity for faster falling

    // Apply bounce effect
    circle.body.setBounce(BOUNCE);
    circle.body.setVelocityX(0); // Ensure no horizontal movement

    circlesGroup.add(circle);
}

// Function to handle collisions between circles
function handleCollision(circle1, circle2) {
    if (!circle1.active || !circle2.active) return;

    if (circle1.size === circle2.size) {
        const scene = circle1.scene;

        const newSize = circle1.size + 10;

        if (newSize > Math.max(...circleSizes)) return;

        const newX = (circle1.x + circle2.x) / 2;
        const newY = (circle1.y + circle2.y) / 2;

        createCircle(scene, newSize, newX, newY);

        score += newSize;
        scoreText.setText(`Score: ${score}`);

        circle1.destroy();
        circle2.destroy();
    }
}

// Function to generate a random circle size
function randomCircleSize() {
    return circleSizes[Math.floor(Math.random() * circleSizes.length)];
}

// Function to determine color based on circle size
function getColorBySize(size) {
    const colors = {
        20: 0x3498db,
        30: 0x2ecc71,
        40: 0xe67e22,
        50: 0xe74c3c,
        60: 0x9b59b6,
        70: 0xf1c40f,
        80: 0x1abc9c,
        90: 0x34495e,
        100: 0xe84393,
        // Add more colors for additional sizes if needed
    };
    return colors[size] || 0x0000ff; // Default to blue if size not found
}

// Function to handle game over
function gameOver() {
    if (!gameOverTriggered) {
        gameOverTriggered = true;
        alert(`Game Over! Your score: ${score}`);
        // You can optionally add more actions here if needed
    }
}

let gameOverTriggered = false; // Track if game over has been triggered
