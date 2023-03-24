const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.7;

const ground = {
    x: 0,
    y: canvas.height * 0.7,
    width: canvas.width,
    height: canvas.height * 0.3,
    color: 'green',
};

const player = {
    x: 100,
    y: 200,
    width: 75,
    height: 75,
    speed: 4,
    color: 'blue',
    vy: 0,
    gravity: 0.25,
    jumpPower: 12,
    grounded: false,
    direction: 'right',
};

const successMessages = [
    'His seafood is so fresh it’ll slap ya.',
    'Shut the Front Door.',
    'We’re Riding the Bus to Flavortown!',
    'Dude, I’ve been stricken by chicken!',
    'What a hot frisbee of fun!',
    'Some people are just born to cook and talk.',
    'I can’t play the guitar, but I can play the griddle.',
];

function getRandomSuccessMessage() {
    const index = Math.floor(Math.random() * successMessages.length);
    return successMessages[index];
}

function generateObstacles(numObstacles) {
    const obstacles = [];
    const minWidthBetweenObstacles = 100; // Set the minimum width between obstacles

    for (let i = 0; i < numObstacles; i++) {
        const x = 200 + i * minWidthBetweenObstacles + Math.random() * (canvas.width - 600 - (numObstacles - 1) * minWidthBetweenObstacles) / numObstacles;
        const minHeight = 60;
        const maxHeight = 300;
        const height = minHeight + Math.random() * (maxHeight - minHeight);

        obstacles.push({ x: x, y: ground.y - height, width: 50, trunkWidth: 20, height: height, color: 'red' });
    }
    return obstacles;
}

const obstacles = generateObstacles(5);

const collectible = {
    x: 200 + Math.random() * (canvas.width - 400),
    y: ground.y - 150 - Math.random() * 150,
    width: 60,
    height: 60,
    color: 'gold',
    collected: false,
};

function drawObstacles() {
    obstacles.forEach(obstacle => {
        // Draw trunk
        ctx.fillStyle = 'saddlebrown';
        ctx.fillRect(
            obstacle.x + (obstacle.width - obstacle.trunkWidth) / 2, // Center the trunk within the leaves
            obstacle.y + obstacle.width / 2,
            obstacle.trunkWidth,
            obstacle.height - obstacle.width / 2
        );

        // Draw leaves
        ctx.beginPath();
        ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.width / 2, obstacle.width / 2, 0, 2 * Math.PI);
        ctx.fillStyle = 'forestgreen';
        ctx.fill();
        ctx.closePath();
    });
}

const kangarooSprite = new Image();
kangarooSprite.src = 'kangaroo.png';

const hamburgerImage = new Image();
hamburgerImage.src = 'collectible.png';

function drawPlayer() {
    ctx.save();

    if (player.direction === 'left') {
        ctx.scale(-1, 1);
        ctx.drawImage(kangarooSprite, -(player.x + player.width), player.y, player.width, player.height);
    } else {
        ctx.drawImage(kangarooSprite, player.x, player.y, player.width, player.height);
    }

    ctx.restore();
}

function drawGround() {
    ctx.fillStyle = ground.color;
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
}

function drawCollectible() {
    if (!collectible.collected) {
        ctx.drawImage(hamburgerImage, collectible.x, collectible.y, collectible.width, collectible.height);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function handleObstacleCollisions() {
    let collision;
    obstacles.forEach(obstacle => {
        if (checkCollision(player, obstacle)) {
            collision = true;
            const prevX = player.x - player.speed * (keys['ArrowRight'] - keys['ArrowLeft']);
            const prevY = player.y - player.vy - player.gravity;

            const prevVertical = { x: player.x, y: prevY, width: player.width, height: player.height };
            const prevHorizontal = { x: prevX, y: player.y, width: player.width, height: player.height };

            if (!checkCollision(prevVertical, obstacle)) {
                if (prevY + player.height <= obstacle.y) {
                    player.y = obstacle.y - player.height;
                    player.vy = 0;
                    player.grounded = true;
                } else {
                    player.y = obstacle.y + obstacle.height;
                    player.vy = 0;
                }
            } else if (!checkCollision(prevHorizontal, obstacle)) {
                if (prevX + player.width <= obstacle.x) {
                    player.x = obstacle.x - player.width;
                } else {
                    player.x = obstacle.x + obstacle.width;
                }
            }
        }
    });
}

function update() {
    const steps = 5; // Number of collision checks per update
    for (let i = 0; i < steps; i++) {
        if (keys['ArrowLeft'] && player.x > 0) {
            player.x -= player.speed / steps;
            player.direction = 'left';
        }
        if (keys['ArrowRight'] && player.x + player.width < canvas.width) {
            player.x += player.speed / steps;
            player.direction = 'right';
        }

        if (keys[' ']) {
            jump();
        }

        player.y += player.vy / steps;
        player.vy += player.gravity / steps;

        if (player.y >= ground.y - player.height) {
            player.y = ground.y - player.height;
            player.grounded = true;
            player.vy = 0;
        }

        handleObstacleCollisions();
    }

    clearCanvas();
    drawGround();
    drawPlayer();
    drawObstacles();
    drawCollectible();
    if (!collectible.collected) {
        checkCollectible();
    }

    requestAnimationFrame(update);
}

let modalShown = false;

function checkCollectible() {
    if (checkCollision(player, collectible) && !modalShown) {
        collectible.collected = true;
        showModal();
    }
}

function showModal() {
    const modal = document.getElementById('modal');
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = getRandomSuccessMessage();
    modal.style.display = 'flex';
    modalShown = true;
}

const playAgainBtn = document.getElementById('playAgain');
playAgainBtn.addEventListener('click', () => {
    location.reload();
});


function jump() {
    if (player.grounded) {
        player.grounded = false;
        player.vy -= player.jumpPower;
    }
}

const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

update();
