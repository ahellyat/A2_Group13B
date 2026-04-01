let roadY = 430;
let roadH = 90;

function drawRoad() {
  push();
  fill(55, 58, 62);
  noStroke();
  rect(0, roadY, width, roadH);
  fill(80, 140, 70);
  rect(0, roadY + roadH, width, height - roadY - roadH);
  rect(0, roadY - 12, width, 12);
  fill(220, 200, 60);
  rect(0, roadY, width, 5);
  rect(0, roadY + roadH - 5, width, 5);
  stroke(255, 255, 255, 200);
  strokeWeight(3);
  let lY = roadY + roadH / 2;
  for (let x = 0; x < width; x += 70) line(x, lY, x + 40, lY);
  pop();
}

// ─────────────────────────────────────────────────────────────────────────────
// drawMessage — first-person attendant narration bubble
//
// Priority order (highest first):
//  1. Car not yet stopped — nothing to say
//  2. Timer expired — overlay handles it; keep quiet
//  3. Tried to open gate with no actions selected
//  4. Tried to submit a duplicate ritual on a free-choice guest
//  5. Training guest 1 (square) — explain the ritual concept
//  6. Training guest 2 (triangle) — ask for a different order
//  7. Actions in progress — tell player how many they've chosen so far
//  8. No actions yet on a post-training guest — tell player what to do
// ─────────────────────────────────────────────────────────────────────────────
function drawMessage() {
  if (typeof carState !== "undefined" && carState !== "waiting") return;

  let message = "";
  let isTraining = submissions.length < TRAINING_GUESTS;

  // ── 3. Gate pressed with empty sequence ──────────────────────────
  if (triedToOpenGateWithoutSubmission) {
    message =
      "I can't open the gate yet — I haven't done anything!\nI need to perform all 5 actions first.";

    // ── 4. Duplicate ritual on free-choice guest ─────────────────────
  } else if (
    typeof triedToSubmitDuplicatePattern !== "undefined" &&
    triedToSubmitDuplicatePattern
  ) {
    message =
      "That order is already one of my rituals.\nFree guests need a fresh sequence — I'll try a different one.";

    // ── 5. Training guest 1 (square badge) ───────────────────────────
  } else if (submissions.length === 0) {
    if (clickHistory.length === 0) {
      message =
        "My first guest! I can process them however I like.\nThe order I choose will become my Square Ritual — so I'll make it memorable.";
    } else {
      message =
        "Good start. I've selected " +
        clickHistory.length +
        " of 5 actions.\nFinish the sequence, then open the gate.";
    }

    // ── 6. Training guest 2 (triangle badge) ─────────────────────────
  } else if (submissions.length === 1) {
    if (clickHistory.length === 0) {
      message =
        "Second guest — triangle badge. I need to choose a completely different order from my Square Ritual.\nThis sequence will become my Triangle Ritual.";
    } else {
      let dupWarning = _sequenceMatchesRitual1()
        ? "  ⚠ This matches my Square Ritual — I must change it!"
        : "";
      message =
        clickHistory.length +
        " of 5 actions chosen." +
        dupWarning +
        "\nFinish up, then open the gate.";
    }

    // ── 7 & 8. Post-training guests ──────────────────────────────────
  } else {
    let guestShapeIndex = submissions.length - 2;
    let guestShape = shapeArray[guestShapeIndex % shapeArray.length];

    if (clickHistory.length === 0) {
      // ── No actions yet — what does this guest need? ────────────────
      if (wrongCount > 0 && typeof isMatch !== "undefined" && !isMatch) {
        // Last guest was wrong — remind and redirect
        if (guestShape === "square") {
          message =
            "I got the last one wrong and the weather is turning.\nSquare badge — I need to reproduce my Square Ritual exactly.";
        } else if (guestShape === "triangle") {
          message =
            "I got the last one wrong and the weather is turning.\nTriangle badge — I need to reproduce my Triangle Ritual exactly.";
        } else {
          message =
            "I got the last one wrong and the weather is turning.\nNo badge on this one — any order works, just not one of my rituals.";
        }
      } else if (wrongCount > 0 && typeof isMatch !== "undefined" && isMatch) {
        // Just corrected after a wrong streak
        if (guestShape === "square") {
          message =
            "Back on track! This guest has a square badge.\nTime to run through my Square Ritual again.";
        } else if (guestShape === "triangle") {
          message =
            "Back on track! Triangle badge.\nLet me recall my Triangle Ritual and do it in the right order.";
        } else {
          message = "Back on track! No badge — any original sequence will do.";
        }
      } else {
        // Clean state — straightforward prompt
        if (guestShape === "square") {
          message =
            "Square badge. I know this one — reproduce my Square Ritual in the exact same order.";
        } else if (guestShape === "triangle") {
          message =
            "Triangle badge. Run through my Triangle Ritual — same order as I set it.";
        } else {
          message =
            "No badge — free choice. I can pick any order, as long as it's not one of my two established rituals.";
        }
      }
    } else {
      // ── Actions in progress ────────────────────────────────────────
      let done = clickHistory.length;
      let remaining = 5 - done;
      if (guestShape === "square") {
        let onTrack = _sequenceOnTrackForRitual(submissions[0]);
        if (!onTrack && done > 0) {
          message =
            done +
            " of 5 — this doesn't match my Square Ritual so far. I should start over.";
        } else {
          message =
            done +
            " of 5 actions done. " +
            remaining +
            " left — keep going with my Square Ritual.";
        }
      } else if (guestShape === "triangle") {
        let onTrack = _sequenceOnTrackForRitual(submissions[1]);
        if (!onTrack && done > 0) {
          message =
            done +
            " of 5 — this doesn't match my Triangle Ritual so far. I should start over.";
        } else {
          message =
            done +
            " of 5 actions done. " +
            remaining +
            " left — keep going with my Triangle Ritual.";
        }
      } else {
        // Free choice — warn if accidentally matching a ritual
        let matchingRitual = _currentlyMatchingRitual();
        if (matchingRitual) {
          message =
            done +
            " of 5 — this is matching my " +
            matchingRitual +
            " Ritual!\nI need to go in a different order for free guests.";
        } else {
          message =
            done +
            " of 5 actions. " +
            remaining +
            " to go — any original order works.";
        }
      }
    }
  }

  if (message === "") return;

  push();
  textAlign(CENTER, CENTER);
  textSize(16);
  let padding = 10,
    maxWidth = width * 0.7;
  let lines = message.split("\n");
  let textBoxHeight = textLeading() * lines.length + 20;
  let yPos = height / 8;
  rectMode(CENTER);
  noStroke();
  fill(247, 247, 205);
  rect(width / 2, yPos, maxWidth, textBoxHeight + padding, 25);
  noStroke();
  fill(13, 67, 102);
  text(message, width / 2, yPos, maxWidth - 40);
  pop();
}

