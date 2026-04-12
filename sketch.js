// ── Sounds ─────────────────────────────────────────
let bgm;
let gateOpen;

function preload() {
  bgm = loadSound("sounds/BGM.mp3");
  gateOpen = loadSound("sounds/gate_open.wav");
}

// ── Preset ritual sequences ─────────────────────────────────────────
// 1=Check Ticket  2=Check License  3=Click Pen  4=Stamp Guest Log  5=Talk Into Speaker
const RITUAL_SQUARE = [1, 3, 5, 2, 4]; // Check Ticket → Click Pen → Talk Into Speaker → Check License → Stamp Guest Log
const RITUAL_TRIANGLE = [4, 2, 1, 5, 3]; // Stamp Guest Log → Check License → Check Ticket → Talk Into Speaker → Click Pen
const RITUAL_CIRCLE = [2, 5, 3, 1, 4]; // Check License → Talk Into Speaker → Click Pen → Check Ticket → Stamp Guest Log
const RITUAL_DIAMOND = [5, 1, 4, 3, 2]; // Talk Into Speaker → Check Ticket → Stamp Guest Log → Click Pen → Check License

let clickHistory = [];
let disabled = [false, false, false, false, false];
let submissions = [];
let triedToOpenGateWithoutSubmission = false;
let wrongCount = 0;
let isMatch;
let gameOver = false;
let showGuidebook = false;
let gameWon = false;
// Shape colours — used by car badge, past-customers bar, and guidebook
const SHAPE_COLORS = {
  square: [40, 120, 220],
  triangle: [220, 60, 60],
  circle: [220, 130, 30],
  diamond: [140, 50, 200],
};

let guidebookPage = 1; // 1 or 2

// shapeArray drives what badge each car shows.
// Morning: only square / triangle / none
// Afternoon & Night: all four shapes + none
let shapeArray = [];

// ── Training guest tracking ────────────────────────────────────────
// A "training guest" is the first time a particular shape appears.
// During training: no timer runs, and the next required button is highlighted.
let seenShapes = new Set(); // shapes already trained on

function isTrainingGuest() {
  let shapeIndex = submissions.length % shapeArray.length;
  let shape = shapeArray[shapeIndex];
  if (shape === "none") return false; // free-choice is never training
  return !seenShapes.has(shape);
}

// Returns which button index (0-based) should be highlighted next,
// or -1 if we're not in training mode or the guest is done clicking.
function getTrainingHighlightIndex() {
  if (!isTrainingGuest()) return -1;
  let shapeIndex = submissions.length % shapeArray.length;
  let shape = shapeArray[shapeIndex];
  let ritual = getRitualForShape(shape);
  if (!ritual) return -1;
  let nextStep = clickHistory.length; // how many steps already clicked
  if (nextStep >= ritual.length) return -1;
  return ritual[nextStep] - 1; // convert 1-based to 0-based button index
}

function getRitualForShape(shape) {
  if (shape === "square") return RITUAL_SQUARE;
  if (shape === "triangle") return RITUAL_TRIANGLE;
  if (shape === "circle") return RITUAL_CIRCLE;
  if (shape === "diamond") return RITUAL_DIAMOND;
  return null;
}

