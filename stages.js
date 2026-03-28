// stages.js — shift transition screens and phase management

// ── Shift definitions ──────────────────────────────────────────────
// Each shift has: name, sky colours, timer duration (seconds), guest count
const SHIFTS = [
  {
    id: "morning",
    label: "MORNING SHIFT",
    sublabel: "06:00 – 12:00",
    timerSeconds: 60,
    guestCount: 3, // guests 3-5 (after 2 training guests)
    skyTop: [255, 200, 120],
    skyBot: [255, 235, 180],
    ambientDesc: "Take your time — the morning rush is gentle.",
    icon: "sunrise",
  },
  {
    id: "afternoon",
    label: "AFTERNOON SHIFT",
    sublabel: "12:00 – 18:00",
    timerSeconds: 30,
    guestCount: 3, // guests 6-8
    skyTop: [100, 170, 230],
    skyBot: [180, 215, 245],
    ambientDesc: "Lunch rush. Things are picking up speed.",
    icon: "sun",
  },
  {
    id: "night",
    label: "NIGHT SHIFT",
    sublabel: "18:00 – ???",
    timerSeconds: 15,
    guestCount: Infinity, // endless until game over
    skyTop: [18, 22, 48],
    skyBot: [35, 42, 78],
    ambientDesc: "Graveyard shift. Don't blink.",
    icon: "moon",
  },
];

let currentShift = 0; // index into SHIFTS
let stagePhase = "intro"; // "intro" | "play"
let stageFadeAlpha = 255;
let stageAnimFrame = 0;
let stageAutoStartMs = 0; // millis() timestamp when the stage screen appeared
const STAGE_HOLD_MS = 5000; // how long to show the card before auto-starting

// Stars for night shift intro
let stageStars = [];
function _buildStars() {
  stageStars = [];
  for (let i = 0; i < 120; i++) {
    stageStars.push({
      x: random(width),
      y: random(height * 0.65),
      r: random(0.8, 2.2),
      twinkle: random(TWO_PI),
    });
  }
}

function resetStage() {
  currentShift = 0;
  stagePhase = "intro";
  stageFadeAlpha = 255;
  stageAnimFrame = 0;
  stageAutoStartMs = millis();
  _buildStars();
  if (typeof resetShiftTimer === "function") resetShiftTimer();
}

function advanceShift() {
  if (currentShift < SHIFTS.length - 1) {
    currentShift++;
    stagePhase = "intro";
    stageFadeAlpha = 255;
    stageAnimFrame = 0;
    stageAutoStartMs = millis();
    _buildStars();
    if (typeof resetShiftTimer === "function") resetShiftTimer();
  }
}

function getCurrentShift() {
  return SHIFTS[currentShift];
}

// ── Stage transition screen ────────────────────────────────────────
function drawStageScreen() {
  stageAnimFrame++;
  let sh = SHIFTS[currentShift];

  // Auto-advance after STAGE_HOLD_MS
  let elapsed = millis() - stageAutoStartMs;
  if (elapsed >= STAGE_HOLD_MS) {
    gameState = "play";
    if (typeof resetShiftTimer === "function") resetShiftTimer();
    return;
  }

  // ── Sky gradient ──
  let t = [sh.skyTop[0], sh.skyTop[1], sh.skyTop[2]];
  let b = [sh.skyBot[0], sh.skyBot[1], sh.skyBot[2]];
  for (let y = 0; y < height; y++) {
    let f = y / height;
    stroke(lerp(t[0], b[0], f), lerp(t[1], b[1], f), lerp(t[2], b[2], f));
    line(0, y, width, y);
  }

  // ── Ambient scene elements ──
  if (sh.icon === "sunrise") _drawSunriseScene();
  else if (sh.icon === "sun") _drawAfternoonScene();
  else _drawNightScene();

  // ── Card ──
  _drawShiftCard(sh);

  // ── Fade-in overlay ──
  if (stageFadeAlpha > 0) {
    noStroke();
    fill(0, 0, 0, stageFadeAlpha);
    rect(0, 0, width, height);
    stageFadeAlpha = max(0, stageFadeAlpha - 6);
  }
}

