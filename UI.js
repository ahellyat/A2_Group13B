let roadY = 430;
let roadH = 90;

function drawRoad() {
  push();
  fill(55, 58, 62); noStroke();
  rect(0, roadY, width, roadH);
  fill(80, 140, 70);
  rect(0, roadY + roadH, width, height - roadY - roadH);
  rect(0, roadY - 12, width, 12);
  fill(220, 200, 60);
  rect(0, roadY, width, 5);
  rect(0, roadY + roadH - 5, width, 5);
  stroke(255, 255, 255, 200); strokeWeight(3);
  let lY = roadY + roadH / 2;
  for (let x = 0; x < width; x += 70) line(x, lY, x + 40, lY);
  pop();
}

function drawMessage() {
  let message = "";
  let yPos = height / 8;

  if (triedToOpenGateWithoutSubmission) {
    message = "I can't let anyone in yet! I didn't do the steps I need to do.";
  } else if (submissions.length < 1) {
    message = "It's my first day. I'm going to choose the order of how I want to do things.";
  } else if (submissions.length === 1) {
    message = "That felt like the right routine to handle guests with square licenses. How about the triangle ones?\nLet me decide a new order.";
  } else if (submissions.length > 1 && wrongCount === 0) {
    message = "Looks like there's a couple more guests waiting to get in. Let me do the right routine for each of them.";
  } else if (submissions.length > 1 && wrongCount > 0 && !isMatch) {
    message = "Oh no. That felt wrong. I have to make sure I'm serving them properly.\nLet me try doing the right shape routine again";
  } else if (submissions.length > 1 && wrongCount > 0 && isMatch) {
    message = "Phew! I'm setting things right. Now my guests will be happy again!\nLet's keep going.";
  }

  if (message === "") return;

  push();
  textAlign(CENTER, CENTER); textSize(16);
  let padding = 10, maxWidth = width * 0.7;
  let textBoxHeight = textLeading() * message.split("\n").length + 20;
  rectMode(CENTER); noStroke();
  fill(247, 247, 205);
  rect(width / 2, yPos, maxWidth, textBoxHeight + padding, 25);
  noStroke(); fill(13, 67, 102);
  text(message, width / 2, yPos, maxWidth - 40);
  pop();
}

function submitButton() {
  let submitSize = 100, submitHeight = submitSize + 200;
  let submitX = width - submitSize - 10;
  let submitY = height / 2 - submitHeight / 2;
  let hovered = mouseX >= submitX && mouseX <= submitX + submitSize &&
                mouseY >= submitY && mouseY <= submitY + submitHeight;
  let pressed = hovered && mouseIsPressed;

  if (pressed)      fill(100);
  else if (hovered) fill(247, 247, 205);
  else              fill(255);

  stroke(13, 67, 102); strokeWeight(1);
  rect(submitX, submitY, submitSize, submitSize + 200);
  textAlign(CENTER, CENTER); textSize(16);
  fill(13, 67, 102); noStroke();
  text("Open \nParking \nLot Gate\n", submitX + submitSize / 2, submitY + (submitSize + 200) / 2);
}

function displayShapes()               { /* shapes on cars only */ }
function displaySubmissionIndicators() { /* guest log removed   */ }

// ─────────────────────────────────────────────
// Animal sprites (drawn on car roof)
// ─────────────────────────────────────────────

function drawDog(cx, cy) {
  push();
  fill(210, 170, 110); stroke(80, 50, 20); strokeWeight(1.5);
  ellipse(cx, cy, 44, 30);
  fill(230, 190, 130);
  ellipse(cx + 22, cy - 6, 28, 26);
  fill(245, 215, 170);
  ellipse(cx + 30, cy - 2, 14, 10);
  fill(60, 30, 10); noStroke();
  ellipse(cx + 36, cy - 2, 6, 5);
  fill(30); ellipse(cx + 24, cy - 12, 5, 5);
  fill(255); ellipse(cx + 25, cy - 13, 2, 2);
  fill(180, 130, 70); stroke(80, 50, 20); strokeWeight(1.5);
  ellipse(cx + 16, cy - 2, 10, 18);
  noFill(); stroke(180, 130, 70); strokeWeight(3);
  arc(cx - 22, cy - 8, 22, 22, -PI / 2, PI / 4);
  stroke(180, 130, 70); strokeWeight(4);
  line(cx - 10, cy + 12, cx - 12, cy + 22);
  line(cx,      cy + 14, cx,      cy + 24);
  line(cx + 10, cy + 12, cx + 12, cy + 22);
  line(cx + 18, cy + 10, cx + 20, cy + 20);
  pop();
}