function buildShapeArrayForShift(shiftId) {
  let pool;
  if (shiftId === "morning") {
    pool = [
      "square",
      "square",
      "square",
      "triangle",
      "triangle",
      "triangle",
      "none",
      "none",
    ];
  } else {
    pool = [
      "square",
      "square",
      "triangle",
      "triangle",
      "circle",
      "circle",
      "diamond",
      "diamond",
      "none",
      "none",
    ];
  }
  // Fisher-Yates shuffle — but ensure the first unseen shapes appear first
  // so training guests are encountered early in the shift.
  // We keep it simple: just shuffle normally; the seenShapes set handles detection.
  for (let i = pool.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  shapeArray = pool;
}
let showModal = false;
let modalX, modalY, modalW, modalH;
let closeX, closeY, closeW, closeH;
let guestIndex = 0;

// Feedback shape shown on screen after guests 1 & 2 submit
let showFeedbackShape = false;
let feedbackShapeType = "";
let feedbackShapeTimer = 0;

// Weather system
let raindrops = [];
let lightningTimer = 0;
let lightningFlash = false;
let thunderbolts = [];

// ── In-game clock ──────────────────────────────────────────────────
// Tracks fictional time of day in minutes from midnight
// Morning starts 06:00 (360 min), afternoon 12:00 (720), night 18:00 (1080)
const SHIFT_START_MINUTES = [360, 720, 1080]; // 06:00, 12:00, 18:00
const SHIFT_MINUTES_PER_GUEST = [60, 30, 15]; // how many in-game minutes each served guest advances the clock
let gameClockMinutes = 360; // current in-game time in minutes from midnight

function initGameClock() {
  gameClockMinutes = SHIFT_START_MINUTES[currentShift];
}

function tickGameClock() {
  gameClockMinutes += SHIFT_MINUTES_PER_GUEST[currentShift];
  // Cap at 23:59 (1439) so the clock doesn't wrap weirdly
  if (gameClockMinutes > 1439) gameClockMinutes = 1439;
}

function drawGameClock() {
  let sh = getCurrentShift();
  let isNight = sh.id === "night";

  // Position: top-right, just below the past-customers legend
  let cx = width - 52,
    cy = 100,
    r = 34;

  push();

  // Panel background
  noStroke();
  fill(0, 0, 0, 40);
  ellipse(cx + 3, cy + 4, (r + 14) * 2, (r + 14) * 2);

  fill(isNight ? color(18, 28, 68, 230) : color(13, 67, 102, 215));
  stroke(200, 165, 60, 180);
  strokeWeight(1.5);
  ellipse(cx, cy, (r + 14) * 2, (r + 14) * 2);

  // Clock face
  fill(isNight ? color(8, 12, 38) : color(240, 248, 255));
  stroke(200, 165, 60, 120);
  strokeWeight(1);
  ellipse(cx, cy, r * 2, r * 2);

  // Hour markers
  for (let i = 0; i < 12; i++) {
    let a = map(i, 0, 12, -HALF_PI, -HALF_PI + TWO_PI);
    let isMajor = i % 3 === 0;
    let r1 = r - (isMajor ? 8 : 5),
      r2 = r - 2;
    stroke(isNight ? color(160, 170, 220) : color(13, 67, 102));
    strokeWeight(isMajor ? 2 : 1);
    line(
      cx + cos(a) * r1,
      cy + sin(a) * r1,
      cx + cos(a) * r2,
      cy + sin(a) * r2,
    );
  }

  // Clock hands
  let totalMinutes = gameClockMinutes;
  let h = totalMinutes / 60;
  let m = totalMinutes % 60;

  // Hour hand
  let hAngle = map(h % 12, 0, 12, -HALF_PI, -HALF_PI + TWO_PI);
  stroke(isNight ? color(200, 210, 255) : color(13, 67, 102));
  strokeWeight(3);
  line(cx, cy, cx + cos(hAngle) * (r * 0.55), cy + sin(hAngle) * (r * 0.55));

  // Minute hand
  let mAngle = map(m, 0, 60, -HALF_PI, -HALF_PI + TWO_PI);
  stroke(isNight ? color(180, 195, 255) : color(40, 90, 160));
  strokeWeight(2);
  line(cx, cy, cx + cos(mAngle) * (r * 0.8), cy + sin(mAngle) * (r * 0.8));

  // Centre dot
  fill(200, 165, 60);
  noStroke();
  ellipse(cx, cy, 6, 6);

  // Digital readout below
  let hh = floor(h) % 24;
  let mm = floor(m);
  let ampm = hh >= 12 ? "PM" : "AM";
  let hDisp = hh % 12 === 0 ? 12 : hh % 12;
  let mDisp = nf(mm, 2);
  let timeStr = hDisp + ":" + mDisp;

  noStroke();
  fill(isNight ? color(18, 28, 68, 210) : color(13, 67, 102, 200));
  rect(cx - 28, cy + r + 6, 56, 18, 6);
  fill(200, 165, 60);
  textAlign(CENTER, CENTER);
  textFont("Georgia, serif");
  textSize(11);
  text(timeStr + " " + ampm, cx, cy + r + 15);

  pop();
}

// ── Shift / timer system ───────────────────────────────────────────
let shiftTimerSeconds = 60; // current timer value (counts down)
let shiftTimerMax = 60; // max for the current shift
let shiftTimerActive = false; // only ticks while car is waiting & player has started clicking
let timerStarted = false; // has the player clicked anything this turn?
let timerExpired = false; // did the timer run out?
let lastFrameTime = 0;
let shiftGuestsCompleted = 0; // how many non-training guests done this shift

// No hard-coded training count — training is determined per-shape via seenShapes
const TRAINING_GUESTS = 0;

// ── Car animation ──
let frozenShape = "square";
let frozenCarColor;
let frozenAnimalName = "dog";
let frozenGuestLabel = "Guest #1: Doug";

let carAnimX;
let carState = "entering";
let carStopX;
let gateAngle = 0;

function resetShiftTimer() {
  let sh = getCurrentShift();
  shiftTimerMax = sh.timerSeconds;
  shiftTimerSeconds = sh.timerSeconds;
  shiftTimerActive = false;
  timerStarted = false;
  timerExpired = false;
  lastFrameTime = millis();
}

function initGameClockForCurrentShift() {
  gameClockMinutes = SHIFT_START_MINUTES[currentShift];
}

function setup() {
  createCanvas(1250, 680);
  carStopX = width * 0.54;
  carAnimX = -200;

  buildShapeArrayForShift("morning");

  modalW = 600;
  modalH = 400;
  modalX = (width - modalW) / 2;
  modalY = (height - modalH) / 2;
  closeW = 80;
  closeH = 40;
  closeX = modalX + modalW - closeW - 10;
  closeY = modalY + 10;

  for (let i = 0; i < 200; i++) {
    raindrops.push({
      x: random(width),
      y: random(-height, 0),
      speed: random(8, 18),
      len: random(10, 25),
    });
  }

  refreshFrozenCar();
  resetShiftTimer();
  initGameClock();
  lastFrameTime = millis();

  bgm.setLoop(true);
  bgm.setVolume(0.4);
  bgm.play();
}

function refreshFrozenCar() {
  let animalList = [
    "dog",
    "cat",
    "bear",
    "fox",
    "rabbit",
    "dog",
    "cat",
    "bear",
  ];
  let shapeIndex = submissions.length % shapeArray.length;
  frozenShape = shapeArray[shapeIndex];
  let sc = SHAPE_COLORS[frozenShape];
  frozenCarColor = sc ? color(sc[0], sc[1], sc[2]) : color(100, 110, 130);
  frozenGuestLabel = "Guest #" + (submissions.length + 1);
  frozenAnimalName = animalList[submissions.length % animalList.length];
}

function draw() {
  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "stage") {
    drawStageScreen();
  } else if (gameState === "play") {
    runGame();
  }
}

// ── Timer tick ─────────────────────────────────────────────────────
function tickTimer() {
  // No timer during training guests
  if (isTrainingGuest()) return;
  if (!shiftTimerActive || timerExpired) return;

  let now = millis();
  let delta = (now - lastFrameTime) / 1000;
  lastFrameTime = now;

  shiftTimerSeconds = max(0, shiftTimerSeconds - delta);

  if (shiftTimerSeconds <= 0 && !timerExpired) {
    timerExpired = true;
    // Auto-submit a wrong answer — penalise the player
    _handleTimerExpiry();
  }
}

function _handleTimerExpiry() {
  wrongCount++;
  submissions.push([]);
  guestIndex++;
  shiftGuestsCompleted++;
  tickGameClock();

  if (wrongCount >= 4) {
    gameOver = true;
    return;
  }

  // Check if shift should advance
  _checkShiftAdvance();

  clickHistory = [];
  disabled = [false, false, false, false, false];
  carState = "raising";
}

function _checkShiftAdvance() {
  let sh = getCurrentShift();
  // Night shift: 100 cars completed = game won
  if (sh.id === "night") {
    if (shiftGuestsCompleted >= sh.guestCount) {
      gameWon = true;
    }
    return;
  }
  if (shiftGuestsCompleted >= sh.guestCount) {
    shiftGuestsCompleted = 0;
    if (currentShift < SHIFTS.length - 1) {
      currentShift++;
      pendingShiftTransition = true;
    }
  }
}

let pendingShiftTransition = false;

