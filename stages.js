// stages.js — Day transition screens shown before each shift begins

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
let stageTimer = 0; // counts up in frames
let stageDuration = 180; // 3 seconds at 60 fps
let speechVisible = true; // controls speech bubble fade
let stageDone = false; // flips to true when transition ends

// ─────────────────────────────────────────────
// Entry point — called from draw() when
// gameState === "stage"
// ─────────────────────────────────────────────
function drawStageScreen() {
  stageTimer++;

  // After 5 s, jump straight to play
  if (stageTimer >= stageDuration) {
    if (!stageDone) {
      stageDone = true;
      gameState = "play";
    }
    return;
  }

  // Speech bubble fades out in the last 60 frames (1 s)
  speechVisible = stageTimer < stageDuration - 60;

  drawBoothInterior();
  drawDeskAndProps();
  drawDayCalendar(width * 0.32, height * 0.7);
  drawSeatedAttendant(width * 0.8, height * 0.72);
  if (speechVisible) {
    drawSpeechBubble(
      width * 0.8 - 14,
      height * 0.72 - 180,
      "First day at work!\nI'm kind of nervous.",
    );
  }
  drawContinueHint();
}

// ─────────────────────────────────────────────
// Reset — call this every time we enter a stage
// ─────────────────────────────────────────────
function resetStage() {
  stageTimer = 0;
  speechVisible = true;
  stageDone = false;
}

// ─────────────────────────────────────────────
// Interior background — wood-panelled booth room
// ─────────────────────────────────────────────
function drawBoothInterior() {
  // Back wall — warm off-white plaster
  background(232, 225, 210);

  // Wall panel lines (vertical tongue-and-groove)
  stroke(210, 200, 182);
  strokeWeight(1);
  for (let x = 40; x < width; x += 48) {
    line(x, 19, x, height * 0.86);
  }

  // Dado rail — horizontal divider at 86% height
  fill(180, 155, 110);
  noStroke();
  rect(0, height * 0.86, width, 10);

  // Lower wainscot — slightly darker warm wood tone
  fill(200, 175, 130);
  rect(0, height * 0.86 + 10, width, height - height * 0.86 - 10);

  // Floor — darker planks
  fill(155, 120, 78);
  noStroke();
  rect(0, height * 0.92, width, height - height * 0.92);
  stroke(130, 100, 60);
  strokeWeight(1);
  for (let x = 0; x < width; x += 80) {
    line(x, height * 0.92, x, height);
  }
  // Floor highlight
  noStroke();
  fill(255, 255, 255, 18);
  rect(0, height * 0.92, width, 6);

  // Service window dominates the back wall
  drawInteriorWindow();

  // Navy top accent strip
  fill(13, 67, 102);
  noStroke();
  rect(0, 0, width, 14);
  // Gold band beneath it
  fill(200, 165, 60);
  noStroke();
  rect(0, 14, width, 5);
}

// Window — small, right side of wall, desk sits beneath it
function drawInteriorWindow() {
  let ww = width * 0.18,
    wh = height * 0.36;
  let wx = width * 0.74; // right side of canvas
  let wy = height * 0.16; // upper portion of wall

  // Frame shadow
  noStroke();
  fill(0, 0, 0, 25);
  rect(wx - 4, wy - 4, ww + 12, wh + 12, 5);

  // Frame
  fill(100, 75, 45);
  stroke(60, 40, 20);
  strokeWeight(2);
  rect(wx - 6, wy - 6, ww + 12, wh + 12, 4);

  // Outside sky
  fill(212, 235, 250);
  noStroke();
  rect(wx, wy, ww, wh);

  // Road strip
  fill(55, 58, 62);
  noStroke();
  rect(wx, wy + wh * 0.72, ww, wh * 0.18);
  fill(80, 140, 70);
  rect(wx, wy + wh * 0.9, ww, wh * 0.1);
  // Road dashes
  stroke(255, 255, 255, 180);
  strokeWeight(2);
  let lY = wy + wh * 0.81;
  for (let x = wx; x < wx + ww; x += 28) line(x, lY, x + 16, lY);

  // Sun
  noStroke();
  fill(255, 220, 50);
  ellipse(wx + ww * 0.8, wy + wh * 0.16, 28, 28);

  // Cross dividers (4 panes)
  fill(100, 75, 45);
  noStroke();
  rect(wx, wy + wh / 2 - 3, ww, 6);
  rect(wx + ww / 2 - 3, wy, 6, wh);

  // Glass glint
  noStroke();
  fill(255, 255, 255, 55);
  rect(wx + 4, wy + 4, ww * 0.28, wh * 0.42, 2);

  // Window sill — the desk surface acts as the sill below
  fill(130, 100, 60);
  stroke(80, 55, 25);
  strokeWeight(1);
  rect(wx - 10, wy + wh + 6, ww + 20, 12, 2);

  // Cactus on sill
  drawMiniCactus(wx + ww * 0.5, wy + wh + 4);
}

