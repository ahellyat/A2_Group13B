// start.js

let gameState = "start"; // "start" or "play"
let showInstructions = false;

function drawStartScreen() {

  // ── Sky ──
  background(212, 235, 250);

  // Sun
  let sunX = width - 110, sunY = 75, sunR = 46;
  stroke(255, 220, 50, 180); strokeWeight(3);
  for (let a = 0; a < TWO_PI; a += PI / 6) {
    line(sunX + cos(a) * (sunR + 5), sunY + sin(a) * (sunR + 5),
         sunX + cos(a) * (sunR + 20), sunY + sin(a) * (sunR + 20));
  }
  noStroke(); fill(255, 220, 50);
  ellipse(sunX, sunY, sunR * 2, sunR * 2);

  // Light clouds
  noStroke();
  fill(255, 255, 255, 200);
  ellipse(180, 80, 160, 60); ellipse(260, 65, 120, 50); ellipse(130, 72, 90, 45);
  ellipse(560, 95, 140, 52); ellipse(640, 80, 110, 46);
  ellipse(950, 70, 155, 58); ellipse(1040, 58, 130, 50);

  // ── Road ──
  let rY = 420, rH = 90;
  noStroke();
  // Grass verge top
  fill(80, 140, 70);
  rect(0, rY - 14, width, 14);
  // Road surface
  fill(55, 58, 62);
  rect(0, rY, width, rH);
  // Grass below
  fill(80, 140, 70);
  rect(0, rY + rH, width, height - rY - rH);
  // Road edge lines
  fill(220, 200, 60);
  rect(0, rY, width, 5);
  rect(0, rY + rH - 5, width, 5);
  // Centre dashes
  stroke(255, 255, 255, 200); strokeWeight(3);
  let lY = rY + rH / 2;
  for (let x = 0; x < width; x += 70) line(x, lY, x + 40, lY);

  // ── Ticket booth (right side) ──
  drawMenuBooth();

  // ── Title sign ──
  drawMenuTitleSign();

  // ── Buttons ──
  drawMenuButton("▶  Begin Shift", width / 2, height / 2, 220, 56);
  drawMenuButton("?  How to Play", width / 2, height / 2 + 74, 220, 56);

  if (showInstructions) drawInstructionsPanel();
}

// ── Styled title sign on a post ───────────────────────────────────
function drawMenuTitleSign() {
  let sx = width / 2;
  let sy = height / 2 - 148;
  let sw = 560, sh = 80;

  // Post
  fill(120, 90, 50); noStroke();
  rect(sx - 6, sy + sh / 2, 12, 90, 3);

  // Sign shadow
  fill(0, 0, 0, 40); noStroke();
  rect(sx - sw / 2 + 5, sy - sh / 2 + 5, sw, sh, 10);

  // Sign board — navy
  fill(13, 67, 102); stroke(8, 44, 70); strokeWeight(2);
  rect(sx - sw / 2, sy - sh / 2, sw, sh, 8);

  // Gold inner border
  noFill(); stroke(200, 165, 60); strokeWeight(2);
  rect(sx - sw / 2 + 6, sy - sh / 2 + 6, sw - 12, sh - 12, 5);

  // Corner stars
  fill(200, 165, 60); noStroke(); textAlign(CENTER, CENTER); textSize(14);
  for (let ox of [-sw / 2 + 18, sw / 2 - 18]) text("★", sx + ox, sy);

  // Title text
  fill(255, 245, 200);
  textFont("sans-serif"); textStyle(BOLD);
  textAlign(CENTER, CENTER); textSize(34);
  text("PAWS PARKING", sx, sy - 10);
  textSize(14); textStyle(NORMAL);
  fill(200, 165, 60);
  text("D A I L Y   R O U T I N E", sx, sy + 20);
}