function startTimerIfNeeded() {
  // Never start timer during training
  if (isTrainingGuest()) return;
  if (!timerStarted && carState === "waiting") {
    timerStarted = true;
    shiftTimerActive = true;
    lastFrameTime = millis();
  }
}

function updateCarAnim() {
  if (carState === "entering") {
    carAnimX = lerp(carAnimX, carStopX, 0.055);
    if (abs(carAnimX - carStopX) < 0.8) {
      carAnimX = carStopX;
      carState = "waiting";
      resetShiftTimer();
      lastFrameTime = millis();
      // Timer starts automatically as soon as the car arrives (unless training)
      startTimerIfNeeded();
    }
  }

  if (carState === "raising") {
    gateAngle = lerp(gateAngle, -HALF_PI, 0.1);
    if (abs(gateAngle + HALF_PI) < 0.04) {
      gateAngle = -HALF_PI;
      carState = "exiting";
    }
  }

  if (carState === "exiting") {
    carAnimX = lerp(carAnimX, width + 350, 0.07);
    if (carAnimX > width + 200) {
      carAnimX = -200;
      gateAngle = 0;
      carState = "entering";
      refreshFrozenCar();

      // Fire shift transition if needed
      if (pendingShiftTransition) {
        pendingShiftTransition = false;
        gameState = "stage";
        stageAutoStartMs = millis();
        stageAnimFrame = 0;
        stageFadeAlpha = 255;
        initGameClock();
        buildShapeArrayForShift(getCurrentShift().id);
        shiftGuestsCompleted = 0;
      }
    }
  }
}

function drawWeather() {
  if (wrongCount === 1) {
    drawCloudy();
  } else if (wrongCount === 2) {
    drawRain(1.0);
  } else if (wrongCount > 2) {
    drawRain(1.0);
    drawThunder();
  }
  // wrongCount === 0 → do nothing
}

function drawCloudy() {
  noStroke();
  fill(160, 168, 182);
  ellipse(200, 60, 200, 85);
  ellipse(370, 38, 240, 95);
  ellipse(540, 68, 180, 78);
  ellipse(720, 48, 210, 90);
  ellipse(910, 62, 185, 82);
  ellipse(1110, 42, 220, 88);
  fill(140, 148, 162);
  ellipse(140, 82, 160, 68);
  ellipse(440, 58, 195, 75);
  ellipse(640, 52, 200, 80);
  ellipse(860, 68, 170, 70);
  ellipse(1060, 58, 210, 76);
}

function drawSunny() {
  let sunX = width - 120,
    sunY = 80,
    sunR = 50;
  stroke(255, 220, 50, 180);
  strokeWeight(3);
  for (let a = 0; a < TWO_PI; a += PI / 6) {
    line(
      sunX + cos(a) * (sunR + 5),
      sunY + sin(a) * (sunR + 5),
      sunX + cos(a) * (sunR + 20),
      sunY + sin(a) * (sunR + 20),
    );
  }
  noStroke();
  fill(255, 220, 50);
  ellipse(sunX, sunY, sunR * 2, sunR * 2);
}

function drawRain(intensity) {
  let cloudAlpha = map(intensity, 0.3, 1.0, 80, 200);
  noStroke();
  fill(100, 110, 130, cloudAlpha);
  ellipse(200, 60, 180, 80);
  ellipse(350, 40, 220, 90);
  ellipse(500, 70, 160, 70);
  ellipse(700, 50, 200, 85);
  ellipse(900, 65, 170, 75);
  ellipse(1100, 45, 210, 80);
  fill(80, 90, 110, cloudAlpha);
  ellipse(150, 80, 140, 60);
  ellipse(420, 60, 180, 70);
  ellipse(620, 55, 190, 75);
  ellipse(850, 70, 160, 65);
  ellipse(1050, 60, 200, 70);
  let activeCount = floor(raindrops.length * intensity);
  stroke(150, 180, 220, map(intensity, 0.3, 1.0, 100, 200));
  strokeWeight(1.5);
  for (let i = 0; i < activeCount; i++) {
    let d = raindrops[i];
    line(d.x, d.y, d.x - 2, d.y + d.len);
    d.y += d.speed * intensity;
    if (d.y > height) {
      d.y = random(-100, -10);
      d.x = random(width);
    }
  }
}

function drawThunder() {
  if (lightningFlash) {
    fill(255, 255, 200, 80);
    noStroke();
    rect(0, 0, width, height);
    lightningFlash = false;
  }
  for (let i = thunderbolts.length - 1; i >= 0; i--) {
    let tb = thunderbolts[i];
    stroke(255, 255, 100, tb.alpha);
    strokeWeight(3);
    let x = tb.x,
      y = tb.startY;
    beginShape();
    for (let seg of tb.segments) {
      vertex(x + seg.dx, y + seg.dy);
      y += seg.dy;
    }
    endShape();
    tb.alpha -= 8;
    if (tb.alpha <= 0) thunderbolts.splice(i, 1);
  }
  lightningTimer++;
  if (lightningTimer > 60 && random() < 0.04) {
    lightningTimer = 0;
    lightningFlash = true;
    let segs = [],
      totalY = 0;
    while (totalY < 200) {
      let dy = random(20, 50);
      segs.push({ dx: random(-30, 30), dy: dy });
      totalY += dy;
    }
    thunderbolts.push({
      x: random(100, width - 100),
      startY: random(60, 120),
      segments: segs,
      alpha: 255,
    });
  }
}

// ── Night-shift sky overlay ────────────────────────────────────────
function drawNightOverlay() {
  let sh = getCurrentShift();
  if (sh.id !== "night") return;
  // Dark vignette tint
  noStroke();
  fill(8, 12, 35, 160);
  rect(0, 0, width, height);
  // Stars scattered above road
  randomSeed(42);
  fill(220, 225, 255);
  for (let i = 0; i < 80; i++) {
    let sx = random(width),
      sy = random(roadY - 10);
    let sr = random(0.8, 2.0);
    let alpha = 140 + sin(frameCount * 0.03 + i) * 80;
    fill(220, 225, 255, alpha);
    noStroke();
    ellipse(sx, sy, sr * 2, sr * 2);
  }
  // Moon
  let mx = width - 160,
    my = 70;
  fill(240, 240, 210, 220);
  noStroke();
  ellipse(mx, my, 70, 70);
  fill(8, 12, 35);
  noStroke();
  ellipse(mx + 18, my - 5, 62, 62);
  for (let i = 4; i > 0; i--) {
    fill(200, 210, 180, i * 7);
    ellipse(mx, my, 70 + i * 12, 70 + i * 12);
  }
  // Street lamps
  _nightLamp(width * 0.15, roadY);
  _nightLamp(width * 0.45, roadY);
  _nightLamp(width * 0.78, roadY);
}