function drawMiniCactus(cx, baseY) {
  push();
  // Pot
  fill(180, 100, 60);
  stroke(120, 65, 30);
  strokeWeight(1);
  rect(cx - 8, baseY - 14, 16, 12, 2);
  // Soil
  fill(100, 65, 30);
  noStroke();
  ellipse(cx, baseY - 14, 16, 5);
  // Cactus stem
  fill(80, 140, 70);
  stroke(50, 100, 45);
  strokeWeight(1);
  rect(cx - 4, baseY - 32, 8, 18, 3);
  // Arms
  rect(cx - 10, baseY - 28, 7, 5, 2);
  rect(cx + 3, baseY - 24, 7, 5, 2);
  // Spines
  stroke(200, 200, 160);
  strokeWeight(0.8);
  line(cx - 2, baseY - 30, cx - 2, baseY - 34);
  line(cx + 2, baseY - 30, cx + 2, baseY - 34);
  pop();
}

function drawWallLamp(lx, ly) {
  push();
  // Bracket arm
  fill(80, 65, 45);
  stroke(50, 38, 22);
  strokeWeight(1);
  rect(lx - 3, ly, 6, 22, 2);
  // Lamp shade
  fill(245, 210, 120);
  stroke(180, 140, 60);
  strokeWeight(1.2);
  triangle(lx - 18, ly + 22, lx + 18, ly + 22, lx, ly + 4);
  // Bulb glow
  noStroke();
  fill(255, 240, 180, 90);
  ellipse(lx, ly + 28, 60, 40);
  fill(255, 245, 200, 50);
  ellipse(lx, ly + 36, 110, 60);
  pop();
}

// ─────────────────────────────────────────────
// Desk and props
// ─────────────────────────────────────────────
function drawDeskAndProps() {
  let deskY = height * 0.65;
  let deskH = height * 0.2;
  let deskX = 0;
  let deskW = width;

  // Desk top surface
  fill(160, 120, 70);
  stroke(100, 72, 35);
  strokeWeight(2);
  rect(deskX, deskY, deskW, deskH);

  // Desk top highlight
  noStroke();
  fill(255, 255, 255, 22);
  rect(deskX, deskY, deskW, 8);

  // Desk front face (darker)
  fill(120, 88, 48);
  noStroke();
  rect(deskX, deskY + deskH * 0.55, deskW, deskH * 0.45);

  // Desk edge trim
  fill(100, 72, 35);
  noStroke();
  rect(deskX, deskY - 4, deskW, 8, 2);

  // ── Props on desk ──

  // Pen holder — right side near attendant
  drawPenHolder(width * 0.72, deskY);

  // Stack of papers — beside pen holder
  drawPenHolder(width * 0.86, deskY);

  // Small radio — far right edge
  drawDeskRadio(width * 0.95, deskY);
}