// ── Mini ticket booth matching in-game style ──────────────────────
function drawMenuBooth() {
  let bX = width * 0.76;
  let bFloor = 420;      // road top
  let bW = 78, bH = 115;
  let bTop = bFloor - bH;
  let bL = bX - bW / 2, bR = bX + bW / 2;
  let roofW = bW + 24, roofH = 16;
  let roofL = bX - roofW / 2;

  push();

  // Shadow
  noStroke(); fill(0, 0, 0, 22);
  ellipse(bX, bFloor + 5, bW * 1.1, 10);

  // Body
  fill(245, 245, 235); stroke(60, 60, 60); strokeWeight(1.5);
  rect(bL, bTop, bW, bH, 3, 3, 0, 0);

  // Panel lines
  stroke(200, 200, 190); strokeWeight(1);
  line(bL + bW * 0.33, bTop + 2, bL + bW * 0.33, bFloor);
  line(bL + bW * 0.66, bTop + 2, bL + bW * 0.66, bFloor);

  // Window
  let wW = bW - 20, wH = 38, wX = bL + 10, wY = bTop + 12;
  fill(80, 60, 40); stroke(40, 30, 20); strokeWeight(1.2);
  rect(wX - 2, wY - 2, wW + 4, wH + 4, 3);
  fill(190, 220, 245, 210); noStroke();
  rect(wX, wY, wW, wH, 2);
  stroke(140, 170, 200); strokeWeight(1);
  line(wX + 2, wY + wH * 0.48, wX + wW - 2, wY + wH * 0.48);
  line(wX + wW * 0.5, wY + 2, wX + wW * 0.5, wY + wH - 2);

  // Shelf
  fill(160, 130, 90); stroke(80, 60, 40); strokeWeight(1);
  rect(bL - 3, wY + wH + 2, bW + 6, 8, 2);

  // Striped roof (clipped)
  let stripeColors = [color(220, 50, 50), color(245, 245, 235)];
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(roofL, bTop - roofH, roofW, roofH);
  drawingContext.clip();
  noStroke();
  let sw2 = roofW / 7;
  for (let i = 0; i < 7; i++) {
    fill(stripeColors[i % 2]);
    rect(roofL + i * sw2, bTop - roofH, sw2 + 1, roofH);
  }
  drawingContext.restore();
  stroke(60, 60, 60); strokeWeight(1.2); noFill();
  rect(roofL, bTop - roofH, roofW, roofH, 2, 2, 0, 0);

  // PARKING sign strip
  fill(220, 50, 50); stroke(140, 20, 20); strokeWeight(1);
  rect(bL + 8, bTop + 2, bW - 16, 9, 2);
  noStroke(); fill(255);
  textAlign(CENTER, CENTER); textSize(6);
  text("PARKING", bX, bTop + 6.5);

  // Gate arm — horizontal (closed)
  let armBaseX = bR + 1;
  let armBaseY = bFloor - 32;
  let armLen = 95;
  fill(180, 180, 190); stroke(80, 80, 90); strokeWeight(1);
  rect(armBaseX, armBaseY - 10, 16, 44, 3);
  // Arm stripes clipped
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(armBaseX + 8, armBaseY - 8, armLen, 9);
  drawingContext.clip();
  let bsw = 14;
  for (let i = 0; i * bsw < armLen + bsw; i++) {
    fill(i % 2 === 0 ? color(220, 50, 50) : color(245, 245, 235));
    noStroke(); rect(armBaseX + 8 + i * bsw, armBaseY - 8, bsw, 9);
  }
  drawingContext.restore();
  stroke(80, 80, 90); strokeWeight(1); noFill();
  rect(armBaseX + 8, armBaseY - 8, armLen, 9, 2);
  fill(255, 220, 0); noStroke();
  ellipse(armBaseX + 8 + armLen - 4, armBaseY - 3, 7, 7);

  pop();
}