// ── Helpers for in-progress sequence matching ─────────────────────

// True if the current clickHistory is a prefix of the given ritual
function _sequenceOnTrackForRitual(ritual) {
  if (!ritual || ritual.length === 0) return true;
  for (let i = 0; i < clickHistory.length; i++) {
    if (clickHistory[i] !== ritual[i]) return false;
  }
  return true;
}

// Returns "Square" or "Triangle" if the in-progress clickHistory
// is a prefix of (or fully matches) that ritual; null otherwise.
function _currentlyMatchingRitual() {
  if (submissions.length < 2) return null;
  if (_sequenceOnTrackForRitual(submissions[0])) return "Square";
  if (_sequenceOnTrackForRitual(submissions[1])) return "Triangle";
  return null;
}

// True if current clickHistory matches ritual 1 exactly (used during training)
function _sequenceMatchesRitual1() {
  if (submissions.length < 1) return false;
  let r = submissions[0];
  if (r.length !== clickHistory.length) return false;
  return r.every((v, i) => v === clickHistory[i]);
}

function submitButton() {
  let bW = 100,
    bH = 300;
  let bX = width - bW - 10;
  let bY = height / 2 - bH / 2;

  let hovered =
    mouseX >= bX && mouseX <= bX + bW && mouseY >= bY && mouseY <= bY + bH;
  let pressed = hovered && mouseIsPressed;

  push();
  noStroke();
  fill(0, 0, 0, 35);
  rect(bX + 4, bY + 5, bW, bH, 10);

  if (pressed) fill(180, 200, 220);
  else if (hovered) fill(247, 247, 205);
  else fill(240, 248, 255);
  stroke(13, 67, 102);
  strokeWeight(1.8);
  rect(bX, bY, bW, bH, 10);

  noStroke();
  fill(hovered ? color(200, 165, 60) : color(13, 67, 102));
  rect(bX + 1, bY + 1, bW - 2, 7, 10, 10, 0, 0);

  fill(hovered ? color(200, 165, 60) : color(13, 67, 102));
  rect(bX + 1, bY + bH - 8, bW - 2, 7, 0, 0, 10, 10);

  fill(13, 67, 102);
  noStroke();
  textAlign(CENTER, CENTER);
  textFont("sans-serif");
  textStyle(BOLD);
  textSize(13);
  text("Open\nParking\nLot Gate", bX + bW / 2, bY + bH / 2);

  pop();
}

function displayShapes() {
  /* shapes on cars only */
}
function displaySubmissionIndicators() {
  /* guest log removed */
}

// ─────────────────────────────────────────────
// Animal sprites (drawn on car roof)
// ─────────────────────────────────────────────

function drawDog(cx, cy) {
  push();
  fill(210, 170, 110);
  stroke(80, 50, 20);
  strokeWeight(1.5);
  ellipse(cx, cy, 44, 30);
  fill(230, 190, 130);
  ellipse(cx + 22, cy - 6, 28, 26);
  fill(245, 215, 170);
  ellipse(cx + 30, cy - 2, 14, 10);
  fill(60, 30, 10);
  noStroke();
  ellipse(cx + 36, cy - 2, 6, 5);
  fill(30);
  ellipse(cx + 24, cy - 12, 5, 5);
  fill(255);
  ellipse(cx + 25, cy - 13, 2, 2);
  fill(180, 130, 70);
  stroke(80, 50, 20);
  strokeWeight(1.5);
  ellipse(cx + 16, cy - 2, 10, 18);
  noFill();
  stroke(180, 130, 70);
  strokeWeight(3);
  arc(cx - 22, cy - 8, 22, 22, -PI / 2, PI / 4);
  stroke(180, 130, 70);
  strokeWeight(4);
  line(cx - 10, cy + 12, cx - 12, cy + 22);
  line(cx, cy + 14, cx, cy + 24);
  line(cx + 10, cy + 12, cx + 12, cy + 22);
  line(cx + 18, cy + 10, cx + 20, cy + 20);
  pop();
}