function drawPenHolder(cx, deskY) {
  push();
  // Cup
  fill(13, 67, 102);
  stroke(8, 44, 70);
  strokeWeight(1);
  rect(cx - 10, deskY - 28, 20, 28, 3, 3, 0, 0);
  // Pens sticking out
  stroke(60, 80, 180);
  strokeWeight(2);
  line(cx - 3, deskY - 28, cx - 5, deskY - 48);
  stroke(180, 40, 40);
  strokeWeight(2);
  line(cx + 3, deskY - 28, cx + 5, deskY - 50);
  stroke(40, 120, 60);
  strokeWeight(2);
  line(cx, deskY - 28, cx, deskY - 46);
  // Gold band on cup
  fill(200, 165, 60);
  noStroke();
  rect(cx - 10, deskY - 10, 20, 4);
  pop();
}

function drawPaperStack(cx, deskY) {
  push();
  // Three slightly offset sheets
  for (let i = 2; i >= 0; i--) {
    fill(245, 242, 235);
    stroke(180, 170, 150);
    strokeWeight(0.8);
    rect(cx - 28 + i * 2, deskY - 18 - i * 3, 56, 22, 1);
    // Ruled lines on top sheet
    if (i === 0) {
      stroke(190, 185, 175);
      strokeWeight(0.7);
      line(cx - 22, deskY - 13, cx + 22, deskY - 13);
      line(cx - 22, deskY - 8, cx + 14, deskY - 8);
      line(cx - 22, deskY - 3, cx + 18, deskY - 3);
    }
  }
  // "GUEST LOG" label on top sheet
  fill(13, 67, 102);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(7);
  text("GUEST LOG", cx, deskY - 14);
  pop();
}

function drawDeskRadio(cx, deskY) {
  push();
  // Body
  fill(55, 58, 62);
  stroke(30, 32, 35);
  strokeWeight(1);
  rect(cx - 22, deskY - 30, 44, 30, 4);
  // Grille
  fill(40, 43, 47);
  noStroke();
  rect(cx - 14, deskY - 26, 22, 16, 2);
  stroke(70, 75, 82);
  strokeWeight(1);
  for (let gy = deskY - 24; gy < deskY - 12; gy += 4)
    line(cx - 12, gy, cx + 6, gy);
  // Red indicator light
  fill(220, 50, 50);
  noStroke();
  ellipse(cx + 14, deskY - 22, 6, 6);
  // Knob
  fill(80, 83, 88);
  stroke(40, 43, 47);
  strokeWeight(1);
  ellipse(cx + 14, deskY - 10, 10, 10);
  fill(100, 103, 108);
  noStroke();
  ellipse(cx + 14, deskY - 10, 6, 6);
  pop();
}