function drawCat(cx, cy) {
  push();
  fill(150, 150, 160); stroke(60, 60, 80); strokeWeight(1.5);
  ellipse(cx, cy, 40, 28);
  fill(170, 170, 185);
  ellipse(cx + 20, cy - 8, 26, 24);
  fill(170, 170, 185); stroke(60, 60, 80);
  triangle(cx + 12, cy - 18, cx + 17, cy - 30, cx + 22, cy - 18);
  triangle(cx + 24, cy - 18, cx + 29, cy - 30, cx + 34, cy - 18);
  fill(220, 160, 160); noStroke();
  triangle(cx + 14, cy - 19, cx + 17, cy - 27, cx + 21, cy - 19);
  triangle(cx + 25, cy - 19, cx + 29, cy - 27, cx + 33, cy - 19);
  fill(240, 220, 220); stroke(60, 60, 80); strokeWeight(1);
  ellipse(cx + 28, cy - 5, 12, 8);
  fill(230, 100, 130); noStroke();
  triangle(cx + 27, cy - 7, cx + 31, cy - 7, cx + 29, cy - 4);
  fill(60, 180, 60); stroke(0); strokeWeight(1);
  ellipse(cx + 22, cy - 12, 6, 6);
  fill(0); noStroke(); ellipse(cx + 22, cy - 12, 3, 5);
  stroke(200, 200, 210); strokeWeight(1);
  line(cx + 22, cy - 5, cx + 10, cy - 3);
  line(cx + 22, cy - 4, cx + 10, cy - 6);
  line(cx + 34, cy - 5, cx + 46, cy - 3);
  line(cx + 34, cy - 4, cx + 46, cy - 6);
  noFill(); stroke(140, 140, 155); strokeWeight(3);
  arc(cx - 20, cy - 5, 24, 24, PI * 0.8, PI * 1.8);
  stroke(140, 140, 155); strokeWeight(4);
  line(cx - 8, cy + 12, cx - 10, cy + 22);
  line(cx + 2, cy + 13, cx + 2,  cy + 23);
  line(cx + 12, cy + 12, cx + 14, cy + 22);
  line(cx + 20, cy + 10, cx + 22, cy + 20);
  pop();
}

function drawBear(cx, cy) {
  push();
  fill(130, 90, 50); stroke(60, 35, 10); strokeWeight(1.5);
  ellipse(cx, cy, 50, 36);
  fill(145, 100, 58);
  ellipse(cx + 22, cy - 8, 34, 30);
  fill(130, 90, 50); stroke(60, 35, 10);
  ellipse(cx + 14, cy - 22, 14, 14);
  ellipse(cx + 28, cy - 22, 14, 14);
  fill(200, 140, 100); noStroke();
  ellipse(cx + 14, cy - 22, 7, 7);
  ellipse(cx + 28, cy - 22, 7, 7);
  fill(200, 160, 110); stroke(60, 35, 10); strokeWeight(1);
  ellipse(cx + 32, cy - 4, 16, 12);
  fill(40, 20, 5); noStroke();
  ellipse(cx + 32, cy - 8, 7, 5);
  fill(30); ellipse(cx + 24, cy - 12, 5, 5);
  fill(255); ellipse(cx + 25, cy - 13, 2, 2);
  stroke(110, 75, 40); strokeWeight(5);
  line(cx - 12, cy + 16, cx - 14, cy + 26);
  line(cx,      cy + 18, cx,      cy + 28);
  line(cx + 12, cy + 16, cx + 14, cy + 26);
  line(cx + 22, cy + 12, cx + 24, cy + 22);
  pop();
}