function drawCat(cx, cy) {
  push();
  fill(150, 150, 160);
  stroke(60, 60, 80);
  strokeWeight(1.5);
  ellipse(cx, cy, 40, 28);
  fill(170, 170, 185);
  ellipse(cx + 20, cy - 8, 26, 24);
  fill(170, 170, 185);
  stroke(60, 60, 80);
  triangle(cx + 12, cy - 18, cx + 17, cy - 30, cx + 22, cy - 18);
  triangle(cx + 24, cy - 18, cx + 29, cy - 30, cx + 34, cy - 18);
  fill(220, 160, 160);
  noStroke();
  triangle(cx + 14, cy - 19, cx + 17, cy - 27, cx + 21, cy - 19);
  triangle(cx + 25, cy - 19, cx + 29, cy - 27, cx + 33, cy - 19);
  fill(240, 220, 220);
  stroke(60, 60, 80);
  strokeWeight(1);
  ellipse(cx + 28, cy - 5, 12, 8);
  fill(230, 100, 130);
  noStroke();
  triangle(cx + 27, cy - 7, cx + 31, cy - 7, cx + 29, cy - 4);
  fill(60, 180, 60);
  stroke(0);
  strokeWeight(1);
  ellipse(cx + 22, cy - 12, 6, 6);
  fill(0);
  noStroke();
  ellipse(cx + 22, cy - 12, 3, 5);
  stroke(200, 200, 210);
  strokeWeight(1);
  line(cx + 22, cy - 5, cx + 10, cy - 3);
  line(cx + 22, cy - 4, cx + 10, cy - 6);
  line(cx + 34, cy - 5, cx + 46, cy - 3);
  line(cx + 34, cy - 4, cx + 46, cy - 6);
  noFill();
  stroke(140, 140, 155);
  strokeWeight(3);
  arc(cx - 20, cy - 5, 24, 24, PI * 0.8, PI * 1.8);
  stroke(140, 140, 155);
  strokeWeight(4);
  line(cx - 8, cy + 12, cx - 10, cy + 22);
  line(cx + 2, cy + 13, cx + 2, cy + 23);
  line(cx + 12, cy + 12, cx + 14, cy + 22);
  line(cx + 20, cy + 10, cx + 22, cy + 20);
  pop();
}

function drawBear(cx, cy) {
  push();
  fill(130, 90, 50);
  stroke(60, 35, 10);
  strokeWeight(1.5);
  ellipse(cx, cy, 50, 36);
  fill(145, 100, 58);
  ellipse(cx + 22, cy - 8, 34, 30);
  fill(130, 90, 50);
  stroke(60, 35, 10);
  ellipse(cx + 14, cy - 22, 14, 14);
  ellipse(cx + 28, cy - 22, 14, 14);
  fill(200, 140, 100);
  noStroke();
  ellipse(cx + 14, cy - 22, 7, 7);
  ellipse(cx + 28, cy - 22, 7, 7);
  fill(200, 160, 110);
  stroke(60, 35, 10);
  strokeWeight(1);
  ellipse(cx + 32, cy - 4, 16, 12);
  fill(40, 20, 5);
  noStroke();
  ellipse(cx + 32, cy - 8, 7, 5);
  fill(30);
  ellipse(cx + 24, cy - 12, 5, 5);
  fill(255);
  ellipse(cx + 25, cy - 13, 2, 2);
  stroke(110, 75, 40);
  strokeWeight(5);
  line(cx - 12, cy + 16, cx - 14, cy + 26);
  line(cx, cy + 18, cx, cy + 28);
  line(cx + 12, cy + 16, cx + 14, cy + 26);
  line(cx + 22, cy + 12, cx + 24, cy + 22);
  pop();
}

function drawFox(cx, cy) {
  push();
  fill(210, 110, 40);
  stroke(120, 55, 10);
  strokeWeight(1.5);
  ellipse(cx, cy, 44, 30);
  fill(240, 210, 180);
  noStroke();
  ellipse(cx + 4, cy + 2, 20, 14);
  fill(220, 120, 45);
  stroke(120, 55, 10);
  strokeWeight(1.5);
  ellipse(cx + 22, cy - 8, 28, 24);
  fill(220, 120, 45);
  triangle(cx + 13, cy - 18, cx + 17, cy - 32, cx + 23, cy - 18);
  triangle(cx + 25, cy - 18, cx + 30, cy - 32, cx + 34, cy - 18);
  fill(230, 80, 80);
  noStroke();
  triangle(cx + 15, cy - 19, cx + 17, cy - 28, cx + 22, cy - 19);
  triangle(cx + 26, cy - 19, cx + 30, cy - 28, cx + 33, cy - 19);
  fill(245, 235, 215);
  stroke(120, 55, 10);
  strokeWeight(1);
  ellipse(cx + 30, cy - 4, 14, 12);
  fill(40, 20, 10);
  noStroke();
  ellipse(cx + 36, cy - 4, 5, 4);
  fill(50, 30, 0);
  ellipse(cx + 24, cy - 12, 5, 5);
  fill(255);
  ellipse(cx + 25, cy - 13, 2, 2);
  noFill();
  stroke(210, 110, 40);
  strokeWeight(5);
  arc(cx - 22, cy - 6, 28, 28, -PI / 2, PI / 3);
  stroke(245, 235, 215);
  strokeWeight(3);
  arc(cx - 24, cy - 4, 20, 20, -PI / 3, PI / 4);
  stroke(180, 90, 30);
  strokeWeight(4);
  line(cx - 10, cy + 13, cx - 12, cy + 23);
  line(cx, cy + 14, cx, cy + 24);
  line(cx + 10, cy + 13, cx + 12, cy + 23);
  line(cx + 18, cy + 11, cx + 20, cy + 21);
  pop();
}