// ── Scene helpers ──────────────────────────────────────────────────
function _drawSunriseScene() {
  // Horizon glow
  noStroke();
  for (let i = 0; i < 40; i++) {
    let alpha = map(i, 0, 40, 80, 0);
    fill(255, 160, 60, alpha);
    ellipse(width / 2, height * 0.52, width * 0.8 + i * 18, 80 + i * 6);
  }
  // Sun rising
  let sunY = height * 0.48 - sin(stageAnimFrame * 0.012) * 12;
  fill(255, 220, 50);
  noStroke();
  ellipse(width / 2, sunY, 100, 100);
  stroke(255, 200, 50, 140);
  strokeWeight(2.5);
  for (let a = 0; a < TWO_PI; a += PI / 7) {
    let r1 = 58,
      r2 = 82 + sin(stageAnimFrame * 0.04 + a) * 5;
    line(
      width / 2 + cos(a) * r1,
      sunY + sin(a) * r1,
      width / 2 + cos(a) * r2,
      sunY + sin(a) * r2,
    );
  }
  // Road
  _drawStageRoad();
  // Soft clouds
  noStroke();
  fill(255, 255, 240, 200);
  ellipse(200, 110, 170, 64);
  ellipse(300, 95, 130, 52);
  ellipse(900, 130, 190, 68);
  ellipse(1010, 115, 150, 58);
}

function _drawAfternoonScene() {
  // High sun
  let sunX = width * 0.82,
    sunY = 80;
  noStroke();
  fill(255, 230, 60);
  ellipse(sunX, sunY, 90, 90);
  stroke(255, 210, 50, 160);
  strokeWeight(2);
  for (let a = 0; a < TWO_PI; a += PI / 6) {
    let r1 = 50,
      r2 = 72 + sin(stageAnimFrame * 0.05 + a) * 4;
    line(
      sunX + cos(a) * r1,
      sunY + sin(a) * r1,
      sunX + cos(a) * r2,
      sunY + sin(a) * r2,
    );
  }
  // Crisp blue clouds
  noStroke();
  fill(255, 255, 255, 230);
  ellipse(160, 90, 190, 72);
  ellipse(270, 74, 150, 60);
  ellipse(700, 80, 180, 68);
  ellipse(820, 68, 140, 56);
  _drawStageRoad();
}

function _drawNightScene() {
  // Stars
  noStroke();
  for (let s of stageStars) {
    let alpha = 160 + sin(stageAnimFrame * 0.04 + s.twinkle) * 80;
    fill(220, 225, 255, alpha);
    ellipse(s.x, s.y, s.r * 2, s.r * 2);
  }
  // Moon
  let mx = width * 0.78,
    my = 90;
  fill(240, 240, 210);
  noStroke();
  ellipse(mx, my, 80, 80);
  // Crescent shadow
  fill(35, 42, 78);
  noStroke();
  ellipse(mx + 22, my - 6, 72, 72);
  // Glow halo
  for (let i = 5; i > 0; i--) {
    fill(200, 210, 180, i * 8);
    ellipse(mx, my, 80 + i * 14, 80 + i * 14);
  }
  _drawStageRoad(true);
  // Street lamp cones
  _drawLamp(width * 0.25, roadY);
  _drawLamp(width * 0.6, roadY);
  _drawLamp(width * 0.88, roadY);
}

function _drawLamp(x, ry) {
  // Light cone
  noStroke();
  for (let i = 0; i < 20; i++) {
    fill(255, 240, 180, map(i, 0, 20, 28, 0));
    let w = i * 18;
    triangle(x, ry - 120, x - w, ry, x + w, ry);
  }
  // Pole
  stroke(140, 140, 160);
  strokeWeight(3);
  line(x, ry, x, ry - 120);
  // Head
  fill(160, 160, 180);
  noStroke();
  rect(x - 16, ry - 128, 32, 12, 4);
  fill(255, 245, 200);
  noStroke();
  rect(x - 11, ry - 126, 22, 8, 3);
}