function drawFox(cx, cy) {
  push();
  fill(210, 110, 40); stroke(120, 55, 10); strokeWeight(1.5);
  ellipse(cx, cy, 44, 30);
  fill(240, 210, 180); noStroke();
  ellipse(cx + 4, cy + 2, 20, 14);
  fill(220, 120, 45); stroke(120, 55, 10); strokeWeight(1.5);
  ellipse(cx + 22, cy - 8, 28, 24);
  fill(220, 120, 45);
  triangle(cx + 13, cy - 18, cx + 17, cy - 32, cx + 23, cy - 18);
  triangle(cx + 25, cy - 18, cx + 30, cy - 32, cx + 34, cy - 18);
  fill(230, 80, 80); noStroke();
  triangle(cx + 15, cy - 19, cx + 17, cy - 28, cx + 22, cy - 19);
  triangle(cx + 26, cy - 19, cx + 30, cy - 28, cx + 33, cy - 19);
  fill(245, 235, 215); stroke(120, 55, 10); strokeWeight(1);
  ellipse(cx + 30, cy - 4, 14, 12);
  fill(40, 20, 10); noStroke();
  ellipse(cx + 36, cy - 4, 5, 4);
  fill(50, 30, 0);
  ellipse(cx + 24, cy - 12, 5, 5);
  fill(255); ellipse(cx + 25, cy - 13, 2, 2);
  noFill(); stroke(210, 110, 40); strokeWeight(5);
  arc(cx - 22, cy - 6, 28, 28, -PI / 2, PI / 3);
  stroke(245, 235, 215); strokeWeight(3);
  arc(cx - 24, cy - 4, 20, 20, -PI / 3, PI / 4);
  stroke(180, 90, 30); strokeWeight(4);
  line(cx - 10, cy + 13, cx - 12, cy + 23);
  line(cx,      cy + 14, cx,      cy + 24);
  line(cx + 10, cy + 13, cx + 12, cy + 23);
  line(cx + 18, cy + 11, cx + 20, cy + 21);
  pop();
}

function drawRabbit(cx, cy) {
  push();
  fill(235, 225, 215); stroke(160, 140, 120); strokeWeight(1.5);
  ellipse(cx, cy, 40, 32);
  fill(240, 232, 224);
  ellipse(cx + 20, cy - 10, 28, 26);
  fill(235, 225, 215); stroke(160, 140, 120);
  ellipse(cx + 14, cy - 32, 10, 28);
  ellipse(cx + 24, cy - 32, 10, 28);
  fill(230, 170, 170); noStroke();
  ellipse(cx + 14, cy - 32, 5, 22);
  ellipse(cx + 24, cy - 32, 5, 22);
  fill(230, 130, 150); noStroke();
  ellipse(cx + 28, cy - 8, 6, 5);
  fill(80, 30, 100);
  ellipse(cx + 22, cy - 14, 5, 5);
  fill(255); ellipse(cx + 23, cy - 15, 2, 2);
  stroke(200, 195, 190); strokeWeight(1);
  line(cx + 22, cy - 8, cx + 12, cy - 6);
  line(cx + 22, cy - 7, cx + 12, cy - 9);
  line(cx + 32, cy - 8, cx + 42, cy - 6);
  line(cx + 32, cy - 7, cx + 42, cy - 9);
  fill(255); stroke(160, 140, 120); strokeWeight(1);
  ellipse(cx - 20, cy - 2, 14, 14);
  stroke(200, 185, 170); strokeWeight(4);
  line(cx - 8, cy + 14, cx - 10, cy + 24);
  line(cx + 2, cy + 15, cx + 2,  cy + 25);
  line(cx + 10, cy + 14, cx + 12, cy + 24);
  line(cx + 18, cy + 12, cx + 20, cy + 22);
  pop();
}

let animalList = ["dog", "cat", "bear", "fox", "rabbit", "dog", "cat", "bear"];

function drawAnimalOnCar(animalName, carX, carTopY) {
  let cx = carX - 28;
  let cy = carTopY - 18;
  if      (animalName === "dog")    drawDog(cx, cy);
  else if (animalName === "cat")    drawCat(cx, cy);
  else if (animalName === "bear")   drawBear(cx, cy);
  else if (animalName === "fox")    drawFox(cx, cy);
  else if (animalName === "rabbit") drawRabbit(cx, cy);
}