function _nightLamp(x, ry) {
  stroke(140, 140, 160);
  strokeWeight(3);
  line(x, ry, x, ry - 110);
  fill(160, 160, 180);
  noStroke();
  rect(x - 14, ry - 118, 28, 11, 4);
  fill(255, 245, 200, 200);
  noStroke();
  rect(x - 10, ry - 116, 20, 7, 3);
  // Cone
  for (let i = 0; i < 16; i++) {
    fill(255, 240, 180, map(i, 0, 16, 22, 0));
    let w = i * 14;
    triangle(x, ry - 108, x - w, ry, x + w, ry);
  }
}

// Ambient sky helpers for in-game (drawn before weather clouds)
function _drawMorningSky() {
  // Horizon warm glow
  noStroke();
  for (let i = 0; i < 30; i++) {
    fill(255, 140, 50, map(i, 0, 30, 60, 0));
    ellipse(width / 2, roadY, width * 1.1 + i * 20, 120 + i * 8);
  }
  // Rising sun behind everything
  let sunX = width * 0.15,
    sunY = roadY - 60;
  noStroke();
  for (let i = 5; i > 0; i--) {
    fill(255, 200, 80, i * 14);
    ellipse(sunX, sunY, 90 + i * 18, 90 + i * 18);
  }
  fill(255, 225, 80);
  ellipse(sunX, sunY, 90, 90);
  stroke(255, 200, 60, 120);
  strokeWeight(2);
  for (let a = 0; a < TWO_PI; a += PI / 7) {
    line(
      sunX + cos(a) * 50,
      sunY + sin(a) * 50,
      sunX + cos(a) * 70,
      sunY + sin(a) * 70,
    );
  }
}

function _drawAfternoonSun() {
  let sunX = width - 110,
    sunY = 72;
  noStroke();
  for (let i = 4; i > 0; i--) {
    fill(255, 230, 100, i * 12);
    ellipse(sunX, sunY, 80 + i * 16, 80 + i * 16);
  }
  fill(255, 235, 70);
  ellipse(sunX, sunY, 80, 80);
  stroke(255, 215, 60, 150);
  strokeWeight(2.2);
  for (let a = 0; a < TWO_PI; a += PI / 6) {
    line(
      sunX + cos(a) * 44,
      sunY + sin(a) * 44,
      sunX + cos(a) * 62 + sin(frameCount * 0.04 + a) * 3,
      sunY + sin(a) * 62,
    );
  }
}

function runGame() {
  // Sky colour — blends shift base colour with weather darkening
  let sh = getCurrentShift();

  // Base sky per shift (clear-weather)
  let clearSky;
  if (sh.id === "morning") clearSky = color(255, 210, 140);
  else if (sh.id === "afternoon") clearSky = color(130, 195, 245);
  else clearSky = color(18, 22, 48);

  // Weather darkening overlay
  let stormSky = color(72, 82, 98);
  let stormAmt = constrain(wrongCount / 3, 0, 1);
  let skyColor = lerpColor(clearSky, stormSky, stormAmt);
  background(skyColor);

  if (gameOver) {
    drawWeather();
    drawRoad();
    drawGameOver();
    return;
  }

  // Shift-specific ambient sky (drawn before weather clouds)
  if (sh.id === "morning" && wrongCount === 0) _drawMorningSky();
  else if (sh.id === "afternoon") _drawAfternoonSun();
  else if (sh.id === "night") drawNightOverlay();

  updateCarAnim();
  tickTimer();

  drawWeather();
  drawRoad();

  if (showFeedbackShape) {
    feedbackShapeTimer--;
    if (feedbackShapeTimer <= 0) showFeedbackShape = false;
    drawFeedbackShape();
  }

  if (submissions.length >= 0) {
    fill(255);
    drawOptions();
    drawMessage();
    displayShapes();
    if (carState === "waiting") {
      submitButton();
    }
    displaySubmissionIndicators();
    drawPastCustomers();
    drawTicketBooth(gateAngle);
    displayCurrentGuest(
      carAnimX,
      frozenShape,
      frozenCarColor,
      frozenAnimalName,
      frozenGuestLabel,
    );

    // Draw timer and clock (only for non-training guests)
    if (!isTrainingGuest()) {
      drawShiftTimer();
      drawShiftBadge();
      drawGameClock();
    } else {
      // Still draw shift badge during training
      drawShiftBadge();
      drawTrainingBadge();
    }
  }

  drawFog();
  if (timerExpired && carState === "waiting") drawTimerExpiredOverlay();
  drawGuidebookButton();
  if (showModal) drawModal();
  if (showGuidebook) drawGuidebook();
  if (gameWon) drawGameWon();
  displayCompletion();
}

// ── Training badge (replaces timer during training guests) ─────────
function drawTrainingBadge() {
  let sh = getCurrentShift();
  let isNight = sh.id === "night";
  let x = 18,
    y = height / 2 - 80,
    w = 74,
    h = 160;

  push();
  noStroke();
  fill(0, 0, 0, 50);
  rect(x + 3, y + 4, w, h, 10);

  fill(isNight ? color(18, 60, 30, 230) : color(30, 120, 60, 220));
  stroke(isNight ? color(80, 210, 120) : color(180, 255, 180));
  strokeWeight(1.5);
  rect(x, y, w, h, 10);

  // Header
  noStroke();
  fill(60, 200, 100, 220);
  rect(x + 1, y + 1, w - 2, 22, 9, 9, 0, 0);
  fill(10, 40, 18);
  textAlign(CENTER, CENTER);
  textFont("sans-serif");
  textSize(8);
  text("TRAINING", x + w / 2, y + 12);

  // Star / training icon
  fill(60, 200, 100);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(28);
  text("★", x + w / 2, y + 60);

  // "No timer" text
  fill(180, 255, 200);
  textFont("sans-serif");
  textSize(9);
  textAlign(CENTER, CENTER);
  text("No time\nlimit!", x + w / 2, y + 96);

  // Follow the glow text
  fill(60, 200, 100, 200);
  textSize(8);
  text("Follow the\nhighlights!", x + w / 2, y + 130);

  pop();
}