// ─────────────────────────────────────────────
// Day calendar — large wall-hung poster filling the left wall
// cx/cy is the centre of the calendar on the wall
// ─────────────────────────────────────────────
function drawDayCalendar(cx, bottomY) {
  push();

  let cw = width * 0.56; // fills most of left portion of wall
  let ch = height * 0.58; // tall enough to dominate the wall
  let cx2 = cx;
  let cy2 = bottomY - ch; // top of calendar

  // Hanging string
  stroke(100, 80, 50);
  strokeWeight(1.5);
  line(cx2 - cw * 0.22, cy2, cx2 - cw * 0.22, cy2 - 16);
  line(cx2 + cw * 0.22, cy2, cx2 + cw * 0.22, cy2 - 16);
  // Nails
  fill(150, 130, 100);
  noStroke();
  ellipse(cx2 - cw * 0.22, cy2 - 17, 6, 6);
  ellipse(cx2 + cw * 0.22, cy2 - 17, 6, 6);

  // Drop shadow
  noStroke();
  fill(0, 0, 0, 28);
  rect(cx2 - cw / 2 + 7, cy2 + 7, cw, ch, 10);

  // Calendar body — crisp white page
  fill(250, 248, 242);
  stroke(160, 140, 110);
  strokeWeight(2);
  rect(cx2 - cw / 2, cy2, cw, ch, 6);

  // Binding rings along the top
  fill(160, 155, 150);
  stroke(100, 95, 90);
  strokeWeight(1.2);
  let ringCount = 8;
  for (let i = 0; i < ringCount; i++) {
    let rx = cx2 - cw / 2 + 30 + i * ((cw - 60) / (ringCount - 1));
    ellipse(rx, cy2 + 2, 14, 18);
    fill(80, 78, 75);
    noStroke();
    ellipse(rx, cy2 + 2, 7, 11);
    fill(160, 155, 150);
    stroke(100, 95, 90);
    strokeWeight(1.2);
  }

  // Top banner — navy, tall
  fill(13, 67, 102);
  noStroke();
  rect(cx2 - cw / 2 + 1, cy2 + 12, cw - 2, ch * 0.18, 4, 4, 0, 0);

  // Banner text
  textFont("sans-serif");
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  fill(200, 165, 60);
  noStroke();
  textSize(cw * 0.038);
  text("PAWS PARKING CO.", cx2, cy2 + 12 + ch * 0.065);
  fill(255, 255, 255, 160);
  textSize(cw * 0.022);
  text("★  OFFICIAL SHIFT CALENDAR  ★", cx2, cy2 + 12 + ch * 0.135);

  // Divider line
  stroke(200, 185, 160);
  strokeWeight(1.5);
  line(
    cx2 - cw / 2 + 20,
    cy2 + 12 + ch * 0.18,
    cx2 + cw / 2 - 20,
    cy2 + 12 + ch * 0.18,
  );

  // "DAY" label
  textFont("sans-serif");
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  fill(13, 67, 102);
  noStroke();
  textSize(cw * 0.075);
  text("DAY", cx2, cy2 + ch * 0.35);

  // Giant day number
  textFont("sans-serif");
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  fill(13, 67, 102);
  noStroke();
  textSize(cw * 0.3);
  text("1", cx2, cy2 + ch * 0.65);

  textStyle(NORMAL);

  // Subtle ruled lines at the bottom of the page
  stroke(210, 200, 185);
  strokeWeight(0.8);
  for (let ry = cy2 + ch * 0.86; ry < cy2 + ch - 14; ry += 10)
    line(cx2 - cw / 2 + 20, ry, cx2 + cw / 2 - 20, ry);

  // Tear-off bottom strip
  noStroke();
  fill(190, 175, 150);
  rect(cx2 - cw / 2 + 1, cy2 + ch - 10, cw - 2, 9, 0, 0, 5, 5);
  // Perforated line above tear strip
  stroke(160, 145, 120);
  strokeWeight(1);
  for (let dx = cx2 - cw / 2 + 10; dx < cx2 + cw / 2 - 10; dx += 8)
    line(dx, cy2 + ch - 10, dx + 4, cy2 + ch - 10);

  pop();
}