function drawRabbit(cx, cy) {
  push();
  fill(235, 225, 215);
  stroke(160, 140, 120);
  strokeWeight(1.5);
  ellipse(cx, cy, 40, 32);
  fill(240, 232, 224);
  ellipse(cx + 20, cy - 10, 28, 26);
  fill(235, 225, 215);
  stroke(160, 140, 120);
  ellipse(cx + 14, cy - 32, 10, 28);
  ellipse(cx + 24, cy - 32, 10, 28);
  fill(230, 170, 170);
  noStroke();
  ellipse(cx + 14, cy - 32, 5, 22);
  ellipse(cx + 24, cy - 32, 5, 22);
  fill(230, 130, 150);
  noStroke();
  ellipse(cx + 28, cy - 8, 6, 5);
  fill(80, 30, 100);
  ellipse(cx + 22, cy - 14, 5, 5);
  fill(255);
  ellipse(cx + 23, cy - 15, 2, 2);
  stroke(200, 195, 190);
  strokeWeight(1);
  line(cx + 22, cy - 8, cx + 12, cy - 6);
  line(cx + 22, cy - 7, cx + 12, cy - 9);
  line(cx + 32, cy - 8, cx + 42, cy - 6);
  line(cx + 32, cy - 7, cx + 42, cy - 9);
  fill(255);
  stroke(160, 140, 120);
  strokeWeight(1);
  ellipse(cx - 20, cy - 2, 14, 14);
  stroke(200, 185, 170);
  strokeWeight(4);
  line(cx - 8, cy + 14, cx - 10, cy + 24);
  line(cx + 2, cy + 15, cx + 2, cy + 25);
  line(cx + 10, cy + 14, cx + 12, cy + 24);
  line(cx + 18, cy + 12, cx + 20, cy + 22);
  pop();
}

let animalList = ["dog", "cat", "bear", "fox", "rabbit", "dog", "cat", "bear"];

function drawAnimalOnCar(animalName, carX, carTopY) {
  let cx = carX - 28;
  let cy = carTopY - 18;
  if (animalName === "dog") drawDog(cx, cy);
  else if (animalName === "cat") drawCat(cx, cy);
  else if (animalName === "bear") drawBear(cx, cy);
  else if (animalName === "fox") drawFox(cx, cy);
  else if (animalName === "rabbit") drawRabbit(cx, cy);
}

