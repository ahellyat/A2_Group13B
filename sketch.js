let clickHistory = [];
let disabled = [false, false, false, false, false];
let submissions = [];
let triedToOpenGateWithoutSubmission = false;
let triedToSubmitDuplicatePattern = false;
let wrongCount = 0;
let isMatch;
let gameOver = false;
let shapeArray = ["square", "square", "triangle", "triangle", "none", "none"];
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

// ── Manual book state ──────────────────────────────────────────────
let showManual = false;
let manualPage = 0; // 0 = guest log pages

// ── In-game clock ──────────────────────────────────────────────────
const SHIFT_START_MINUTES = [360, 720, 1080];
const SHIFT_MINUTES_PER_GUEST = [60, 30, 15];
let gameClockMinutes = 360;

function initGameClock() {
  gameClockMinutes = SHIFT_START_MINUTES[currentShift];
}

function tickGameClock() {
  gameClockMinutes += SHIFT_MINUTES_PER_GUEST[currentShift];
  if (gameClockMinutes > 1439) gameClockMinutes = 1439;
}

function drawGameClock() {
  let sh = getCurrentShift();
  let isNight = sh.id === "night";

  let cx = width - 52,
    cy = 100,
    r = 34;

  push();
  noStroke();
  fill(0, 0, 0, 40);
  ellipse(cx + 3, cy + 4, (r + 14) * 2, (r + 14) * 2);

  fill(isNight ? color(18, 28, 68, 230) : color(13, 67, 102, 215));
  stroke(200, 165, 60, 180);
  strokeWeight(1.5);
  ellipse(cx, cy, (r + 14) * 2, (r + 14) * 2);

  fill(isNight ? color(8, 12, 38) : color(240, 248, 255));
  stroke(200, 165, 60, 120);
  strokeWeight(1);
  ellipse(cx, cy, r * 2, r * 2);

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

  let totalMinutes = gameClockMinutes;
  let h = totalMinutes / 60;
  let m = totalMinutes % 60;

  let hAngle = map(h % 12, 0, 12, -HALF_PI, -HALF_PI + TWO_PI);
  stroke(isNight ? color(200, 210, 255) : color(13, 67, 102));
  strokeWeight(3);
  line(cx, cy, cx + cos(hAngle) * (r * 0.55), cy + sin(hAngle) * (r * 0.55));

  let mAngle = map(m, 0, 60, -HALF_PI, -HALF_PI + TWO_PI);
  stroke(isNight ? color(180, 195, 255) : color(40, 90, 160));
  strokeWeight(2);
  line(cx, cy, cx + cos(mAngle) * (r * 0.8), cy + sin(mAngle) * (r * 0.8));

  fill(200, 165, 60);
  noStroke();
  ellipse(cx, cy, 6, 6);

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
let shiftTimerSeconds = 60;
let shiftTimerMax = 60;
let shiftTimerActive = false;
let timerStarted = false;
let timerExpired = false;
let lastFrameTime = 0;
let shiftGuestsCompleted = 0;

const TRAINING_GUESTS = 2;

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

  for (let i = shapeArray.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [shapeArray[i], shapeArray[j]] = [shapeArray[j], shapeArray[i]];
  }

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
  if (submissions.length === 0) {
    frozenShape = "square";
    frozenCarColor = color(40, 120, 220);
    frozenGuestLabel = "Guest #1: Doug";
    frozenAnimalName = animalList[0];
  } else if (submissions.length === 1) {
    frozenShape = "triangle";
    frozenCarColor = color(220, 60, 60);
    frozenGuestLabel = "Guest #2: Kitty";
    frozenAnimalName = animalList[1];
  } else {
    let shapeIndex = submissions.length - 2;
    frozenShape = shapeArray[shapeIndex % shapeArray.length];
    if (frozenShape === "square") frozenCarColor = color(40, 120, 220);
    else if (frozenShape === "triangle") frozenCarColor = color(220, 60, 60);
    else frozenCarColor = color(100, 110, 130);
    frozenGuestLabel = "Guest #" + (submissions.length + 1);
    frozenAnimalName = animalList[submissions.length % animalList.length];
  }
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
  if (submissions.length < TRAINING_GUESTS) return;
  if (!shiftTimerActive || timerExpired) return;

  let now = millis();
  let delta = (now - lastFrameTime) / 1000;
  lastFrameTime = now;

  shiftTimerSeconds = max(0, shiftTimerSeconds - delta);

  if (shiftTimerSeconds <= 0 && !timerExpired) {
    timerExpired = true;
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

  _checkShiftAdvance();

  clickHistory = [];
  disabled = [false, false, false, false, false];
  carState = "raising";
}

function _checkShiftAdvance() {
  let sh = getCurrentShift();
  if (sh.id === "night") return;
  if (shiftGuestsCompleted >= sh.guestCount) {
    shiftGuestsCompleted = 0;
    if (currentShift < SHIFTS.length - 1) {
      currentShift++;
      pendingShiftTransition = true;
    }
  }
}

let pendingShiftTransition = false;

// ── Auto-start timer when car arrives ─────────────────────────────
function autoStartTimer() {
  if (submissions.length < TRAINING_GUESTS) return;
  if (timerStarted) return;
  timerStarted = true;
  shiftTimerActive = true;
  lastFrameTime = millis();
}

// Kept for compatibility but no longer used to gate the timer
function startTimerIfNeeded() {
  autoStartTimer();
}

function updateCarAnim() {
  if (carState === "entering") {
    carAnimX = lerp(carAnimX, carStopX, 0.055);
    if (abs(carAnimX - carStopX) < 0.8) {
      carAnimX = carStopX;
      carState = "waiting";
      // Reset timer, then immediately auto-start for non-training guests
      resetShiftTimer();
      lastFrameTime = millis();
      autoStartTimer();
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

      if (pendingShiftTransition) {
        pendingShiftTransition = false;
        gameState = "stage";
        stageAutoStartMs = millis();
        stageAnimFrame = 0;
        stageFadeAlpha = 255;
        initGameClock();
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

function drawNightOverlay() {
  let sh = getCurrentShift();
  if (sh.id !== "night") return;
  noStroke();
  fill(8, 12, 35, 160);
  rect(0, 0, width, height);
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
  for (let i = 0; i < 16; i++) {
    fill(255, 240, 180, map(i, 0, 16, 22, 0));
    let w = i * 14;
    triangle(x, ry - 108, x - w, ry, x + w, ry);
  }
}

function _drawMorningSky() {
  noStroke();
  for (let i = 0; i < 30; i++) {
    fill(255, 140, 50, map(i, 0, 30, 60, 0));
    ellipse(width / 2, roadY, width * 1.1 + i * 20, 120 + i * 8);
  }
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
  let sh = getCurrentShift();

  let clearSky;
  if (sh.id === "morning") clearSky = color(255, 210, 140);
  else if (sh.id === "afternoon") clearSky = color(130, 195, 245);
  else clearSky = color(18, 22, 48);

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

    if (submissions.length >= TRAINING_GUESTS) {
      drawShiftTimer();
      drawShiftBadge();
      drawGameClock();
    }

    // Draw the manual book button (always visible during play)
    drawManualButton();
  }

  drawFog();
  if (timerExpired && carState === "waiting") drawTimerExpiredOverlay();

  // Draw manual on top of everything except modal
  if (showManual) drawManual();
  if (showModal) drawModal();

  displayCompletion();
}

// ── Timer widget ───────────────────────────────────────────────────
function drawShiftTimer() {
  let sh = getCurrentShift();
  let isTraining = submissions.length < TRAINING_GUESTS;
  if (isTraining) return;

  let x = 18,
    y = height / 2 - 80;
  let w = 74,
    h = 160;

  push();

  noStroke();
  fill(0, 0, 0, 50);
  rect(x + 3, y + 4, w, h, 10);

  let panelCol =
    sh.id === "night" ? color(18, 28, 68, 230) : color(13, 67, 102, 220);
  fill(panelCol);
  stroke(sh.id === "night" ? color(80, 110, 210) : color(200, 165, 60));
  strokeWeight(1.5);
  rect(x, y, w, h, 10);

  noStroke();
  fill(200, 165, 60, 220);
  rect(x + 1, y + 1, w - 2, 22, 9, 9, 0, 0);
  fill(18, 28, 68);
  textAlign(CENTER, CENTER);
  textFont("sans-serif");
  textSize(9);
  text("TIME", x + w / 2, y + 12);

  let ratio = shiftTimerSeconds / shiftTimerMax;
  let urgent = ratio < 0.3;
  let timerCol = timerExpired
    ? color(220, 50, 50)
    : urgent
      ? color(255, 140, 0)
      : color(255, 255, 255);

  noFill();
  stroke(255, 255, 255, 30);
  strokeWeight(7);
  arc(x + w / 2, y + 74, 48, 48, -HALF_PI, -HALF_PI + TWO_PI);

  if (!timerExpired && ratio > 0) {
    stroke(timerCol);
    strokeWeight(7);
    noFill();
    arc(x + w / 2, y + 74, 48, 48, -HALF_PI, -HALF_PI + TWO_PI * ratio);
  }

  if (urgent && !timerExpired) {
    let pulse = sin(frameCount * 0.2) * 0.5 + 0.5;
    noFill();
    stroke(255, 80, 50, 80 * pulse);
    strokeWeight(12);
    ellipse(x + w / 2, y + 74, 58, 58);
  }

  noStroke();
  fill(timerCol);
  textAlign(CENTER, CENTER);
  textFont("Georgia, serif");
  textSize(timerExpired ? 13 : 22);
  if (timerExpired) {
    text("TIME\nOUT", x + w / 2, y + 74);
  } else {
    // Auto-started — always show the countdown number
    text(ceil(shiftTimerSeconds), x + w / 2, y + 74);
  }

  if (!timerExpired) {
    noStroke();
    fill(200, 165, 60, 180);
    textFont("sans-serif");
    textSize(8);
    textAlign(CENTER, CENTER);
    text("seconds", x + w / 2, y + 104);
  }

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

// ── Shift badge ────────────────────────────────────────────────────
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

// ── Manual book button ─────────────────────────────────────────────
let manualBtnX, manualBtnY, manualBtnW, manualBtnH;

function drawManualButton() {
  let bw = 52,
    bh = 52;
  let bx = width / 2 - 570 - bw / 2; // left of the bottom panel
  let by = height - 550 - bh - 10;

  manualBtnX = bx;
  manualBtnY = by;
  manualBtnW = bw;
  manualBtnH = bh;

  let hov =
    mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh;

  push();
  noStroke();
  fill(0, 0, 0, 40);
  rect(bx + 3, by + 4, bw, bh, 10);

  fill(hov ? color(247, 247, 205) : color(240, 248, 255));
  stroke(13, 67, 102);
  strokeWeight(1.8);
  rect(bx, by, bw, bh, 10);

  // Book icon
  let cx = bx + bw / 2,
    cy = by + bh / 2;
  // Book body
  fill(160, 100, 50);
  stroke(80, 40, 10);
  strokeWeight(1.2);
  rect(cx - 14, cy - 16, 28, 32, 2);
  // Spine
  fill(120, 70, 30);
  noStroke();
  rect(cx - 14, cy - 16, 5, 32, 2, 0, 0, 2);
  // Pages
  fill(250, 248, 240);
  noStroke();
  rect(cx - 8, cy - 14, 20, 28);
  // Lines on pages
  stroke(180, 170, 150);
  strokeWeight(0.8);
  for (let ly = cy - 9; ly <= cy + 10; ly += 5) {
    line(cx - 5, ly, cx + 10, ly);
  }
  // Small "?" or bookmark
  fill(200, 165, 60);
  noStroke();
  rect(cx + 6, cy - 18, 5, 10, 0, 0, 3, 3);

  pop();
}

// ── Manual book overlay ────────────────────────────────────────────
// Stores per-guest records: { guestNum, shape, sequence: [optionIndex,...], animal }
let guestLog = []; // populated on each submission

function recordGuestLog(guestNum, shape, sequence, animal) {
  guestLog.push({ guestNum, shape, sequence: [...sequence], animal });
}

function drawManual() {
  let mw = 740,
    mh = 500;
  let mx = width / 2 - mw / 2,
    my = height / 2 - mh / 2;

  push();

  // Dim backdrop
  noStroke();
  fill(0, 0, 0, 170);
  rect(0, 0, width, height);

  // ── Book shape ──────────────────────────────────────────────
  // Drop shadow
  fill(30, 18, 8, 80);
  noStroke();
  rect(mx + 8, my + 10, mw, mh, 10);

  // Back cover / spine
  fill(90, 52, 20);
  stroke(50, 28, 8);
  strokeWeight(2);
  rect(mx, my, mw, mh, 8);

  // Spine strip
  fill(70, 38, 12);
  noStroke();
  rect(mx, my, 28, mh, 8, 0, 0, 8);

  // Gold spine lines
  stroke(200, 165, 60, 160);
  strokeWeight(1.5);
  line(mx + 28, my + 12, mx + 28, my + mh - 12);
  line(mx + 24, my + 12, mx + 24, my + mh - 12);

  // Page area
  fill(252, 248, 238);
  noStroke();
  rect(mx + 28, my + 4, mw - 32, mh - 8, 4);

  // Subtle page texture lines
  stroke(220, 210, 190, 60);
  strokeWeight(0.5);
  for (let ly = my + 30; ly < my + mh - 10; ly += 22) {
    line(mx + 32, ly, mx + mw - 6, ly);
  }

  // ── Header ──────────────────────────────────────────────────
  fill(13, 67, 102);
  noStroke();
  rect(mx + 28, my + 4, mw - 32, 46, 4, 4, 0, 0);

  fill(200, 165, 60);
  textAlign(LEFT, CENTER);
  textFont("Georgia, serif");
  textSize(11);
  text("PAWS PARKING AUTHORITY", mx + 48, my + 16);

  fill(255);
  textAlign(CENTER, CENTER);
  textFont("Georgia, serif");
  textSize(19);
  text("★  Guest Service Log  ★", mx + 28 + (mw - 36) / 2, my + 36);

  // ── Content area ────────────────────────────────────────────
  let contentX = mx + 38;
  let contentY = my + 62;
  let contentW = mw - 52;
  let contentH = mh - 110;

  // Column headers
  fill(13, 67, 102, 180);
  noStroke();
  rect(contentX, contentY, contentW, 22, 3);

  fill(255);
  textFont("sans-serif");
  textSize(10);
  textAlign(LEFT, CENTER);
  text("GUEST", contentX + 8, contentY + 11);
  text("BADGE", contentX + 80, contentY + 11);
  text("RITUAL SEQUENCE  (order performed)", contentX + 150, contentY + 11);

  // Entries
  if (guestLog.length === 0) {
    fill(120, 100, 70);
    textAlign(CENTER, CENTER);
    textFont("Georgia, serif");
    textSize(14);
    text(
      "No guests served yet.",
      mx + 28 + (mw - 36) / 2,
      contentY + contentH / 2,
    );
  } else {
    let rowH = 56;
    let maxVisible = floor((contentH - 26) / rowH);
    // Show in chronological order (oldest first); if list is longer than fits,
    // show the most recent maxVisible entries so the latest is always visible.
    let entries =
      guestLog.length > maxVisible
        ? guestLog.slice(guestLog.length - maxVisible)
        : guestLog;

    for (let i = 0; i < entries.length; i++) {
      let e = entries[i];
      let ry = contentY + 26 + i * rowH;

      // Alternating row tint
      if (i % 2 === 0) {
        fill(230, 220, 200, 50);
        noStroke();
        rect(contentX, ry, contentW, rowH - 2, 2);
      }

      // Guest number
      fill(40, 30, 10);
      textFont("Georgia, serif");
      textSize(13);
      textAlign(LEFT, CENTER);
      text("#" + e.guestNum, contentX + 8, ry + rowH / 2);

      // Badge shape
      _drawManualBadge(e.shape, contentX + 80, ry + rowH / 2);

      // Sequence icons
      _drawManualSequence(e.sequence, contentX + 150, ry + rowH / 2);

      // Divider
      stroke(200, 185, 160, 80);
      strokeWeight(0.8);
      line(contentX, ry + rowH - 1, contentX + contentW, ry + rowH - 1);
    }

    if (guestLog.length > maxVisible) {
      fill(120, 100, 70);
      noStroke();
      textFont("sans-serif");
      textSize(10);
      textAlign(RIGHT, CENTER);
      text(
        "Showing latest " + maxVisible + " of " + guestLog.length + " guests",
        contentX + contentW,
        contentY + 14,
      );
    }
  }

  // ── Legend at bottom ────────────────────────────────────────
  let legY = my + mh - 46;
  fill(240, 232, 215);
  noStroke();
  rect(mx + 30, legY, mw - 36, 38, 0, 0, 4, 4);

  stroke(200, 185, 160, 100);
  strokeWeight(0.8);
  line(mx + 30, legY, mx + mw - 6, legY);

  fill(80, 60, 30);
  textFont("sans-serif");
  textSize(9);
  textAlign(LEFT, CENTER);
  text("ICON KEY:", mx + 40, legY + 10);

  let legendIcons = [
    { icon: "ticket", label: "Check Ticket" },
    { icon: "plate", label: "Check License" },
    { icon: "pen", label: "Click Pen" },
    { icon: "stamp", label: "Stamp Log" },
    { icon: "speaker", label: "Talk Speaker" },
  ];
  let legX = mx + 100;
  for (let li of legendIcons) {
    _drawTinyIcon(li.icon, legX + 14, legY + 10, 1.0);
    fill(60, 45, 20);
    noStroke();
    textFont("sans-serif");
    textSize(8);
    textAlign(CENTER, CENTER);
    text(li.label, legX + 14, legY + 28);
    legX += 110;
  }

  // ── Close hint ──────────────────────────────────────────────
  fill(120, 95, 55, 180);
  noStroke();
  textFont("sans-serif");
  textSize(10);
  textAlign(CENTER, CENTER);
  text("Click outside to close", mx + 28 + (mw - 36) / 2, my + mh - 12);

  pop();
}

// Draw a small badge shape for the manual
function _drawManualBadge(shape, cx, cy) {
  push();
  let sz = 18;
  if (shape === "square") {
    fill(40, 120, 220);
    stroke(255);
    strokeWeight(1.2);
    rect(cx - sz / 2, cy - sz / 2, sz, sz, 2);
    fill(255);
    noStroke();
    rect(cx - sz / 2 + 2, cy - sz / 2 + 2, sz - 4, sz - 4, 1);
    fill(40, 120, 220);
    noStroke();
    rect(cx - sz / 2 + 4, cy - sz / 2 + 4, sz - 8, sz - 8, 1);
  } else if (shape === "triangle") {
    fill(220, 60, 60);
    stroke(255);
    strokeWeight(1.2);
    let h = sz * 0.866;
    triangle(cx, cy - h / 2, cx - sz / 2, cy + h / 2, cx + sz / 2, cy + h / 2);
  } else {
    // none badge — dash
    stroke(160, 160, 160);
    strokeWeight(2.5);
    noFill();
    line(cx - 10, cy, cx + 10, cy);
    fill(130, 130, 130);
    noStroke();
    textFont("sans-serif");
    textSize(8);
    textAlign(CENTER, CENTER);
    text("free", cx, cy + 10);
  }
  pop();
}

// Draw the sequence of mini icons for one guest entry
function _drawManualSequence(seq, startX, cy) {
  push();
  let iconNames = ["ticket", "plate", "pen", "stamp", "speaker"];
  let spacing = 58;
  for (let i = 0; i < seq.length; i++) {
    let ix = startX + i * spacing;
    // Order bubble sits above the icon
    fill(13, 67, 102);
    noStroke();
    ellipse(ix + 16, cy - 14, 14, 14);
    fill(255);
    textFont("sans-serif");
    textSize(8);
    textAlign(CENTER, CENTER);
    text(i + 1, ix + 16, cy - 14);

    // Arrow between icons (drawn at mid-height between bubble and icon)
    if (i < seq.length - 1) {
      stroke(160, 145, 120);
      strokeWeight(1);
      line(ix + 34, cy - 2, ix + spacing - 4, cy - 2);
      fill(160, 145, 120);
      noStroke();
      triangle(
        ix + spacing,
        cy - 2,
        ix + spacing - 6,
        cy - 5,
        ix + spacing - 6,
        cy + 1,
      );
    }

    // Tiny icon centred at cy + 4 within the row
    let optionIdx = seq[i] - 1; // clickHistory stores 1-based values
    if (optionIdx >= 0 && optionIdx < iconNames.length) {
      _drawTinyIcon(iconNames[optionIdx], ix + 16, cy + 4, 1.0);
    }
  }

  if (seq.length === 0) {
    fill(160, 130, 90);
    noStroke();
    textFont("sans-serif");
    textSize(10);
    textAlign(LEFT, CENTER);
    text("(timed out — no actions)", startX, cy);
  }
  pop();
}

// Scaled-down icon renderer for the manual.
// drawMenuIcon draws icons spanning roughly ±22px from its cx/cy.
// We use drawingContext save/restore to isolate the raw canvas transform
// and avoid the p5 scale() / variable name collision.
function _drawTinyIcon(type, cx, cy, scaleFactor) {
  let s = scaleFactor * 0.58;
  drawingContext.save();
  drawingContext.translate(cx, cy);
  drawingContext.scale(s, s);
  drawMenuIcon(type, 0, 0, false, 255);
  drawingContext.restore();
}

// ── Manual click handling ──────────────────────────────────────────
function handleManualClick() {
  let mw = 740,
    mh = 500;
  let mx = width / 2 - mw / 2,
    my = height / 2 - mh / 2;

  // Close if the click landed outside the book card
  let insideBook =
    mouseX >= mx && mouseX <= mx + mw && mouseY >= my && mouseY <= my + mh;
  if (!insideBook) {
    showManual = false;
  }
  return true; // always consume the click
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
  if (gameOver) return;
  if (carState !== "waiting") return;

  // Manual takes priority
  if (showManual) {
    handleManualClick();
    return;
  }

  // Manual button
  if (
    mouseX >= manualBtnX &&
    mouseX <= manualBtnX + manualBtnW &&
    mouseY >= manualBtnY &&
    mouseY <= manualBtnY + manualBtnH
  ) {
    showManual = true;
    return;
  }

  if (showModal) {
    modalMouseClicked();
    return;
  }

  modalMouseClicked();
  triedToSubmitDuplicatePattern = false;
  bottomMenuMouseClicked();

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
    triedToSubmitDuplicatePattern = false;

    // Block duplicate-ritual submissions:
    // • Free-choice guests can't use either established ritual
    // • Training guest 2 can't reuse ritual 1's sequence
    if (submissions.length >= 1) {
      let seqMatchesRitual = (ritual) =>
        ritual &&
        ritual.length === clickHistory.length &&
        ritual.every((v, i) => v === clickHistory[i]);
      let isDupe =
        (submissions.length >= 2 &&
          frozenShape === "none" &&
          (seqMatchesRitual(submissions[0]) ||
            seqMatchesRitual(submissions[1]))) ||
        (submissions.length === 1 && seqMatchesRitual(submissions[0]));
      if (isDupe) {
        triedToSubmitDuplicatePattern = true;
        return;
      }
    }

    shiftTimerActive = false;
    timerExpired = false;

    let currentGuestNum = submissions.length + 1;
    let currentShape = frozenShape;
    let currentAnimal = frozenAnimalName;

    guestIndex++;
    submissions.push([...clickHistory]);

    // Record to guest log
    recordGuestLog(currentGuestNum, currentShape, clickHistory, currentAnimal);

    if (submissions.length === 1) {
      showFeedbackShape = true;
      feedbackShapeType = "square";
      feedbackShapeTimer = 180;
    } else if (submissions.length === 2) {
      showFeedbackShape = true;
      feedbackShapeType = "triangle";
      feedbackShapeTimer = 180;
    } else if (submissions.length >= 3) {
      let highlightedIndex = submissions.length - 3;
      let guestShape = shapeArray[highlightedIndex % shapeArray.length];

      if (guestShape === "none") {
        isMatch = true;
      } else {
        let patternToMatch =
          guestShape === "triangle" ? submissions[1] : submissions[0];
        isMatch =
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
    }

    clickHistory = [];
    disabled = [false, false, false, false, false];
    triedToSubmitDuplicatePattern = false;
    tickGameClock();
    carState = "raising";
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