// ── Timer widget ───────────────────────────────────────────────────
function drawShiftTimer() {
  let sh = getCurrentShift();

  let x = 18,
    y = height / 2 - 80;
  let w = 74,
    h = 160;

  push();

  // Panel background
  noStroke();
  fill(0, 0, 0, 50);
  rect(x + 3, y + 4, w, h, 10);

  let panelCol =
    sh.id === "night" ? color(18, 28, 68, 230) : color(13, 67, 102, 220);
  fill(panelCol);
  stroke(sh.id === "night" ? color(80, 110, 210) : color(200, 165, 60));
  strokeWeight(1.5);
  rect(x, y, w, h, 10);

  // Header
  noStroke();
  fill(200, 165, 60, 220);
  rect(x + 1, y + 1, w - 2, 22, 9, 9, 0, 0);
  fill(18, 28, 68);
  textAlign(CENTER, CENTER);
  textFont("sans-serif");
  textSize(9);
  text("TIME", x + w / 2, y + 12);

  // Timer value
  let ratio = shiftTimerSeconds / shiftTimerMax;
  let urgent = ratio < 0.3;
  let timerCol = timerExpired
    ? color(220, 50, 50)
    : urgent
      ? color(255, 140, 0)
      : color(255, 255, 255);

  // Arc background track
  noFill();
  stroke(255, 255, 255, 30);
  strokeWeight(7);
  arc(x + w / 2, y + 74, 48, 48, -HALF_PI, -HALF_PI + TWO_PI);

  // Arc fill
  if (!timerExpired && ratio > 0) {
    stroke(timerCol);
    strokeWeight(7);
    noFill();
    arc(x + w / 2, y + 74, 48, 48, -HALF_PI, -HALF_PI + TWO_PI * ratio);
  }

  // Pulse ring when urgent
  if (urgent && !timerExpired) {
    let pulse = sin(frameCount * 0.2) * 0.5 + 0.5;
    noFill();
    stroke(255, 80, 50, 80 * pulse);
    strokeWeight(12);
    ellipse(x + w / 2, y + 74, 58, 58);
  }

  // Seconds text
  noStroke();
  fill(timerCol);
  textAlign(CENTER, CENTER);
  textFont("Georgia, serif");
  textSize(timerExpired ? 13 : 22);
  if (timerExpired) {
    text("TIME\nOUT", x + w / 2, y + 74);
  } else {
    text(ceil(shiftTimerSeconds), x + w / 2, y + 74);
  }

  // "seconds" label
  if (!timerExpired) {
    noStroke();
    fill(200, 165, 60, 180);
    textFont("sans-serif");
    textSize(11);
    textAlign(CENTER, CENTER);
    text("seconds", x + w / 2, y + 104);
  }

  // Shift indicator dots at bottom
  let dotY = y + h - 18;
  for (let i = 0; i < SHIFTS.length; i++) {
    let filled = i <= currentShift;
    let dotX = x + w / 2 + (i - 1) * 16;
    if (filled) {
      fill(200, 165, 60);
      noStroke();
    } else {
      noFill();
      stroke(200, 165, 60, 80);
      strokeWeight(1);
    }
    ellipse(dotX, dotY, 7, 7);
  }

  pop();
}

// ── Shift badge (top-left of screen) ──────────────────────────────
function drawShiftBadge() {
  let sh = getCurrentShift();
  let names = ["Morning", "Afternoon", "Night"];
  let icons = ["☀", "☀", "☾"];
  let label = icons[currentShift] + "  " + names[currentShift];
  let isNight = sh.id === "night";

  push();
  let bx = 18,
    by = 8,
    bw = 138,
    bh = 28;

  noStroke();
  fill(0, 0, 0, 40);
  rect(bx + 2, by + 2, bw, bh, 14);

  fill(isNight ? color(18, 28, 68, 220) : color(13, 67, 102, 200));
  stroke(200, 165, 60, 160);
  strokeWeight(1);
  rect(bx, by, bw, bh, 14);

  noStroke();
  fill(200, 165, 60);
  textAlign(CENTER, CENTER);
  textFont("sans-serif");
  textSize(12);
  text(label + " Shift", bx + bw / 2, by + bh / 2 + 1);
  pop();
}

// ── Timer-expired overlay ──────────────────────────────────────────
function drawTimerExpiredOverlay() {
  push();
  noStroke();
  fill(180, 20, 20, 12 + sin(frameCount * 0.15) * 8);
  rect(0, 0, width, height);
  pop();
}