function drawCar(carX, carColor, shape, animalName, guestLabel) {
  let bodyW = 260,
    bodyH = 58,
    cabinW = 155,
    cabinH = 55;
  let bBot = roadY,
    bTop = bBot - bodyH;
  let bL = carX - bodyW / 2,
    bR = carX + bodyW / 2;
  let cabL = carX - cabinW / 2 - 10;
  let cabR = cabL + cabinW;
  let cabTop = bTop - cabinH;
  let wR = 26,
    wFX = bR - 52,
    wBX = bL + 52,
    wY = bBot + 4;
  let bodyCenterY = bTop + bodyH / 2;

  push();
  noStroke();
  fill(0, 0, 0, 30);
  ellipse(carX, bBot + 10, bodyW * 0.9, 14);
  fill(lerpColor(carColor, color(20), 0.3));
  stroke(0);
  strokeWeight(1.2);
  rect(bL - 6, bBot - 18, 8, 14, 2);
  rect(bR - 2, bBot - 18, 8, 14, 2);
  fill(carColor);
  stroke(0);
  strokeWeight(1.8);
  beginShape();
  vertex(bL + 6, bBot);
  vertex(bR - 6, bBot);
  vertex(bR + 4, bTop + 14);
  vertex(bR - 2, bTop);
  vertex(bL + 2, bTop);
  vertex(bL - 4, bTop + 14);
  endShape(CLOSE);
  noStroke();
  fill(255, 255, 255, 30);
  beginShape();
  vertex(bL + 4, bTop + 1);
  vertex(bR - 4, bTop + 1);
  vertex(bR - 6, bTop + 12);
  vertex(bL + 6, bTop + 12);
  endShape(CLOSE);
  stroke(0, 0, 0, 55);
  strokeWeight(1.2);
  line(carX, bTop + 4, carX, bBot - 2);
  stroke(0, 0, 0, 100);
  strokeWeight(2);
  line(carX - 40, bTop + bodyH * 0.55, carX - 22, bTop + bodyH * 0.55);
  line(carX + 16, bTop + bodyH * 0.55, carX + 34, bTop + bodyH * 0.55);
  let roofColor = lerpColor(carColor, color(10), 0.2);
  fill(roofColor);
  stroke(0);
  strokeWeight(1.8);
  beginShape();
  vertex(cabL, bTop);
  vertex(cabL + 12, cabTop + 8);
  vertex(cabR - 8, cabTop);
  vertex(cabR, bTop);
  endShape(CLOSE);
  fill(170, 215, 255, 175);
  stroke(0);
  strokeWeight(1);
  beginShape();
  vertex(cabR, bTop);
  vertex(cabR - 10, bTop);
  vertex(cabR - 18, cabTop + 4);
  vertex(cabR - 8, cabTop);
  endShape(CLOSE);
  fill(170, 215, 255, 175);
  beginShape();
  vertex(cabL, bTop);
  vertex(cabL + 10, bTop);
  vertex(cabL + 20, cabTop + 10);
  vertex(cabL + 12, cabTop + 8);
  endShape(CLOSE);
  let winX = cabL + 14,
    winY = cabTop + 10,
    winW = cabinW - 26,
    winH = bTop - winY - 4;
  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(winX + 2, winY + 2, winW - 4, winH - 4);
  drawingContext.clip();
  let anCX = winX + winW * 0.42,
    anCY = winY + winH * 0.72;
  if (animalName === "dog") drawDog(anCX, anCY);
  else if (animalName === "cat") drawCat(anCX, anCY);
  else if (animalName === "bear") drawBear(anCX, anCY);
  else if (animalName === "fox") drawFox(anCX, anCY);
  else if (animalName === "rabbit") drawRabbit(anCX, anCY);
  drawingContext.restore();
  pop();
  fill(170, 215, 255, 130);
  stroke(0);
  strokeWeight(1);
  rect(winX, winY, winW, winH, 4);
  noStroke();
  fill(255, 255, 255, 60);
  rect(winX + 4, winY + 3, winW * 0.25, winH - 6, 2);
  stroke(lerpColor(carColor, color(10), 0.3));
  strokeWeight(4);
  line(carX - 8, bTop, carX - 8, winY + 3);
  fill(lerpColor(carColor, color(30), 0.35));
  stroke(0);
  strokeWeight(1);
  rect(bR - 2, bTop + 10, 8, 22, 2);
  fill(255, 255, 190);
  noStroke();
  rect(bR - 1, bTop + 12, 5, 9, 1);
  fill(255, 235, 140);
  rect(bR - 1, bTop + 23, 5, 4, 1);
  fill(255, 255, 255, 210);
  ellipse(bR + 1, bTop + 15, 3, 2);
  fill(lerpColor(carColor, color(30), 0.35));
  stroke(0);
  strokeWeight(1);
  rect(bL - 6, bTop + 10, 8, 22, 2);
  fill(190, 20, 20);
  noStroke();
  rect(bL - 5, bTop + 12, 5, 9, 1);
  fill(200, 130, 0);
  rect(bL - 5, bTop + 23, 5, 4, 1);
  for (let wx of [wFX, wBX]) {
    fill(22, 22, 22);
    stroke(0);
    strokeWeight(1.5);
    ellipse(wx, wY, wR * 2, wR * 2);
    fill(38, 38, 38);
    noStroke();
    ellipse(wx, wY, wR * 1.65, wR * 1.65);
    fill(205, 210, 220);
    stroke(120);
    strokeWeight(0.8);
    ellipse(wx, wY, wR * 1.2, wR * 1.2);
    stroke(170, 175, 185);
    strokeWeight(1);
    noFill();
    ellipse(wx, wY, wR * 0.7, wR * 0.7);
    fill(225, 228, 235);
    noStroke();
    ellipse(wx, wY, wR * 0.28, wR * 0.28);
  }
  fill(40, 42, 46);
  noStroke();
  arc(wFX, bBot + 2, wR * 2 + 12, wR * 2 + 12, PI * 0.85, PI * 1.0);
  arc(wBX, bBot + 2, wR * 2 + 12, wR * 2 + 12, PI * 0.85, PI * 1.0);
  if (shape !== "none") {
    let size = 44;
    fill(255);
    stroke(0);
    strokeWeight(2);
    if (shape === "square") {
      rect(carX - size / 2, bodyCenterY - size / 2, size, size, 3);
    } else {
      let h = size * 0.866;
      triangle(
        carX,
        bodyCenterY - h / 2,
        carX - size / 2,
        bodyCenterY + h / 2,
        carX + size / 2,
        bodyCenterY + h / 2,
      );
    }
  }
  pop();
}

