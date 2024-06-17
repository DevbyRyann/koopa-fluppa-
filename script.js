const bird = document.getElementById('bird');
const gameContainer = document.getElementById('game-container');
const obstaclesContainer = document.getElementById('obstacles');
const scoreDisplay = document.getElementById('score');
const bonusDisplay = document.getElementById('bonus');
const recordDisplay = document.getElementById('record');
const jumpSound = document.getElementById('jump-sound');
const scoreSound = document.getElementById('score-sound');
const backgroundMusic = document.getElementById('background-music');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const gameOverScreen = document.getElementById('game-over-screen');

let birdY = window.innerHeight / 2;
let birdVelocity = 1;
const gravity = 0.5;
const jumpHeight = 10;
let obstacleSpeed = 2;
let obstacleFrequency = 2000;
let score = 0;
let bonus = 0;
let gameOver = false;
let obstacleInterval;
let obstacleX = window.innerWidth;
let difficultyIncrement = 0.9;
let survivalTime = 0;
let survivalInterval;
let record = localStorage.getItem('record') || 0;
recordDisplay.textContent = `Recorde: ${record}`;

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (startScreen.style.display !== 'none') {
            startGame();
        } else if (gameOver) {
            resetToStartScreen();
        } else {
            birdVelocity = -jumpHeight;
            jumpSound.currentTime = 0;
            jumpSound.volume = 0.3;
            jumpSound.play();
        }
    }
});

startBtn.addEventListener('click', startGame);

function startGame() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none'; // Esconde a tela de Game Over ao iniciar o jogo
    bird.style.display = 'block';
    restartGame();
}

function showGameOverScreen() {
    bird.style.display = 'none';
    gameOverScreen.style.display = 'flex';
    backgroundMusic.pause();
}

function resetToStartScreen() {
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'flex';
}

function gameLoop() {
    if (gameOver) return;

    if (startScreen.style.display === 'none') {
        birdVelocity += gravity;
        birdY += birdVelocity;

        // Verificar se o personagem caiu fora da tela
        if (birdY + bird.clientHeight > window.innerHeight || birdY < 0) {
            showGameOverScreen();
            gameOver = true;
        } else {
            bird.style.top = `${birdY}px`;
        }

        checkCollision();
    } else {
        // Manter o personagem parado no ar na tela de início
        bird.style.top = `${window.innerHeight / 2}px`;
    }

    requestAnimationFrame(gameLoop);
}

const BIRD_SIZE_ADJUSTMENT = {
    top: 10,
    right: -10,
    bottom: -10,
    left: 10
};

function createObstacle() {
    if (gameOver || startScreen.style.display !== 'none') return;

    const obstacleHeightTop = Math.random() * (window.innerHeight / 2);
    const obstacleGap = 250; // Aumentar o espaço entre os obstáculos

    const topObstacle = document.createElement('div');
    topObstacle.classList.add('obstacle');
    const pipeHeadTop = document.createElement('div');
    pipeHeadTop.classList.add('pipe-head');
    const pipeBodyTop = document.createElement('div');
    pipeBodyTop.classList.add('pipe-body');
    pipeBodyTop.style.height = `${obstacleHeightTop}px`;

    topObstacle.appendChild(pipeHeadTop);
    topObstacle.appendChild(pipeBodyTop);
    topObstacle.style.left = `${window.innerWidth}px`;
    topObstacle.style.bottom = `${window.innerHeight - obstacleHeightTop}px`;

    obstaclesContainer.appendChild(topObstacle);

    const bottomObstacle = document.createElement('div');
    bottomObstacle.classList.add('obstacle');
    const pipeBodyBottom = document.createElement('div');
    pipeBodyBottom.classList.add('pipe-body');
    const pipeHeadBottom = document.createElement('div');
    pipeHeadBottom.classList.add('pipe-head');
    const obstacleHeightBottom = window.innerHeight - obstacleHeightTop - obstacleGap;
    pipeBodyBottom.style.height = `${obstacleHeightBottom}px`;

    bottomObstacle.appendChild(pipeBodyBottom);
    bottomObstacle.appendChild(pipeHeadBottom);
    bottomObstacle.style.left = `${window.innerWidth}px`;
    bottomObstacle.style.top = `${window.innerHeight - obstacleHeightBottom}px`;

    obstaclesContainer.appendChild(bottomObstacle);

    moveObstacle(topObstacle);
    moveObstacle(bottomObstacle);
}

function updateScore() {
    score++;
    scoreDisplay.textContent = score;
    scoreSound.currentTime = 0;
    scoreSound.play();

    // Aumentar a dificuldade gradativamente
    obstacleSpeed += difficultyIncrement;
    if (obstacleFrequency > 800) {
        obstacleFrequency -= 80;
        clearInterval(obstacleInterval);
        obstacleInterval = setInterval(createObstacle, obstacleFrequency);
    }
}
function moveObstacle(obstacle) {
    let obstacleX = gameContainer.clientWidth;

    function move() {
        if (gameOver) {
            obstacle.remove();
            return;
        }

        obstacleX -= obstacleSpeed;
        obstacle.style.left = `${obstacleX}px`;

        if (obstacleX + obstacle.clientWidth < bird.offsetLeft && !obstacle.passed) {
            obstacle.passed = true;
            updateScore();
        }

        if (obstacleX + obstacle.clientWidth < 0) {
            obstacle.remove();
        } else {
            requestAnimationFrame(move);
        }
    }

    move();
}

function checkCollision() {
    const birdRect = bird.getBoundingClientRect();

    const birdCollisionBox = {
        top: birdRect.top + 10,
        right: birdRect.right - 10,
        bottom: birdRect.bottom - 10,
        left: birdRect.left + 10
    };

    document.querySelectorAll('.obstacle').forEach(obstacle => {
        const obstacleRect = obstacle.getBoundingClientRect();

        if (
            birdCollisionBox.right > obstacleRect.left &&
            birdCollisionBox.left < obstacleRect.right &&
            birdCollisionBox.bottom > obstacleRect.top &&
            birdCollisionBox.top < obstacleRect.bottom
        ) {
            showGameOverScreen();
            gameOver = true;
        }
    });
}
function increaseDifficulty() {
    obstacleSpeed += difficultyIncrement;
    if (obstacleFrequency > 800) {
        obstacleFrequency -= 80;
        clearInterval(obstacleInterval);
        obstacleInterval = setInterval(createObstacle, obstacleFrequency);
    }
}

function endGame() {
    clearInterval(obstacleInterval);
    clearInterval(survivalInterval);

    if (score > record) {
        record = score;
        localStorage.setItem('record', record);
        recordDisplay.textContent = `Novo Recorde: ${record}`;
    } else {
        recordDisplay.textContent = `Recorde: ${record}`;
    }
}

function restartGame() {
    birdY = window.innerHeight / 2;
    birdVelocity = 0;
    score = 0;
    bonus = 0;
    gameOver = false;
    obstacleSpeed = 4;
    obstacleFrequency = 4000;
    obstaclesContainer.innerHTML = '';
    scoreDisplay.textContent = score;
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();

    clearInterval(obstacleInterval);
    clearInterval(survivalInterval);

    obstacleInterval = setInterval(createObstacle, obstacleFrequency);
    survivalInterval = setInterval(increaseDifficulty, 10000);

    requestAnimationFrame(gameLoop);
}

// Iniciar o loop do jogo
requestAnimationFrame(gameLoop);
