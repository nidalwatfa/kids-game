const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// واجهة
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const titleEl = document.getElementById("title");

// تحكم
let input = { left: false, right: false, jump: false };

function setupTouch(id, key) {
    const el = document.getElementById(id);
    el.addEventListener("touchstart", e => { e.preventDefault(); input[key] = true; });
    el.addEventListener("touchend", e => { e.preventDefault(); input[key] = false; });
}
setupTouch("leftBtn", "left");
setupTouch("rightBtn", "right");
setupTouch("jumpBtn", "jump");

// اللاعب
let player = {
    x: 100,
    y: 200,
    width: 40,
    height: 60,
    vx: 0,
    vy: 0,
    speed: 5,
    jumpPower: 18,
    onGround: false,
    color: "#ffd93b"
};

const gravity = 1;
const maxFall = 25;

// المرحلة
let score = 0;
let lives = 3;

const level = {
    platforms: [
        { x: 0, y: 400, w: 400, h: 40 },
        { x: 450, y: 350, w: 200, h: 40 },
        { x: 700, y: 300, w: 200, h: 40 },
        { x: 950, y: 350, w: 200, h: 40 }
    ],
    coins: [
        { x: 480, y: 300, collected: false },
        { x: 730, y: 250, collected: false },
        { x: 980, y: 300, collected: false }
    ],
    goal: { x: 1150, y: 260, w: 50, h: 90 }
};

let camera = { x: 0, y: 0 };

// تحديث
function update() {
    player.vx = 0;
    if (input.left) player.vx = -player.speed;
    if (input.right) player.vx = player.speed;

    if (input.jump && player.onGround) {
        player.vy = -player.jumpPower;
        player.onGround = false;
    }

    player.vy += gravity;
    if (player.vy > maxFall) player.vy = maxFall;

    player.x += player.vx;
    player.y += player.vy;

    player.onGround = false;

    for (const p of level.platforms) {
        if (
            player.x < p.x + p.w &&
            player.x + player.width > p.x &&
            player.y < p.y + p.h &&
            player.y + player.height > p.y
        ) {
            if (player.vy > 0 && player.y + player.height - player.vy <= p.y) {
                player.y = p.y - player.height;
                player.vy = 0;
                player.onGround = true;
            }
        }
    }

    for (const c of level.coins) {
        if (c.collected) continue;
        const dx = (player.x + player.width / 2) - c.x;
        const dy = (player.y + player.height / 2) - c.y;
        if (Math.sqrt(dx*dx + dy*dy) < 30) {
            c.collected = true;
            score += 10;
            scoreEl.textContent = score;
        }
    }

    const g = level.goal;
    if (
        player.x < g.x + g.w &&
        player.x + player.width > g.x &&
        player.y < g.y + g.h &&
        player.y + player.height > g.y
    ) {
        alert("أحسنت! أنهيت المرحلة.");
        resetLevel();
    }

    if (player.y > canvas.height + 300) {
        loseLife();
    }

    camera.x = player.x - canvas.width / 3;
    if (camera.x < 0) camera.x = 0;
}

function loseLife() {
    lives--;
    livesEl.textContent = lives;
    if (lives <= 0) {
        alert("انتهت القلوب! لنبدأ من جديد.");
        lives = 3;
        score = 0;
        scoreEl.textContent = score;
    }
    resetLevel();
}

function resetLevel() {
    player.x = 50;
    player.y = 100;
    player.vx = 0;
    player.vy = 0;
    for (const c of level.coins) c.collected = false;
}

// رسم
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    ctx.fillStyle = "#2d572c";
    ctx.fillRect(camera.x - 1000, 440, canvas.width + 2000, 200);

    for (const p of level.platforms) {
        ctx.fillStyle = "#3b5d2a";
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(p.x, p.y, p.w, 10);
    }

    for (const c of level.coins) {
        if (c.collected) continue;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd700";
        ctx.fill();
    }

    const g = level.goal;
    ctx.fillStyle = "#9b59b6";
    ctx.fillRect(g.x, g.y, g.w, g.h);

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.restore();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