function drawCar(carX, carColor, shape, animalName, guestLabel) {
  // ── Dimensions ──
  let bodyW    = 260;
  let bodyH    = 58;
  let cabinW   = 155;
  let cabinH   = 55;

  let bBot     = roadY;
  let bTop     = bBot - bodyH;
  let bL       = carX - bodyW / 2;
  let bR       = carX + bodyW / 2;
  let cabL     = carX - cabinW / 2 - 10;  // cabin offset slightly rearward
  let cabR     = cabL + cabinW;
  let cabTop   = bTop - cabinH;

  // Wheel positions
  let wR  = 26;
  let wFX = bR - 52;
  let wBX = bL + 52;
  let wY  = bBot + 4;   // slightly embedded in road

  // Centre of body for badge
  let bodyCenterY = bTop + bodyH / 2;

  push();

  // ── Ground shadow ──
  noStroke(); fill(0, 0, 0, 30);
  ellipse(carX, bBot + 10, bodyW * 0.9, 14);

  // ── Rear bumper ──
  fill(lerpColor(carColor, color(20), 0.3));
  stroke(0); strokeWeight(1.2);
  rect(bL - 6, bBot - 18, 8, 14, 2);

  // ── Front bumper ──
  rect(bR - 2, bBot - 18, 8, 14, 2);

  // ── Body ──
  fill(carColor); stroke(0); strokeWeight(1.8);
  beginShape();
  vertex(bL + 6,  bBot);      // rear bottom
  vertex(bR - 6,  bBot);      // front bottom
  vertex(bR + 4,  bTop + 14); // front taper
  vertex(bR - 2,  bTop);      // front top
  vertex(bL + 2,  bTop);      // rear top
  vertex(bL - 4,  bTop + 14); // rear taper
  endShape(CLOSE);

  // ── Body sheen (top highlight strip) ──
  noStroke();
  fill(255, 255, 255, 30);
  beginShape();
  vertex(bL + 4,  bTop + 1);
  vertex(bR - 4,  bTop + 1);
  vertex(bR - 6,  bTop + 12);
  vertex(bL + 6,  bTop + 12);
  endShape(CLOSE);

  // ── Door seam ──
  stroke(0, 0, 0, 55); strokeWeight(1.2);
  line(carX, bTop + 4, carX, bBot - 2);

  // ── Door handles ──
  stroke(0, 0, 0, 100); strokeWeight(2);
  line(carX - 40, bTop + bodyH * 0.55, carX - 22, bTop + bodyH * 0.55);
  line(carX + 16, bTop + bodyH * 0.55, carX + 34, bTop + bodyH * 0.55);

  // ── Cabin shell ──
  let roofColor = lerpColor(carColor, color(10), 0.2);
  fill(roofColor); stroke(0); strokeWeight(1.8);
  beginShape();
  vertex(cabL,       bTop);         // A-pillar base (rear)
  vertex(cabL + 12,  cabTop + 8);   // A-pillar top
  vertex(cabR - 8,   cabTop);       // roof front corner
  vertex(cabR,       bTop);         // C-pillar base (front)
  endShape(CLOSE);

  // ── Windscreen glass ──
  fill(170, 215, 255, 175); stroke(0); strokeWeight(1);
  beginShape();
  vertex(cabR,       bTop);
  vertex(cabR - 10,  bTop);
  vertex(cabR - 18,  cabTop + 4);
  vertex(cabR - 8,   cabTop);
  endShape(CLOSE);

  // ── Rear glass ──
  fill(170, 215, 255, 175);
  beginShape();
  vertex(cabL,       bTop);
  vertex(cabL + 10,  bTop);
  vertex(cabL + 20,  cabTop + 10);
  vertex(cabL + 12,  cabTop + 8);
  endShape(CLOSE);

  // ── Side window dimensions ──
  let winX = cabL + 14;
  let winY = cabTop + 10;
  let winW = cabinW - 26;
  let winH = bTop - winY - 4;

  // ── Animal clipped inside window (drawn BEFORE glass so it sits behind it) ──
  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(winX + 2, winY + 2, winW - 4, winH - 4);
  drawingContext.clip();
  let anCX = winX + winW * 0.42;
  let anCY = winY + winH * 0.72;
  if      (animalName === "dog")    drawDog(anCX, anCY);
  else if (animalName === "cat")    drawCat(anCX, anCY);
  else if (animalName === "bear")   drawBear(anCX, anCY);
  else if (animalName === "fox")    drawFox(anCX, anCY);
  else if (animalName === "rabbit") drawRabbit(anCX, anCY);
  drawingContext.restore();
  pop();

  // ── Side window glass (on top of animal, giving behind-glass effect) ──
  fill(170, 215, 255, 130); stroke(0); strokeWeight(1);
  rect(winX, winY, winW, winH, 4);
  // Glass glint
  noStroke(); fill(255, 255, 255, 60);
  rect(winX + 4, winY + 3, winW * 0.25, winH - 6, 2);

  // ── B-pillar ──
  stroke(lerpColor(carColor, color(10), 0.3)); strokeWeight(4);
  line(carX - 8, bTop, carX - 8, winY + 3);

  // ── Headlights (front = right) ──
  // Housing
  fill(lerpColor(carColor, color(30), 0.35));
  stroke(0); strokeWeight(1);
  rect(bR - 2, bTop + 10, 8, 22, 2);
  // Main lens
  fill(255, 255, 190); noStroke();
  rect(bR - 1, bTop + 12, 5, 9, 1);
  // DRL
  fill(255, 235, 140);
  rect(bR - 1, bTop + 23, 5, 4, 1);
  // Glint
  fill(255, 255, 255, 210);
  ellipse(bR + 1, bTop + 15, 3, 2);

  // ── Tail lights (rear = left) ──
  fill(lerpColor(carColor, color(30), 0.35));
  stroke(0); strokeWeight(1);
  rect(bL - 6, bTop + 10, 8, 22, 2);
  fill(190, 20, 20); noStroke();
  rect(bL - 5, bTop + 12, 5, 9, 1);
  fill(200, 130, 0);
  rect(bL - 5, bTop + 23, 5, 4, 1);

  // ── Wheels ──
  for (let wx of [wFX, wBX]) {
    // Tyre
    fill(22, 22, 22); stroke(0); strokeWeight(1.5);
    ellipse(wx, wY, wR * 2, wR * 2);
    // Tyre inner
    fill(38, 38, 38); noStroke();
    ellipse(wx, wY, wR * 1.65, wR * 1.65);
    // Alloy rim
    fill(205, 210, 220); stroke(120); strokeWeight(0.8);
    ellipse(wx, wY, wR * 1.2, wR * 1.2);
    // Rim inner ring (clean, no spokes)
    stroke(170, 175, 185); strokeWeight(1);
    noFill();
    ellipse(wx, wY, wR * 0.7, wR * 0.7);
    // Centre cap
    fill(225, 228, 235); noStroke();
    ellipse(wx, wY, wR * 0.28, wR * 0.28);
  }

  // ── Wheel arch shadows ──
  fill(40, 42, 46); noStroke();
  arc(wFX, bBot + 2, wR * 2 + 12, wR * 2 + 12, PI * 0.85, PI * 1.0);
  arc(wBX, bBot + 2, wR * 2 + 12, wR * 2 + 12, PI * 0.85, PI * 1.0);

  // ── Shape badge — hidden when shape is "none" ──
  if (shape !== "none") {
    let size = 44;
    fill(255); stroke(0); strokeWeight(2);
    if (shape === "square") {
      rect(carX - size / 2, bodyCenterY - size / 2, size, size, 3);
    } else {
      let h = size * 0.866;
      triangle(carX,          bodyCenterY - h / 2,
               carX - size/2, bodyCenterY + h / 2,
               carX + size/2, bodyCenterY + h / 2);
    }
  }

  pop();
}