function mousePressed() {
  if (gameState === "start") {
    handleStartClick();
    return;
  }
  if (gameState === "stage") {
    handleStageClick();
    return;
  }
  if (gameOver || gameWon) return;

  // ── Guidebook button (always checked first during play) ──
  let gbX = 15,
    gbY = height - 195,
    gbW = 80,
    gbH = 80;
  if (
    mouseX >= gbX &&
    mouseX <= gbX + gbW &&
    mouseY >= gbY &&
    mouseY <= gbY + gbH
  ) {
    if (!showGuidebook) {
      showGuidebook = true;
      guidebookPage = 1;
      // Start the timer if not already running (only for non-training guests)
      if (!isTrainingGuest()) {
        startTimerIfNeeded();
        // Deduct 5 seconds from the current car's timer
        if (timerStarted) {
          shiftTimerSeconds = max(0, shiftTimerSeconds - 5);
        }
      }
    }
    return;
  }

  // ── Guidebook close / page navigation ──
  if (showGuidebook) {
    let pW = 600,
      pH = 520;
    let pX = width / 2 - pW / 2,
      pY = height / 2 - pH / 2;
    let sh2 = getCurrentShift();
    let isAfternoonOrNight =
      sh2 && (sh2.id === "afternoon" || sh2.id === "night");
    let navY = pY + pH - 54;
    let navBtnW = 110,
      navBtnH = 36;

    // Prev button (page 2 → 1)
    if (isAfternoonOrNight && guidebookPage > 1) {
      let bx = pX + 20;
      if (
        mouseX >= bx &&
        mouseX <= bx + navBtnW &&
        mouseY >= navY &&
        mouseY <= navY + navBtnH
      ) {
        guidebookPage = 1;
        return;
      }
    }
    // Next button (page 1 → 2)
    if (isAfternoonOrNight && guidebookPage < 2) {
      let bx = pX + pW - navBtnW - 20;
      if (
        mouseX >= bx &&
        mouseX <= bx + navBtnW &&
        mouseY >= navY &&
        mouseY <= navY + navBtnH
      ) {
        guidebookPage = 2;
        return;
      }
    }

    // Close button
    let cbW = 170,
      cbH = 40;
    let cbX = width / 2 - cbW / 2,
      cbY = pY + pH - cbH - 8;
    if (
      mouseX >= cbX &&
      mouseX <= cbX + cbW &&
      mouseY >= cbY &&
      mouseY <= cbY + cbH
    ) {
      showGuidebook = false;
    }
    return; // block all game clicks while guidebook is open
  }

  if (carState !== "waiting") return;

  if (showModal) {
    modalMouseClicked();
    return;
  }

  modalMouseClicked();

  // Start timer on first interaction (only for non-training guests)
  if (
    !isTrainingGuest() &&
    !timerStarted &&
    submissions.length >= TRAINING_GUESTS
  ) {
    startTimerIfNeeded();
  }

  bottomMenuMouseClicked();

  // Also start timer when a menu button is clicked (non-training only)
  if (!isTrainingGuest()) {
    startTimerIfNeeded();
  }

  // Submit button
  let submitSize = 100,
    submitHeight = submitSize + 200;
  let submitX = width - submitSize - 10;
  let submitY = height / 2 - submitHeight / 2;
  if (
    mouseX >= submitX &&
    mouseX <= submitX + submitSize &&
    mouseY >= submitY &&
    mouseY <= submitY + submitHeight
  ) {
    if (clickHistory.length === 0) {
      triedToOpenGateWithoutSubmission = true;
      return;
    }
    triedToOpenGateWithoutSubmission = false;
    shiftTimerActive = false; // stop timer
    timerExpired = false;

    guestIndex++;
    let guestShapeIndex = submissions.length % shapeArray.length;
    let guestShape = shapeArray[guestShapeIndex];

    // Mark this shape as trained
    if (guestShape !== "none") {
      seenShapes.add(guestShape);
    }

    submissions.push([...clickHistory]);

    if (guestShape === "none") {
      isMatch = true;
    } else {
      let patternToMatch = getRitualForShape(guestShape);
      isMatch =
        patternToMatch !== null &&
        patternToMatch.length === clickHistory.length &&
        patternToMatch.every((val, idx) => val === clickHistory[idx]);
    }

    if (!isMatch) {
      wrongCount++;
      if (wrongCount >= 4) {
        gameOver = true;
      }
    } else if (wrongCount > 0) {
      wrongCount = max(0, wrongCount - 1);
    }

    if (!gameOver) {
      shiftGuestsCompleted++;
      _checkShiftAdvance();
    }

    clickHistory = [];
    disabled = [false, false, false, false, false];
    tickGameClock();
    gateOpen.play();
    // carState = "raising";
  }
}

function drawGameOver() {
  noStroke();
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);
  fill(120, 0, 0, 60);
  rect(0, 0, width, height);

  let cW = 520,
    cH = 300;
  let cX = width / 2 - cW / 2,
    cY = height / 2 - cH / 2;

  fill(0, 0, 0, 80);
  noStroke();
  rect(cX + 8, cY + 8, cW, cH, 14);
  fill(22, 22, 28);
  stroke(180, 20, 20);
  strokeWeight(3);
  rect(cX, cY, cW, cH, 12);
  fill(160, 20, 20);
  noStroke();
  rect(cX, cY, cW, 48, 12, 12, 0, 0);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("SHIFT OVER", width / 2, cY + 24);

  let ix = width / 2,
    iy = cY + 100;
  fill(100, 110, 130);
  noStroke();
  ellipse(ix - 20, iy, 52, 38);
  ellipse(ix + 18, iy - 4, 60, 44);
  ellipse(ix + 48, iy + 2, 40, 32);
  fill(80, 90, 108);
  rect(ix - 42, iy + 10, 100, 24, 0, 0, 6, 6);
  stroke(150, 180, 220, 200);
  strokeWeight(2);
  for (let [dx, dy] of [
    [-28, 18],
    [-12, 24],
    [4, 18],
    [20, 24],
    [36, 18],
  ])
    line(ix + dx, iy + dy, ix + dx - 2, iy + dy + 10);

  noStroke();
  fill(210, 210, 220);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(
    "Too many mistakes — the guests have lost patience.",
    width / 2,
    cY + 188,
  );
  fill(140, 140, 160);
  textSize(13);
  text("Refresh the page to try again.", width / 2, cY + 218);

  stroke(80, 20, 20);
  strokeWeight(1);
  line(cX + 30, cY + cH - 28, cX + cW - 30, cY + cH - 28);
  noStroke();
  fill(100, 20, 20);
  textSize(11);
  text("PAWS PARKING AUTHORITY", width / 2, cY + cH - 14);
}

function drawFeedbackShape() {
  let alpha =
    feedbackShapeTimer > 60 ? 255 : map(feedbackShapeTimer, 0, 60, 0, 255);
  let cx = width / 2,
    cy = height / 2 - 60,
    sz = 90;
  push();
  noStroke();
  if (feedbackShapeType === "square") {
    fill(40, 120, 220, alpha * 0.18);
    rect(cx - sz * 0.8, cy - sz * 0.8, sz * 1.6, sz * 1.6, 12);
  } else {
    fill(220, 60, 60, alpha * 0.18);
    let hh = sz * 0.866;
    triangle(
      cx,
      cy - hh * 0.8,
      cx - sz * 0.8,
      cy + hh * 0.8,
      cx + sz * 0.8,
      cy + hh * 0.8,
    );
  }
  if (feedbackShapeType === "square") {
    fill(40, 120, 220, alpha);
    stroke(255, 255, 255, alpha * 0.6);
    strokeWeight(2);
    rect(cx - sz / 2, cy - sz / 2, sz, sz, 6);
  } else {
    fill(220, 60, 60, alpha);
    stroke(255, 255, 255, alpha * 0.6);
    strokeWeight(2);
    let h = sz * 0.866;
    triangle(cx, cy - h / 2, cx - sz / 2, cy + h / 2, cx + sz / 2, cy + h / 2);
  }
  noStroke();
  fill(13, 67, 102, alpha);
  textAlign(CENTER, CENTER);
  textSize(14);
  text(
    feedbackShapeType === "square" ? "Ritual 1" : "Ritual 2",
    cx,
    cy + sz * 0.75,
  );
  pop();
}