// ── Simple car for the start screen ──────────────────────────────
function drawMenuCar(carX, rY) {
  let bodyW = 240, bodyH = 54;
  let cabinW = 140, cabinH = 50;
  let bBot = rY, bTop = bBot - bodyH;
  let bL = carX - bodyW / 2, bR = carX + bodyW / 2;
  let cabL = carX - cabinW / 2 - 10;
  let cabR = cabL + cabinW;
  let cabTop = bTop - cabinH;
  let wR = 24, wFX = bR - 46, wBX = bL + 46, wY = bBot + 3;
  let carCol = color(40, 120, 220);

  push();

  // Shadow
  noStroke(); fill(0, 0, 0, 28);
  ellipse(carX, bBot + 8, bodyW * 0.88, 12);

  // Body
  fill(carCol); stroke(0); strokeWeight(1.6);
  beginShape();
  vertex(bL + 5,  bBot);
  vertex(bR - 5,  bBot);
  vertex(bR + 3,  bTop + 12);
  vertex(bR - 2,  bTop);
  vertex(bL + 2,  bTop);
  vertex(bL - 3,  bTop + 12);
  endShape(CLOSE);

  // Body sheen
  noStroke(); fill(255, 255, 255, 28);
  beginShape();
  vertex(bL + 4, bTop + 1); vertex(bR - 4, bTop + 1);
  vertex(bR - 6, bTop + 10); vertex(bL + 6, bTop + 10);
  endShape(CLOSE);

  // Cabin
  let roofCol = lerpColor(carCol, color(10), 0.18);
  fill(roofCol); stroke(0); strokeWeight(1.6);
  beginShape();
  vertex(cabL,      bTop);
  vertex(cabL + 10, cabTop + 7);
  vertex(cabR - 7,  cabTop);
  vertex(cabR,      bTop);
  endShape(CLOSE);

  // Side window
  let winX = cabL + 12, winY = cabTop + 9;
  let winW = cabinW - 24, winH = bTop - winY - 3;
  fill(170, 215, 255, 160); stroke(0); strokeWeight(1);
  rect(winX, winY, winW, winH, 3);
  noStroke(); fill(255, 255, 255, 55);
  rect(winX + 3, winY + 2, winW * 0.22, winH - 4, 2);

  // Shape badge on door
  fill(255); stroke(0); strokeWeight(1.8);
  let bdgCy = bTop + bodyH / 2;
  rect(carX - 20, bdgCy - 18, 36, 36, 3);

  // Square inside badge
  fill(40, 120, 220); noStroke();
  rect(carX - 13, bdgCy - 11, 22, 22, 2);

  // Headlights
  fill(lerpColor(carCol, color(30), 0.35)); stroke(0); strokeWeight(1);
  rect(bR - 1, bTop + 8, 7, 20, 2);
  fill(255, 255, 190); noStroke(); rect(bR, bTop + 10, 4, 8, 1);
  fill(255, 235, 140); rect(bR, bTop + 20, 4, 4, 1);

  // Tail lights
  fill(lerpColor(carCol, color(30), 0.35)); stroke(0); strokeWeight(1);
  rect(bL - 6, bTop + 8, 7, 20, 2);
  fill(190, 20, 20); noStroke(); rect(bL - 5, bTop + 10, 4, 8, 1);

  // Wheels
  for (let wx of [wFX, wBX]) {
    fill(22, 22, 22); stroke(0); strokeWeight(1.2);
    ellipse(wx, wY, wR * 2, wR * 2);
    fill(38, 38, 38); noStroke(); ellipse(wx, wY, wR * 1.6, wR * 1.6);
    fill(205, 210, 220); stroke(120); strokeWeight(0.7);
    ellipse(wx, wY, wR * 1.2, wR * 1.2);
    noFill(); stroke(170, 175, 185); strokeWeight(1);
    ellipse(wx, wY, wR * 0.7, wR * 0.7);
    fill(225, 228, 235); noStroke();
    ellipse(wx, wY, wR * 0.28, wR * 0.28);
  }

  // Animal (dog) in window
  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(winX + 2, winY + 2, winW - 4, winH - 4);
  drawingContext.clip();
  let anCX = winX + winW * 0.42;
  let anCY = winY + winH * 0.72;
  drawDog(anCX, anCY);
  drawingContext.restore();
  pop();
  // Re-draw glass on top
  fill(170, 215, 255, 110); stroke(0); strokeWeight(1);
  rect(winX, winY, winW, winH, 3);

  pop();
}