// ─────────────────────────────────────────────
// Ticket booth (drawn to the right of centre)
// ─────────────────────────────────────────────
function drawTicketBooth(gateAngle) {
  let bX    = width * 0.72;   // booth centre X — right of car
  let bFloor = roadY;          // sits on road surface

  // Booth proportions
  let bW    = 90;
  let bH    = 130;
  let bTop  = bFloor - bH;
  let bL    = bX - bW / 2;
  let bR    = bX + bW / 2;

  // Roof overhang
  let roofW = bW + 28;
  let roofH = 18;
  let roofL = bX - roofW / 2;

  push();

  // ── Shadow ──
  noStroke(); fill(0, 0, 0, 25);
  ellipse(bX, bFloor + 6, bW * 1.1, 12);

  // ── Booth body ──
  fill(245, 245, 235); stroke(60, 60, 60); strokeWeight(1.5);
  rect(bL, bTop, bW, bH, 3, 3, 0, 0);

  // ── Vertical panel lines ──
  stroke(200, 200, 190); strokeWeight(1);
  line(bL + bW * 0.33, bTop + 2, bL + bW * 0.33, bFloor);
  line(bL + bW * 0.66, bTop + 2, bL + bW * 0.66, bFloor);

  // ── Service window (upper portion) ──
  let wW  = bW - 24;
  let wH  = 46;
  let wX  = bL + 12;
  let wY  = bTop + 14;
  // Frame
  fill(80, 60, 40); stroke(40, 30, 20); strokeWeight(1.5);
  rect(wX - 3, wY - 3, wW + 6, wH + 6, 3);
  // Glass
  fill(190, 220, 245, 210); noStroke();
  rect(wX, wY, wW, wH, 2);
  // Horizontal sliding divide
  stroke(140, 170, 200); strokeWeight(1);
  line(wX + 2, wY + wH * 0.48, wX + wW - 2, wY + wH * 0.48);
  // Vertical divide
  line(wX + wW * 0.5, wY + 2, wX + wW * 0.5, wY + wH - 2);
  // Glass glint
  noStroke(); fill(255, 255, 255, 70);
  rect(wX + 3, wY + 3, wW * 0.3, wH * 0.38, 2);

  // ── Shelf / counter ledge under window ──
  fill(160, 130, 90); stroke(80, 60, 40); strokeWeight(1.2);
  rect(bL - 4, wY + wH + 3, bW + 8, 10, 2);
  // Ledge edge highlight
  noStroke(); fill(200, 170, 120, 120);
  rect(bL - 3, wY + wH + 3, bW + 6, 4, 1);

  // ── Lower door ──
  fill(200, 195, 185); stroke(100, 95, 85); strokeWeight(1.2);
  rect(bL + bW * 0.25, wY + wH + 18, bW * 0.5, bH - (wH + 28), 2, 2, 0, 0);
  // Door panel details
  stroke(150, 145, 135); strokeWeight(1);
  let dX = bL + bW * 0.25, dY = wY + wH + 18, dW = bW * 0.5, dH2 = bH - (wH + 28);
  rect(dX + 5, dY + 5, dW - 10, dH2 * 0.45, 1);
  rect(dX + 5, dY + dH2 * 0.5, dW - 10, dH2 * 0.45, 1);
  // Door handle
  stroke(120, 100, 70); strokeWeight(2);
  line(bL + bW * 0.44, wY + wH + 18 + dH2 * 0.47,
       bL + bW * 0.44, wY + wH + 18 + dH2 * 0.53);

  // ── Striped roof ──
  let stripeColors = [color(220, 50, 50), color(245, 245, 235)];
  let stripeW = roofW / 7;
  // Clip stripes to roof rect shape first
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(roofL, bTop - roofH, roofW, roofH);
  drawingContext.clip();
  noStroke();
  for (let i = 0; i < 7; i++) {
    fill(stripeColors[i % 2]);
    rect(roofL + i * stripeW, bTop - roofH, stripeW + 1, roofH);
  }
  drawingContext.restore();
  // Roof outline
  stroke(60, 60, 60); strokeWeight(1.5); noFill();
  rect(roofL, bTop - roofH, roofW, roofH, 2, 2, 0, 0);

  // ── Small sign above window ──
  fill(220, 50, 50); stroke(140, 20, 20); strokeWeight(1);
  rect(bL + 10, bTop + 3, bW - 20, 10, 2);
  noStroke(); fill(255);
  textAlign(CENTER, CENTER); textSize(7);
  text("PARKING", bX, bTop + 8);

  // ── Barrier arm (animated gate) ──
  let armBaseX  = bR + 2;
  let armBaseY  = bFloor - 38;
  let armLen    = 110;
  let pivotX    = armBaseX + 9;   // centre of pivot post
  let pivotY    = armBaseY - 8;   // hinge point

  // Pivot post
  fill(180, 180, 190); stroke(80, 80, 90); strokeWeight(1.2);
  rect(armBaseX, armBaseY - 12, 18, 52, 3);
  // Post highlight
  noStroke(); fill(255, 255, 255, 40);
  rect(armBaseX + 2, armBaseY - 10, 5, 48, 2);

  // Counterweight (opposite side of pivot, moves opposite to arm)
  push();
  translate(pivotX, pivotY);
  rotate(gateAngle + PI);   // counterweight swings opposite
  fill(100, 100, 110); stroke(60, 60, 70); strokeWeight(1);
  rect(2, -5, 22, 10, 3);
  pop();

  // Arm — rotates around pivot
  push();
  translate(pivotX, pivotY);
  rotate(gateAngle);   // 0 = horizontal, -HALF_PI = vertical (raised)

  // Clip stripes to arm shape
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, -8, armLen, 10);
  drawingContext.clip();
  let barStripeW = 16;
  for (let i = 0; i * barStripeW < armLen + barStripeW; i++) {
    fill(i % 2 === 0 ? color(220, 50, 50) : color(245, 245, 235));
    noStroke();
    rect(i * barStripeW, -8, barStripeW, 10);
  }
  drawingContext.restore();
  // Arm outline
  stroke(80, 80, 90); strokeWeight(1); noFill();
  rect(0, -8, armLen, 10, 2);
  // Tip reflector
  fill(255, 220, 0); noStroke();
  ellipse(armLen - 4, -3, 8, 8);

  pop();

  pop();
}