function _drawStageRoad(night = false) {
  let rY = roadY,
    rH = roadH;
  noStroke();
  fill(night ? color(32, 34, 38) : color(55, 58, 62));
  rect(0, rY, width, rH);
  fill(night ? color(45, 100, 40) : color(80, 140, 70));
  rect(0, rY + rH, width, height - rY - rH);
  rect(0, rY - 12, width, 12);
  fill(220, 200, 60);
  rect(0, rY, width, 5);
  rect(0, rY + rH - 5, width, 5);
  stroke(night ? color(255, 255, 255, 120) : color(255, 255, 255, 200));
  strokeWeight(3);
  let lY = rY + rH / 2;
  for (let x = 0; x < width; x += 70) line(x, lY, x + 40, lY);
}

// ── Shift card ─────────────────────────────────────────────────────
function _drawShiftCard(sh) {
  let cW = 620,
    cH = 340;
  let cX = width / 2 - cW / 2;
  let cY = height / 2 - cH / 2 - 30;
  let isNight = sh.icon === "moon";

  // Card shadow
  noStroke();
  fill(0, 0, 0, 70);
  rect(cX + 8, cY + 8, cW, cH, 14);

  // Card body
  fill(isNight ? color(18, 22, 46) : color(248, 250, 253));
  stroke(isNight ? color(80, 100, 180) : color(13, 67, 102));
  strokeWeight(2.5);
  rect(cX, cY, cW, cH, 12);

  // Header bar
  let hdrCol = isNight ? color(30, 38, 90) : color(13, 67, 102);
  fill(hdrCol);
  noStroke();
  rect(cX, cY, cW, 52, 12, 12, 0, 0);

  // Shift number badge
  let badgeLabel = ["I", "II", "III"][currentShift];
  fill(200, 165, 60);
  noStroke();
  ellipse(cX + 38, cY + 26, 36, 36);
  fill(isNight ? color(18, 22, 46) : color(13, 67, 102));
  textAlign(CENTER, CENTER);
  textFont("Georgia, serif");
  textSize(16);
  text(badgeLabel, cX + 38, cY + 27);

  // Title
  fill(255);
  textAlign(CENTER, CENTER);
  textFont("Georgia, serif");
  textSize(22);
  text(sh.label, width / 2, cY + 27);

  // Time label
  fill(200, 165, 60);
  textFont("sans-serif");
  textSize(13);
  text(sh.sublabel, width / 2, cY + 72);

  // Divider
  stroke(isNight ? color(60, 70, 140) : color(200, 200, 220));
  strokeWeight(1);
  line(cX + 30, cY + 86, cX + cW - 30, cY + 86);

  // ── Timer info block ──
  let timerLabel = sh.timerSeconds === Infinity ? "∞" : sh.timerSeconds + "s";
  noStroke();
  fill(isNight ? color(40, 50, 100) : color(235, 242, 252));
  rect(cX + 30, cY + 100, cW - 60, 70, 8);

  fill(isNight ? color(150, 170, 255) : color(13, 67, 102));
  textAlign(CENTER, CENTER);
  textFont("Georgia, serif");
  textSize(38);
  text(timerLabel, width / 2 - 80, cY + 136);

  stroke(isNight ? color(60, 75, 150) : color(180, 195, 220));
  strokeWeight(1);
  line(width / 2 - 20, cY + 108, width / 2 - 20, cY + 162);

  noStroke();
  fill(isNight ? color(140, 155, 220) : color(60, 80, 120));
  textAlign(LEFT, CENTER);
  textFont("sans-serif");
  textSize(13);
  text("per guest\ntime limit", width / 2 - 10, cY + 136);

  // ── Flavour text ──
  fill(isNight ? color(160, 170, 220) : color(60, 80, 120));
  textAlign(CENTER, CENTER);
  textFont("sans-serif");
  textSize(14);
  text(sh.ambientDesc, width / 2, cY + 210);

  // ── Shift icon (big, decorative) ──
  _drawShiftIcon(sh.icon, cX + cW - 72, cY + 150, 44, isNight);

  // ── Auto-start countdown bar ──
  let elapsed = millis() - stageAutoStartMs;
  let progress = constrain(1 - elapsed / STAGE_HOLD_MS, 0, 1);
  let secsLeft = ceil((STAGE_HOLD_MS - elapsed) / 1000);

  let barX = cX + 30,
    barY = cY + cH - 46,
    barW = cW - 60,
    barH = 10;

  // Track
  noStroke();
  fill(isNight ? color(40, 50, 100) : color(210, 220, 235));
  rect(barX, barY, barW, barH, 5);

  // Fill — pulses slightly as last second arrives
  let pulse = secsLeft === 1 ? 0.82 + sin(frameCount * 0.25) * 0.18 : 1.0;
  let fillCol = isNight
    ? color(120, 145, 230, 255 * pulse)
    : color(13, 67, 102, 255 * pulse);
  fill(fillCol);
  rect(barX, barY, barW * progress, barH, 5);

  // Gold leading edge glow
  if (progress > 0.02) {
    noStroke();
    fill(200, 165, 60, 180 * pulse);
    ellipse(barX + barW * progress, barY + barH / 2, 14, 14);
  }

  // "Starting in N…" label
  noStroke();
  fill(isNight ? color(160, 170, 220) : color(80, 100, 140));
  textAlign(CENTER, CENTER);
  textFont("sans-serif");
  textSize(12);
  text("Starting in  " + secsLeft + "…", width / 2, barY - 14);
}