// ─────────────────────────────────────────────
// Ticket booth
// ─────────────────────────────────────────────
function drawTicketBooth(gateAngle) {
  let bX = width * 0.72;
  let bFloor = roadY;
  let bW = 90,
    bH = 130;
  let bTop = bFloor - bH;
  let bL = bX - bW / 2,
    bR = bX + bW / 2;
  let roofW = bW + 28,
    roofH = 18;
  let roofL = bX - roofW / 2;

  push();
  noStroke();
  fill(0, 0, 0, 25);
  ellipse(bX, bFloor + 6, bW * 1.1, 12);
  fill(245, 245, 235);
  stroke(60, 60, 60);
  strokeWeight(1.5);
  rect(bL, bTop, bW, bH, 3, 3, 0, 0);
  stroke(200, 200, 190);
  strokeWeight(1);
  line(bL + bW * 0.33, bTop + 2, bL + bW * 0.33, bFloor);
  line(bL + bW * 0.66, bTop + 2, bL + bW * 0.66, bFloor);
  let wW = bW - 24,
    wH = 46,
    wX = bL + 12,
    wY = bTop + 14;
  fill(80, 60, 40);
  stroke(40, 30, 20);
  strokeWeight(1.5);
  rect(wX - 3, wY - 3, wW + 6, wH + 6, 3);
  fill(190, 220, 245, 210);
  noStroke();
  rect(wX, wY, wW, wH, 2);
  stroke(140, 170, 200);
  strokeWeight(1);
  line(wX + 2, wY + wH * 0.48, wX + wW - 2, wY + wH * 0.48);
  line(wX + wW * 0.5, wY + 2, wX + wW * 0.5, wY + wH - 2);
  drawBoothAttendant(bX, wX, wY, wW, wH);
  noStroke();
  fill(255, 255, 255, 70);
  rect(wX + 3, wY + 3, wW * 0.3, wH * 0.38, 2);
  fill(160, 130, 90);
  stroke(80, 60, 40);
  strokeWeight(1.2);
  rect(bL - 4, wY + wH + 3, bW + 8, 10, 2);
  noStroke();
  fill(200, 170, 120, 120);
  rect(bL - 3, wY + wH + 3, bW + 6, 4, 1);
  fill(200, 195, 185);
  stroke(100, 95, 85);
  strokeWeight(1.2);
  rect(bL + bW * 0.25, wY + wH + 18, bW * 0.5, bH - (wH + 28), 2, 2, 0, 0);
  stroke(150, 145, 135);
  strokeWeight(1);
  let dX = bL + bW * 0.25,
    dY = wY + wH + 18,
    dW = bW * 0.5,
    dH2 = bH - (wH + 28);
  rect(dX + 5, dY + 5, dW - 10, dH2 * 0.45, 1);
  rect(dX + 5, dY + dH2 * 0.5, dW - 10, dH2 * 0.45, 1);
  stroke(120, 100, 70);
  strokeWeight(2);
  line(
    bL + bW * 0.44,
    wY + wH + 18 + dH2 * 0.47,
    bL + bW * 0.44,
    wY + wH + 18 + dH2 * 0.53,
  );
  let stripeColors = [color(220, 50, 50), color(245, 245, 235)];
  let stripeW = roofW / 7;
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
  stroke(60, 60, 60);
  strokeWeight(1.5);
  noFill();
  rect(roofL, bTop - roofH, roofW, roofH, 2, 2, 0, 0);
  fill(220, 50, 50);
  stroke(140, 20, 20);
  strokeWeight(1);
  rect(bL + 10, bTop + 3, bW - 20, 10, 2);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(7);
  text("PARKING", bX, bTop + 8);
  let armBaseX = bR + 2,
    armBaseY = bFloor - 38,
    armLen = 110;
  let pivotX = armBaseX + 9,
    pivotY = armBaseY - 8;
  fill(180, 180, 190);
  stroke(80, 80, 90);
  strokeWeight(1.2);
  rect(armBaseX, armBaseY - 12, 18, 52, 3);
  noStroke();
  fill(255, 255, 255, 40);
  rect(armBaseX + 2, armBaseY - 10, 5, 48, 2);
  push();
  translate(pivotX, pivotY);
  rotate(gateAngle + PI);
  fill(100, 100, 110);
  stroke(60, 60, 70);
  strokeWeight(1);
  rect(2, -5, 22, 10, 3);
  pop();
  push();
  translate(pivotX, pivotY);
  rotate(gateAngle);
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
  stroke(80, 80, 90);
  strokeWeight(1);
  noFill();
  rect(0, -8, armLen, 10, 2);
  fill(255, 220, 0);
  noStroke();
  ellipse(armLen - 4, -3, 8, 8);
  pop();
  pop();
}