// ─────────────────────────────────────────────
// Seated attendant character
// ─────────────────────────────────────────────
function drawSeatedAttendant(cx, floorY) {
  push();

  let headR = 28;
  let headY = floorY - 175;

  // ── Chair ──
  // Chair back
  fill(80, 55, 30);
  stroke(50, 32, 12);
  strokeWeight(1.5);
  rect(cx - 26, headY + headR * 1.6, 52, 90, 4, 4, 0, 0);
  // Chair seat
  fill(100, 68, 35);
  stroke(50, 32, 12);
  strokeWeight(1.5);
  rect(cx - 34, headY + headR * 3.6, 68, 18, 4);
  // Chair legs
  stroke(60, 38, 15);
  strokeWeight(3);
  line(cx - 28, headY + headR * 3.6 + 18, cx - 32, floorY);
  line(cx + 28, headY + headR * 3.6 + 18, cx + 32, floorY);
  // Armrests
  stroke(80, 52, 22);
  strokeWeight(4);
  line(cx - 34, headY + headR * 2.2, cx - 34, headY + headR * 3.6);
  line(cx + 34, headY + headR * 2.2, cx + 34, headY + headR * 3.6);
  // Chair cushion highlight
  noStroke();
  fill(255, 255, 255, 18);
  rect(cx - 32, headY + headR * 3.6, 64, 6, 3);

  // ── Legs / trousers ──
  fill(13, 67, 102);
  noStroke();
  rect(cx - 20, headY + headR * 3.6 + 10, 18, 40, 3);
  rect(cx + 2, headY + headR * 3.6 + 10, 18, 40, 3);
  // Shoes
  fill(35, 28, 20);
  noStroke();
  ellipse(cx - 11, floorY - 6, 24, 14);
  ellipse(cx + 11, floorY - 6, 24, 14);

  // ── Torso / uniform ──
  fill(13, 67, 102);
  stroke(8, 44, 70);
  strokeWeight(1.2);
  beginShape();
  vertex(cx - headR * 1.55, headY + headR * 3.55);
  vertex(cx + headR * 1.55, headY + headR * 3.55);
  vertex(cx + headR * 1.15, headY + headR * 1.15);
  vertex(cx - headR * 1.15, headY + headR * 1.15);
  endShape(CLOSE);

  // Collar
  fill(245, 245, 235);
  noStroke();
  triangle(
    cx,
    headY + headR * 0.95,
    cx - headR * 0.5,
    headY + headR * 1.72,
    cx + headR * 0.5,
    headY + headR * 1.72,
  );

  // Gold chest badge
  fill(200, 165, 60);
  noStroke();
  rect(cx + headR * 0.18, headY + headR * 1.32, headR * 0.78, headR * 0.42, 2);
  fill(13, 67, 102);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(6);
  text("PP", cx + headR * 0.57, headY + headR * 1.54);

  // ── Left arm — straight down by side ──
  stroke(8, 44, 70);
  strokeWeight(6);
  line(
    cx - headR * 1.0,
    headY + headR * 1.3,
    cx - headR * 1.05,
    headY + headR * 3.4,
  );
  fill(255, 218, 170);
  stroke(160, 110, 70);
  strokeWeight(1);
  ellipse(cx - headR * 1.06, headY + headR * 3.6, headR * 0.48, headR * 0.42);

  // ── Right arm — straight down by side ──
  stroke(8, 44, 70);
  strokeWeight(6);
  line(
    cx + headR * 1.0,
    headY + headR * 1.3,
    cx + headR * 1.05,
    headY + headR * 3.4,
  );
  fill(255, 218, 170);
  stroke(160, 110, 70);
  strokeWeight(1);
  ellipse(cx + headR * 1.06, headY + headR * 3.6, headR * 0.48, headR * 0.42);

  // ── Head ──
  fill(255, 218, 170);
  stroke(160, 110, 70);
  strokeWeight(1.2);
  ellipse(cx, headY, headR * 2, headR * 2.1);

  // Cap dome
  fill(13, 67, 102);
  noStroke();
  arc(cx, headY - headR * 0.58, headR * 1.9, headR * 1.45, PI, TWO_PI);

  // Cap brim
  fill(8, 44, 90);
  noStroke();
  rect(cx - headR * 1.3, headY - headR * 0.72, headR * 2.6, headR * 0.3, 2);

  // Gold cap band
  fill(200, 165, 60);
  noStroke();
  rect(cx - headR * 0.95, headY - headR * 0.74, headR * 1.9, headR * 0.19);

  // Eyes — slightly wide, nervous look
  fill(40, 25, 10);
  noStroke();
  ellipse(cx - headR * 0.32, headY - headR * 0.1, headR * 0.26, headR * 0.28);
  ellipse(cx + headR * 0.32, headY - headR * 0.1, headR * 0.26, headR * 0.28);
  // Whites (nervous wide eyes)
  fill(255);
  noStroke();
  ellipse(cx - headR * 0.32, headY - headR * 0.18, headR * 0.14, headR * 0.13);
  ellipse(cx + headR * 0.32, headY - headR * 0.18, headR * 0.14, headR * 0.13);

  // Sweat drop (nervous!)
  fill(150, 200, 240);
  stroke(100, 160, 210);
  strokeWeight(0.8);
  ellipse(cx + headR * 0.88, headY - headR * 0.55, 7, 10);
  fill(200, 230, 255);
  noStroke();
  ellipse(cx + headR * 0.88, headY - headR * 0.62, 3, 3);

  // Nervous wavy mouth
  noFill();
  stroke(140, 80, 50);
  strokeWeight(1.4);
  beginShape();
  for (let i = 0; i <= 10; i++) {
    let t = i / 10;
    let mx = cx - headR * 0.28 + t * headR * 0.56;
    let my = headY + headR * 0.28 + sin(t * PI * 2) * 2.5;
    curveVertex(mx, my);
  }
  endShape();

  pop();
}