// ── Reusable menu button ──────────────────────────────────────────
function drawMenuButton(label, cx, cy, bw, bh) {
  let bx = cx - bw / 2, by = cy - bh / 2;
  let hov = mouseX >= bx && mouseX <= bx + bw &&
            mouseY >= by && mouseY <= by + bh;

  // Shadow
  noStroke(); fill(0, 0, 0, 30);
  rect(bx + 3, by + 4, bw, bh, 10);

  // Button face — dark panel style matching booth controls
  fill(hov ? color(247, 247, 205) : color(240, 248, 255));
  stroke(13, 67, 102); strokeWeight(1.8);
  rect(bx, by, bw, bh, 10);

  // Top accent bar
  noStroke();
  fill(hov ? color(200, 165, 60) : color(13, 67, 102));
  rect(bx + 1, by + 1, bw - 2, 6, 10, 10, 0, 0);

  // Label
  fill(13, 67, 102); noStroke();
  textFont("sans-serif"); textStyle(BOLD);
  textAlign(CENTER, CENTER); textSize(18);
  text(label, cx, cy + 2);
  textStyle(NORMAL);
}

// ── Instructions overlay panel ─────────────────────────────────────
function drawInstructionsPanel() {
  let panW = 860;
  let panH = 660;
  let panX = width / 2 - panW / 2;
  let panY = height / 2 - panH / 2;

  // Dim background
  noStroke();
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);

  // Drop shadow
  fill(0, 0, 0, 60); noStroke();
  rect(panX + 7, panY + 7, panW, panH, 12);

  // Panel body
  fill(248, 250, 253);
  stroke(13, 67, 102);
  strokeWeight(2);
  rect(panX, panY, panW, panH, 10);

  // Header bar
  fill(13, 67, 102); noStroke();
  rect(panX, panY, panW, 50, 10, 10, 0, 0);

  // Header title
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("★  How to Play  ★", width / 2, panY + 25);

  // ── Body text ──
  let tx = panX + 54;
  let ty = panY + 82;
  let lineH = 28;

  // YOUR ROLE
  ty = drawSectionHeader("YOUR ROLE", tx, ty);
  textFont("sans-serif"); textSize(13); textStyle(NORMAL); fill(40, 60, 80); noStroke(); textAlign(LEFT, TOP);
  text("You are a parking booth attendant. Animals arrive one by one and you must", tx, ty); ty += lineH;
  text("process each guest correctly before opening the gate to let them through.", tx, ty); ty += lineH + 14;

  // THE TWO RITUALS
  ty = drawSectionHeader("THE TWO RITUALS", tx, ty);
  textFont("sans-serif"); textSize(13); textStyle(NORMAL); fill(40, 60, 80); noStroke(); textAlign(LEFT, TOP);
  text("Your first two guests are training guests. For each one, click the 5 booth", tx, ty); ty += lineH;
  text("controls in any order you like — this sequence becomes your personal ritual", tx, ty); ty += lineH;
  text("for that badge type. There is no wrong answer during training!", tx, ty); ty += lineH + 14;

  // SERVING LATER GUESTS
  ty = drawSectionHeader("SERVING LATER GUESTS", tx, ty);
  textFont("sans-serif"); textSize(13); textStyle(NORMAL); fill(40, 60, 80); noStroke(); textAlign(LEFT, TOP);
  text("From Guest #3 onward, cars show a square badge, triangle badge, or no badge.", tx, ty); ty += lineH;
  text("Recreate the matching ritual — same controls, same order — then open the gate.", tx, ty); ty += lineH;
  text("Guests with no badge are free-choice: click anything you like for them.", tx, ty); ty += lineH + 14;

  // WEATHER WARNING
  ty = drawSectionHeader("WATCH THE WEATHER", tx, ty);
  textFont("sans-serif"); textSize(13); textStyle(NORMAL); fill(40, 60, 80); noStroke(); textAlign(LEFT, TOP);
  text("Every wrong submission worsens the weather and fogs up your control panel.", tx, ty); ty += lineH;
  text("Four mistakes ends your shift. Get it right to clear the skies again!", tx, ty);

  // ── Badge legend (right column) ──
  let legX = panX + panW - 210;
  let legY = panY + 85;

  fill(13, 67, 102, 190); noStroke();
  rect(legX - 10, legY - 10, 178, 158, 8);

  fill(255); textAlign(CENTER, TOP); textSize(11);
  text("BADGE LEGEND", legX + 79, legY - 2);
  legY += 24;

  // Square badge
  fill(40, 120, 220); stroke(255); strokeWeight(1.2);
  rect(legX + 6, legY, 24, 24, 3);
  fill(255); noStroke(); textAlign(LEFT, TOP); textSize(12);
  text("Square  →  Ritual 1", legX + 38, legY + 5);
  legY += 40;

  // Triangle badge
  let th = 24 * 0.866;
  fill(220, 60, 60); stroke(255); strokeWeight(1.2);
  triangle(legX + 18, legY, legX + 6, legY + th, legX + 30, legY + th);
  fill(255); noStroke(); textAlign(LEFT, TOP); textSize(12);
  text("Triangle →  Ritual 2", legX + 38, legY + 5);
  legY += 40;

  // No badge
  stroke(180, 180, 180); strokeWeight(2.5);
  line(legX + 6, legY + 12, legX + 30, legY + 12);
  fill(255); noStroke(); textAlign(LEFT, TOP); textSize(12);
  text("No badge → Free choice", legX + 38, legY + 5);

  // ── Close button ──
  let cbW = 180, cbH = 48;
  let cbX = width / 2 - cbW / 2;
  let cbY = panY + panH - cbH - 24;

  let chov =
    mouseX >= cbX && mouseX <= cbX + cbW &&
    mouseY >= cbY && mouseY <= cbY + cbH;

  fill(chov ? color(247, 247, 205) : color(255));
  stroke(13, 67, 102); strokeWeight(1.5);
  rect(cbX, cbY, cbW, cbH, 8);

  fill(13, 67, 102); noStroke();
  textAlign(CENTER, CENTER); textSize(16);
  text("✕  Back to Menu", cbX + cbW / 2, cbY + cbH / 2);
}