// ── Guidebook button (bottom-left, outside booth panel) ────────────
function drawGuidebookButton() {
  let bX = 15,
    bY = height - 195,
    bW = 80,
    bH = 80;
  let hov =
    !showGuidebook &&
    mouseX >= bX &&
    mouseX <= bX + bW &&
    mouseY >= bY &&
    mouseY <= bY + bH;

  push();
  noStroke();
  fill(0, 0, 0, 40);
  rect(bX + 3, bY + 4, bW, bH, 10);

  fill(
    showGuidebook
      ? color(200, 165, 60)
      : hov
        ? color(247, 247, 205)
        : color(240, 248, 255),
  );
  stroke(13, 67, 102);
  strokeWeight(2);
  rect(bX, bY, bW, bH, 10);

  // Book cover
  noStroke();
  fill(13, 67, 102);
  rect(bX + 14, bY + 10, 52, 42, 4);
  // Pages (left)
  fill(255, 252, 240);
  rect(bX + 18, bY + 14, 22, 34, 2);
  // Pages (right)
  rect(bX + 42, bY + 14, 20, 34, 2);
  // Spine
  fill(8, 44, 70);
  noStroke();
  rect(bX + 38, bY + 12, 6, 38, 1);
  // Ruled lines on pages
  stroke(13, 67, 102, 80);
  strokeWeight(1);
  for (let i = 0; i < 3; i++) {
    line(bX + 20, bY + 22 + i * 8, bX + 38, bY + 22 + i * 8);
    line(bX + 44, bY + 22 + i * 8, bX + 60, bY + 22 + i * 8);
  }

  // Label
  noStroke();
  fill(13, 67, 102);
  textAlign(CENTER, CENTER);
  textFont("sans-serif");
  textSize(9);
  text("GUIDEBOOK", bX + bW / 2, bY + bH - 10);
  pop();
}