// ─────────────────────────────────────────────
// Past customers bar
// ─────────────────────────────────────────────
function drawPastCustomers() {
  if (submissions.length === 0) return;
  let sz = 22,
    pad = 12,
    barY = 28;
  let startX = width / 2 - (submissions.length * (sz + pad)) / 2;
  let col1 = color(40, 120, 220),
    col2 = color(220, 60, 60),
    colN = color(180, 180, 180);

  push();
  noStroke();
  fill(13, 67, 102, 160);
  textAlign(RIGHT, CENTER);
  textSize(11);
  text("past customers", startX - 10, barY);
  let lx = width - 160,
    ly = 12;
  textAlign(LEFT, TOP);
  textSize(10);
  fill(col1);
  rect(lx, ly, 10, 10, 2);
  fill(60);
  text("— ritual 1", lx + 14, ly);
  fill(col2);
  rect(lx, ly + 16, 10, 10, 2);
  fill(60);
  text("— ritual 2", lx + 14, ly + 16);
  stroke(140);
  strokeWeight(1.5);
  line(lx, ly + 38, lx + 10, ly + 38);
  noStroke();
  fill(60);
  text("— anything", lx + 14, ly + 32);

  for (let i = 0; i < submissions.length; i++) {
    let x = startX + i * (sz + pad) + sz / 2;
    let shapeType, col;
    if (i === 0) {
      shapeType = "square";
      col = col1;
    } else if (i === 1) {
      shapeType = "triangle";
      col = col2;
    } else {
      let shapeIndex = i - 2;
      shapeType = shapeArray[shapeIndex % shapeArray.length];
      col =
        shapeType === "square" ? col1 : shapeType === "triangle" ? col2 : colN;
    }
    if (shapeType !== "none") {
      noStroke();
      fill(0, 0, 0, 30);
      if (shapeType === "square")
        rect(x - sz / 2 + 2, barY - sz / 2 + 2, sz, sz, 3);
      else {
        let h = sz * 0.866;
        triangle(
          x + 2,
          barY - h / 2 + 2,
          x - sz / 2 + 2,
          barY + h / 2 + 2,
          x + sz / 2 + 2,
          barY + h / 2 + 2,
        );
      }
    }
    fill(col);
    stroke(0);
    strokeWeight(1.2);
    if (shapeType === "square") rect(x - sz / 2, barY - sz / 2, sz, sz, 3);
    else if (shapeType === "triangle") {
      let h = sz * 0.866;
      triangle(
        x,
        barY - h / 2,
        x - sz / 2,
        barY + h / 2,
        x + sz / 2,
        barY + h / 2,
      );
    } else {
      stroke(colN);
      strokeWeight(2.5);
      noFill();
      line(x - sz / 2, barY, x + sz / 2, barY);
    }
  }
  pop();
}

function displayCurrentGuest(
  carAnimX,
  shape,
  carColor,
  animalName,
  guestLabel,
) {
  drawCar(carAnimX, carColor, shape, animalName, guestLabel);
}

// ─────────────────────────────────────────────
// Fog overlay
// ─────────────────────────────────────────────
function drawFog() {
  if (typeof wrongCount === "undefined" || wrongCount === 0) return;
  let menuH = 200,
    fogTop = height - menuH;
  let layers, baseAlpha;
  if (wrongCount === 1) {
    layers = 3;
    baseAlpha = 130;
  } else if (wrongCount === 2) {
    layers = 6;
    baseAlpha = 190;
  } else {
    layers = 10;
    baseAlpha = 240;
  }

  push();
  noStroke();
  let baseOpacity = wrongCount === 1 ? 80 : wrongCount === 2 ? 155 : 215;
  fill(218, 222, 230, baseOpacity);
  rect(0, fogTop, width, menuH);

  let rowDefs;
  if (wrongCount === 1) {
    rowDefs = [
      {
        y: fogTop + 10,
        count: 6,
        wMin: 160,
        wMax: 240,
        hMin: 55,
        hMax: 80,
        alpha: 150,
      },
      {
        y: fogTop + 55,
        count: 5,
        wMin: 130,
        wMax: 200,
        hMin: 40,
        hMax: 65,
        alpha: 100,
      },
    ];
  } else if (wrongCount === 2) {
    rowDefs = [
      {
        y: fogTop - 5,
        count: 7,
        wMin: 180,
        wMax: 270,
        hMin: 65,
        hMax: 95,
        alpha: 200,
      },
      {
        y: fogTop + 50,
        count: 6,
        wMin: 150,
        wMax: 220,
        hMin: 55,
        hMax: 80,
        alpha: 170,
      },
      {
        y: fogTop + 100,
        count: 7,
        wMin: 140,
        wMax: 210,
        hMin: 45,
        hMax: 70,
        alpha: 140,
      },
    ];
  } else {
    rowDefs = [
      {
        y: fogTop - 20,
        count: 8,
        wMin: 200,
        wMax: 300,
        hMin: 75,
        hMax: 110,
        alpha: 230,
      },
      {
        y: fogTop + 40,
        count: 7,
        wMin: 170,
        wMax: 250,
        hMin: 65,
        hMax: 95,
        alpha: 210,
      },
      {
        y: fogTop + 100,
        count: 8,
        wMin: 160,
        wMax: 240,
        hMin: 55,
        hMax: 85,
        alpha: 200,
      },
      {
        y: fogTop + 155,
        count: 7,
        wMin: 150,
        wMax: 220,
        hMin: 45,
        hMax: 70,
        alpha: 190,
      },
    ];
  }

  for (let row of rowDefs) {
    randomSeed(row.y * 13 + wrongCount * 7);
    let spacing = width / row.count;
    for (let i = 0; i < row.count; i++) {
      let cx =
        i * spacing + spacing * 0.5 + random(-spacing * 0.25, spacing * 0.25);
      let cw = random(row.wMin, row.wMax),
        ch = random(row.hMin, row.hMax);
      let drift = sin(frameCount * 0.008 + i * 1.3 + row.y * 0.02) * 14;
      fill(180, 185, 196, row.alpha * 0.35);
      ellipse(cx + drift + 6, row.y + 5, cw * 0.9, ch * 0.85);
      fill(215, 220, 228, row.alpha);
      ellipse(cx + drift, row.y, cw, ch);
      fill(240, 243, 248, row.alpha * 0.55);
      ellipse(cx + drift - cw * 0.15, row.y - ch * 0.15, cw * 0.55, ch * 0.5);
    }
  }
  if (wrongCount >= 3) {
    fill(205, 210, 220, 210);
    rect(0, fogTop + menuH * 0.45, width, menuH * 0.55);
  }

  let wispCount = wrongCount >= 3 ? 3 : wrongCount === 2 ? 2 : 1;
  for (let w = 0; w < wispCount; w++) {
    let wispAlpha = wrongCount >= 3 ? 110 : wrongCount === 2 ? 75 : 45;
    let wispY = fogTop - 8 + w * 12,
      speed = 0.012 - w * 0.003,
      amp = 16 - w * 3;
    fill(220, 224, 232, wispAlpha);
    beginShape();
    vertex(0, wispY + amp);
    for (let x = 0; x <= width; x += 8) {
      let wave =
        sin(x * 0.018 + frameCount * speed + w * 2.1) * amp +
        sin(x * 0.034 + frameCount * (speed * 0.6)) * (amp * 0.5);
      curveVertex(x, wispY + wave);
    }
    vertex(width, wispY + amp);
    vertex(width, wispY + amp + 60);
    vertex(0, wispY + amp + 60);
    endShape(CLOSE);
  }
  pop();
}