// Helper — draws a section header with guaranteed consistent style, returns updated ty
function drawSectionHeader(label, x, ty) {
  textFont("sans-serif");
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  fill(13, 67, 102);
  noStroke();
  text(label, x, ty);
  // Measure underline width while textSize/style are still set correctly
  drawPanelUnderline(x, ty + 17, textWidth(label));
  return ty + 27;
}

// Helper — draws a subtle underline beneath section headings
function drawPanelUnderline(x, y, w) {
  stroke(13, 67, 102, 110); strokeWeight(1);
  line(x, y, x + w, y);
}

// ── Click handling ─────────────────────────────────────────────────
function handleStartClick() {
  // Instructions panel is open — only handle its close button
  if (showInstructions) {
    let panW = 860, panH = 660;
    let panX = width / 2 - panW / 2;
    let panY = height / 2 - panH / 2;
    let cbW = 180, cbH = 48;
    let cbX = width / 2 - cbW / 2;
    let cbY = panY + panH - cbH - 24;

    if (
      mouseX >= cbX && mouseX <= cbX + cbW &&
      mouseY >= cbY && mouseY <= cbY + cbH
    ) {
      showInstructions = false;
    }
    return;
  }

  let bw = 220, bh = 56;

  // Begin Shift
  let beginCY = height / 2;
  let bx1 = width / 2 - bw / 2, by1 = beginCY - bh / 2;
  if (mouseX >= bx1 && mouseX <= bx1 + bw && mouseY >= by1 && mouseY <= by1 + bh) {
    gameState = "play";
    return;
  }

  // How to Play
  let howCY = height / 2 + 74;
  let bx2 = width / 2 - bw / 2, by2 = howCY - bh / 2;
  if (mouseX >= bx2 && mouseX <= bx2 + bw && mouseY >= by2 && mouseY <= by2 + bh) {
    showInstructions = true;
  }
}