// ── Guidebook overlay panel (2 pages) ─────────────────────────────
function drawGuidebook() {
  let sh = getCurrentShift();
  let isNight = sh && sh.id === "night";
  let isAfternoonOrNight = sh && (sh.id === "afternoon" || sh.id === "night");
  let optLabels = [
    "Check Ticket",
    "Check License",
    "Click Pen",
    "Stamp Guest Log",
    "Talk Into Speaker",
  ];

  push();
  noStroke();
  fill(0, 0, 0, 165);
  rect(0, 0, width, height);

  let pW = 600,
    pH = 520;
  let pX = width / 2 - pW / 2,
    pY = height / 2 - pH / 2;

  // Drop shadow
  fill(0, 0, 0, 60);
  noStroke();
  rect(pX + 7, pY + 7, pW, pH, 12);

  // Panel body
  fill(isNight ? color(18, 22, 46) : color(248, 250, 253));
  stroke(isNight ? color(80, 100, 180) : color(13, 67, 102));
  strokeWeight(2);
  rect(pX, pY, pW, pH, 10);

  // Header bar
  fill(isNight ? color(30, 38, 90) : color(13, 67, 102));
  noStroke();
  rect(pX, pY, pW, 50, 10, 10, 0, 0);

  fill(255);
  textAlign(CENTER, CENTER);
  textFont("Georgia, serif");
  textSize(20);
  text("Guidebook", width / 2, pY + 26);

  // Page indicator in header
  if (isAfternoonOrNight) {
    fill(200, 165, 60, 200);
    textFont("sans-serif");
    textSize(11);
    textAlign(RIGHT, CENTER);
    text("Page " + guidebookPage + " / 2", pX + pW - 16, pY + 26);
  }

  // Penalty note
  noStroke();
  fill(isNight ? color(160, 170, 220) : color(120, 140, 180));
  textFont("sans-serif");
  textSize(11);
  textAlign(CENTER, CENTER);
  text("Each use costs 5 seconds from your current timer", width / 2, pY + 62);

  // Divider under subheader
  stroke(isNight ? color(60, 70, 140) : color(200, 210, 230));
  strokeWeight(1);
  line(pX + 24, pY + 74, pX + pW - 24, pY + 74);

  // ── Draw one ritual column ──────────────────────────────────────
  function drawRitualColumn(ritual, colX, badgeShape, accentArr) {
    let ac = color(accentArr[0], accentArr[1], accentArr[2]);
    let colY = pY + 86;

    // Badge icon
    let badgeSz = 28;
    if (badgeShape === "square") {
      fill(ac);
      stroke(isNight ? color(200, 220, 255) : color(13, 67, 102));
      strokeWeight(1.5);
      rect(colX, colY, badgeSz, badgeSz, 4);
    } else if (badgeShape === "triangle") {
      let th = badgeSz * 0.866;
      fill(ac);
      stroke(isNight ? color(255, 180, 180) : color(13, 67, 102));
      strokeWeight(1.5);
      triangle(
        colX + badgeSz / 2,
        colY,
        colX,
        colY + th,
        colX + badgeSz,
        colY + th,
      );
    } else if (badgeShape === "circle") {
      fill(ac);
      stroke(isNight ? color(255, 200, 140) : color(13, 67, 102));
      strokeWeight(1.5);
      ellipse(colX + badgeSz / 2, colY + badgeSz / 2, badgeSz, badgeSz);
    } else if (badgeShape === "diamond") {
      fill(ac);
      stroke(isNight ? color(220, 180, 255) : color(13, 67, 102));
      strokeWeight(1.5);
      let hd = badgeSz / 2;
      quad(
        colX + hd,
        colY,
        colX + badgeSz,
        colY + hd,
        colX + hd,
        colY + badgeSz,
        colX,
        colY + hd,
      );
    }

    // Column title
    noStroke();
    fill(isNight ? color(220, 230, 255) : color(13, 67, 102));
    textAlign(LEFT, CENTER);
    textFont("sans-serif");
    textStyle(BOLD);
    textSize(14);
    let titleMap = {
      square: "Square Ritual",
      triangle: "Triangle Ritual",
      circle: "Circle Ritual",
      diamond: "Diamond Ritual",
    };
    text(titleMap[badgeShape], colX + 36, colY + 14);
    textStyle(NORMAL);

    // Steps
    for (let i = 0; i < ritual.length; i++) {
      let sy = colY + 50 + i * 54;

      // Connector line
      if (i > 0) {
        stroke(accentArr[0], accentArr[1], accentArr[2], 100);
        strokeWeight(1.5);
        line(colX + 14, sy - 18, colX + 14, sy);
      }

      // Step circle
      noStroke();
      fill(ac);
      ellipse(colX + 14, sy + 13, 26, 26);
      fill(255);
      textAlign(CENTER, CENTER);
      textFont("Georgia, serif");
      textSize(13);
      text(i + 1, colX + 14, sy + 14);

      // Step label
      noStroke();
      fill(isNight ? color(230, 235, 255) : color(30, 50, 90));
      textAlign(LEFT, CENTER);
      textFont("sans-serif");
      textSize(13);
      text(optLabels[ritual[i] - 1], colX + 32, sy + 13);
    }
  }

  // ── Page 1: Square + Triangle ───────────────────────────────────
  if (guidebookPage === 1) {
    drawRitualColumn(RITUAL_SQUARE, pX + 44, "square", SHAPE_COLORS.square);
    stroke(isNight ? color(60, 70, 140) : color(200, 210, 230));
    strokeWeight(1);
    line(pX + pW / 2, pY + 78, pX + pW / 2, pY + pH - 56);
    drawRitualColumn(
      RITUAL_TRIANGLE,
      pX + pW / 2 + 26,
      "triangle",
      SHAPE_COLORS.triangle,
    );
  }

  // ── Page 2: Circle + Diamond (afternoon/night only) ─────────────
  if (guidebookPage === 2 && isAfternoonOrNight) {
    drawRitualColumn(RITUAL_CIRCLE, pX + 44, "circle", SHAPE_COLORS.circle);
    stroke(isNight ? color(60, 70, 140) : color(200, 210, 230));
    strokeWeight(1);
    line(pX + pW / 2, pY + 78, pX + pW / 2, pY + pH - 56);
    drawRitualColumn(
      RITUAL_DIAMOND,
      pX + pW / 2 + 26,
      "diamond",
      SHAPE_COLORS.diamond,
    );
  }

  // ── Page navigation ─────────────────────────────────────────────
  let navY = pY + pH - 54;
  let navBtnW = 110,
    navBtnH = 36;

  if (isAfternoonOrNight) {
    // Prev button
    if (guidebookPage > 1) {
      let bx = pX + 20;
      let hov =
        mouseX >= bx &&
        mouseX <= bx + navBtnW &&
        mouseY >= navY &&
        mouseY <= navY + navBtnH;
      fill(hov ? color(247, 247, 205) : color(220, 230, 245));
      stroke(isNight ? color(80, 100, 180) : color(13, 67, 102));
      strokeWeight(1.5);
      rect(bx, navY, navBtnW, navBtnH, 8);
      noStroke();
      fill(isNight ? color(180, 200, 255) : color(13, 67, 102));
      textAlign(CENTER, CENTER);
      textFont("sans-serif");
      textSize(13);
      text("← Page 1", bx + navBtnW / 2, navY + navBtnH / 2);
    }

    // Next button
    if (guidebookPage < 2) {
      let bx = pX + pW - navBtnW - 20;
      let hov =
        mouseX >= bx &&
        mouseX <= bx + navBtnW &&
        mouseY >= navY &&
        mouseY <= navY + navBtnH;
      fill(hov ? color(247, 247, 205) : color(220, 230, 245));
      stroke(isNight ? color(80, 100, 180) : color(13, 67, 102));
      strokeWeight(1.5);
      rect(bx, navY, navBtnW, navBtnH, 8);
      noStroke();
      fill(isNight ? color(180, 200, 255) : color(13, 67, 102));
      textAlign(CENTER, CENTER);
      textFont("sans-serif");
      textSize(13);
      text("Page 2 →", bx + navBtnW / 2, navY + navBtnH / 2);
    }
  }

  // ── Close button ────────────────────────────────────────────────
  let cbW = 170,
    cbH = 40;
  let cbX = width / 2 - cbW / 2,
    cbY = pY + pH - cbH - 8;
  let chov =
    mouseX >= cbX &&
    mouseX <= cbX + cbW &&
    mouseY >= cbY &&
    mouseY <= cbY + cbH;
  fill(chov ? color(247, 247, 205) : color(220, 230, 245));
  stroke(isNight ? color(80, 100, 180) : color(13, 67, 102));
  strokeWeight(1.5);
  rect(cbX, cbY, cbW, cbH, 8);
  noStroke();
  fill(isNight ? color(180, 200, 255) : color(13, 67, 102));
  textAlign(CENTER, CENTER);
  textFont("sans-serif");
  textSize(14);
  text("✕  Close Guidebook", cbX + cbW / 2, cbY + cbH / 2);

  pop();
}

// ── Game Won screen ────────────────────────────────────────────────
function drawGameWon() {
  noStroke();
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  let cW = 520,
    cH = 300;
  let cX = width / 2 - cW / 2,
    cY = height / 2 - cH / 2;
  fill(0, 0, 0, 70);
  noStroke();
  rect(cX + 8, cY + 8, cW, cH, 14);
  fill(18, 44, 28);
  stroke(40, 180, 80);
  strokeWeight(3);
  rect(cX, cY, cW, cH, 12);
  fill(40, 150, 70);
  noStroke();
  rect(cX, cY, cW, 48, 12, 12, 0, 0);
  fill(255);
  textAlign(CENTER, CENTER);
  textFont("Georgia, serif");
  textSize(30);
  text("SHIFT COMPLETE!", width / 2, cY + 24);
  fill(200, 165, 60);
  noStroke();
  textFont("sans-serif");
  textSize(52);
  text("★", width / 2, cY + 108);
  noStroke();
  fill(200, 220, 210);
  textFont("sans-serif");
  textSize(16);
  text("You survived all 100 cars of the night shift.", width / 2, cY + 175);
  fill(140, 170, 150);
  textSize(13);
  text("Refresh the page to play again.", width / 2, cY + 205);
  stroke(30, 100, 50);
  strokeWeight(1);
  line(cX + 30, cY + cH - 28, cX + cW - 30, cY + cH - 28);
  noStroke();
  fill(60, 140, 80);
  textSize(11);
  text("PAWS PARKING AUTHORITY", width / 2, cY + cH - 14);
}