// ─────────────────────────────────────────────
// Past customers shape history bar at top
// ─────────────────────────────────────────────
function drawPastCustomers() {
  // Only show after at least one submission
  if (submissions.length === 0) return;

  let sz      = 22;       // shape size
  let pad     = 12;       // gap between shapes
  let barY    = 28;       // vertical centre of the bar
  let startX  = width / 2 - ((submissions.length * (sz + pad)) / 2);

  // Legend colours — match the storyboard colour coding
  let col1 = color(40, 120, 220);   // ritual 1 = blue (square)
  let col2 = color(220, 60, 60);    // ritual 2 = red (triangle)
  let colN = color(180, 180, 180);  // neutral / upcoming

  push();
  // Subtle label
  noStroke(); fill(13, 67, 102, 160);
  textAlign(RIGHT, CENTER); textSize(11);
  text("past customers", startX - 10, barY);

  // Legend key (top-right)
  let lx = width - 160, ly = 12;
  textAlign(LEFT, TOP); textSize(10);
  fill(col1); rect(lx, ly,      10, 10, 2);
  fill(60); text("— ritual 1", lx + 14, ly);
  fill(col2); rect(lx, ly + 16, 10, 10, 2);
  fill(60); text("— ritual 2", lx + 14, ly + 16);
  stroke(140); strokeWeight(1.5); line(lx, ly + 38, lx + 10, ly + 38);
  noStroke(); fill(60); text("— anything", lx + 14, ly + 32);

  // Draw one shape per completed submission
  for (let i = 0; i < submissions.length; i++) {
    let x = startX + i * (sz + pad) + sz / 2;

    // Determine shape and colour for this submission
    let shapeType, col;
    if (i === 0) {
      shapeType = "square";   col = col1;
    } else if (i === 1) {
      shapeType = "triangle"; col = col2;
    } else {
      shapeType = shapeArray[i - 2];
      col = shapeType === "square" ? col1 : shapeType === "triangle" ? col2 : colN;
    }

    // Small drop shadow (skip for "none")
    if (shapeType !== "none") {
      noStroke(); fill(0, 0, 0, 30);
      if (shapeType === "square") {
        rect(x - sz/2 + 2, barY - sz/2 + 2, sz, sz, 3);
      } else {
        let h = sz * 0.866;
        triangle(x + 2, barY - h/2 + 2, x - sz/2 + 2, barY + h/2 + 2, x + sz/2 + 2, barY + h/2 + 2);
      }
    }

    // Shape — dash for "none"
    fill(col); stroke(0); strokeWeight(1.2);
    if (shapeType === "square") {
      rect(x - sz/2, barY - sz/2, sz, sz, 3);
    } else if (shapeType === "triangle") {
      let h = sz * 0.866;
      triangle(x, barY - h/2, x - sz/2, barY + h/2, x + sz/2, barY + h/2);
    } else {
      // "none" — draw a neutral dash
      stroke(colN); strokeWeight(2.5); noFill();
      line(x - sz/2, barY, x + sz/2, barY);
    }
  }

  pop();
}

function displayCurrentGuest(carAnimX, shape, carColor, animalName, guestLabel) {
  if (submissions.length >= 8) return;
  drawCar(carAnimX, carColor, shape, animalName, guestLabel);
}

function displayCompletion() {
  if (submissions.length >= 8) {
    let sz = 400;
    fill(255); stroke(13, 67, 102); strokeWeight(1);
    rect(width / 2 - sz / 2, height / 2 - sz / 2, sz, sz);
    fill(13, 67, 102); noStroke();
    textAlign(CENTER, CENTER); textSize(48);
    text("Complete", width / 2, height / 2);
  }
}