function displayCompletion() {
  let sh = typeof getCurrentShift === "function" ? getCurrentShift() : null;
  // Night shift is infinite — never shows a completion screen
  if (sh && sh.id === "night") return;

  // Morning or afternoon: completion after their guest count
  if (sh && sh.id === "morning" && submissions.length >= 5) {
    _drawCompletionCard(
      "Morning Shift Complete!",
      "Heading into the afternoon...",
    );
  } else if (sh && sh.id === "afternoon" && submissions.length >= 8) {
    _drawCompletionCard("Afternoon Shift Done!", "Night shift awaits...");
  }
}

function _drawCompletionCard(title, sub) {
  let sz = 420;
  push();
  fill(0, 0, 0, 120);
  noStroke();
  rect(0, 0, width, height);
  fill(255);
  stroke(13, 67, 102);
  strokeWeight(1.5);
  rect(width / 2 - sz / 2, height / 2 - sz / 2, sz, sz, 14);
  fill(13, 67, 102);
  noStroke();
  rect(width / 2 - sz / 2, height / 2 - sz / 2, sz, 52, 14, 14, 0, 0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(26);
  text(title, width / 2, height / 2 - sz / 2 + 26);
  fill(60, 80, 120);
  textSize(15);
  text(sub, width / 2, height / 2 + 10);
  fill(140, 140, 160);
  textSize(12);
  text("(Stage transition in progress...)", width / 2, height / 2 + 38);
  pop();
}

function drawBoothAttendant(bX, wX, wY, wW, wH) {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(wX + 2, wY + 2, wW - 4, wH - 4);
  drawingContext.clip();
  let cx = wX + wW * 0.52,
    headY = wY + wH * 0.38,
    headR = wH * 0.22;
  push();
  fill(13, 67, 102);
  noStroke();
  beginShape();
  vertex(cx - headR * 1.6, wY + wH + 4);
  vertex(cx + headR * 1.6, wY + wH + 4);
  vertex(cx + headR * 1.1, headY + headR * 1.1);
  vertex(cx - headR * 1.1, headY + headR * 1.1);
  endShape(CLOSE);
  fill(245, 245, 235);
  noStroke();
  triangle(
    cx,
    headY + headR * 0.95,
    cx - headR * 0.5,
    headY + headR * 1.6,
    cx + headR * 0.5,
    headY + headR * 1.6,
  );
  fill(200, 165, 60);
  noStroke();
  rect(cx + headR * 0.2, headY + headR * 1.3, headR * 0.7, headR * 0.42, 2);
  fill(13, 67, 102);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(max(5, headR * 0.28));
  text("PP", cx + headR * 0.55, headY + headR * 1.52);
  fill(255, 218, 170);
  stroke(160, 110, 70);
  strokeWeight(1);
  ellipse(cx, headY, headR * 2, headR * 2.1);
  fill(13, 67, 102);
  noStroke();
  rect(cx - headR * 1.25, headY - headR * 0.72, headR * 2.5, headR * 0.28, 2);
  arc(cx, headY - headR * 0.58, headR * 1.8, headR * 1.4, PI, TWO_PI);
  fill(200, 165, 60);
  rect(cx - headR * 0.9, headY - headR * 0.72, headR * 1.8, headR * 0.18);
  fill(40, 25, 10);
  noStroke();
  ellipse(cx - headR * 0.32, headY - headR * 0.08, headR * 0.22, headR * 0.22);
  ellipse(cx + headR * 0.32, headY - headR * 0.08, headR * 0.22, headR * 0.22);
  fill(255);
  ellipse(cx - headR * 0.28, headY - headR * 0.12, headR * 0.09, headR * 0.09);
  ellipse(cx + headR * 0.36, headY - headR * 0.12, headR * 0.09, headR * 0.09);
  noFill();
  stroke(140, 80, 50);
  strokeWeight(1.2);
  arc(cx, headY + headR * 0.14, headR * 0.55, headR * 0.38, 0, PI);
  pop();
  drawingContext.restore();
}