function _drawShiftIcon(type, cx, cy, r, isNight) {
  push();
  if (type === "sunrise") {
    // Half-sun rising from a line
    fill(255, 220, 50);
    noStroke();
    arc(cx, cy + 10, r * 2, r * 2, PI, TWO_PI);
    stroke(255, 200, 50, 180);
    strokeWeight(2);
    for (let a = PI + PI / 8; a < TWO_PI - PI / 8; a += PI / 5) {
      line(
        cx + cos(a) * (r + 4),
        cy + 10 + sin(a) * (r + 4),
        cx + cos(a) * (r + 16),
        cy + 10 + sin(a) * (r + 16),
      );
    }
    stroke(255, 200, 50, 100);
    strokeWeight(2);
    line(cx - r - 12, cy + 10, cx + r + 12, cy + 10);
  } else if (type === "sun") {
    fill(255, 230, 60);
    noStroke();
    ellipse(cx, cy, r * 2, r * 2);
    stroke(255, 210, 50, 160);
    strokeWeight(2);
    for (let a = 0; a < TWO_PI; a += PI / 6) {
      line(
        cx + cos(a) * (r + 3),
        cy + sin(a) * (r + 3),
        cx + cos(a) * (r + 14),
        cy + sin(a) * (r + 14),
      );
    }
  } else {
    // Moon crescent
    fill(240, 240, 210);
    noStroke();
    ellipse(cx, cy, r * 2, r * 2);
    fill(isNight ? color(18, 22, 46) : color(248, 250, 253));
    noStroke();
    ellipse(cx + r * 0.5, cy - r * 0.1, r * 1.7, r * 1.7);
    // Stars nearby
    fill(220, 225, 255, 200);
    noStroke();
    ellipse(cx + r + 8, cy - r + 2, 4, 4);
    ellipse(cx + r + 18, cy - r + 14, 3, 3);
    ellipse(cx + r + 5, cy - r + 22, 3.5, 3.5);
  }
  pop();
}

// ── Click handling for stage screen ───────────────────────────────
// Stage screen auto-advances — no click needed, but keep the hook in case
// sketch.js calls it.
function handleStageClick() {
  // intentionally empty — auto-advance is handled in drawStageScreen()
}