// ─────────────────────────────────────────────
// Speech bubble
// ─────────────────────────────────────────────
function drawSpeechBubble(tipX, tipY, message) {
  push();

  let padding = 16;
  let bw = 230,
    bh = 64;
  // Bubble sits above and to the left of the tip point
  let bx = tipX - bw + 20;
  let by = tipY - bh - 16;

  // Shadow
  noStroke();
  fill(0, 0, 0, 28);
  rect(bx + 3, by + 4, bw, bh, 14);

  // Bubble body
  fill(255, 252, 240);
  stroke(13, 67, 102);
  strokeWeight(1.8);
  rect(bx, by, bw, bh, 14);

  // Tail pointing down-right toward attendant's head
  fill(255, 252, 240);
  stroke(13, 67, 102);
  strokeWeight(1.8);
  // Draw tail as a small triangle
  let tailBaseX = bx + bw - 30;
  let tailBaseY = by + bh;
  // Erase the stroke on the base edge so it blends into the bubble
  noStroke();
  fill(255, 252, 240);
  triangle(
    tailBaseX,
    tailBaseY - 2,
    tailBaseX + 18,
    tailBaseY - 2,
    tipX + 8,
    tipY,
  );
  // Re-draw the two outer edges of the tail with stroke
  stroke(13, 67, 102);
  strokeWeight(1.8);
  line(tailBaseX, tailBaseY - 2, tipX + 8, tipY);
  line(tailBaseX + 18, tailBaseY - 2, tipX + 8, tipY);

  // Message text
  fill(13, 67, 102);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(13);
  text(message, bx + bw / 2, by + bh / 2 - 1);

  pop();
}

// ─────────────────────────────────────────────
// Visual timer bar — gold pill drains across bottom
// ─────────────────────────────────────────────
function drawContinueHint() {
  let alpha = stageTimer < 30 ? map(stageTimer, 0, 30, 0, 255) : 255;
  let progress = stageTimer / stageDuration; // 0 → 1
  let barW = 340;
  let barH = 14;
  let barX = width / 2 - barW / 2;
  let barY = height - 38;
  let fillW = barW * (1 - progress); // shrinks as time passes

  push();

  // Label above bar
  textFont("sans-serif");
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  textSize(11);
  fill(13, 67, 102, alpha * 0.75);
  noStroke();
  text("SHIFT STARTING", width / 2, barY - 13);

  // Track background
  fill(13, 67, 102, alpha * 0.18);
  stroke(13, 67, 102, alpha * 0.35);
  strokeWeight(1.2);
  rect(barX, barY, barW, barH, barH / 2);

  // Gold fill — drains left to right
  if (fillW > 1) {
    noStroke();
    fill(200, 165, 60, alpha);
    rect(barX, barY, fillW, barH, barH / 2);
    // Sheen on top half
    fill(230, 200, 100, alpha * 0.45);
    rect(barX + 2, barY + 2, max(0, fillW - 4), barH * 0.38, barH / 2);
  }

  // Track outline drawn on top
  noFill();
  stroke(13, 67, 102, alpha * 0.5);
  strokeWeight(1.2);
  rect(barX, barY, barW, barH, barH / 2);

  // Subtle quarter tick marks
  stroke(13, 67, 102, alpha * 0.28);
  strokeWeight(1);
  for (let t of [0.25, 0.5, 0.75]) {
    let tx = barX + barW * t;
    line(tx, barY + 3, tx, barY + barH - 3);
  }

  pop();
}
