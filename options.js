// options.js — booth control panel UI

let options = [
  { label: "Check\nTicket", icon: "ticket" },
  { label: "Check\nLicense", icon: "plate" },
  { label: "Click\nPen", icon: "pen" },
  { label: "Stamp\nGuest Log", icon: "stamp" },
  { label: "Talk Into\nSpeaker", icon: "speaker" },
];

let currentOptionIndex = null;
let penExtended = false;
let penButtonX, penButtonY, penButtonW, penButtonH;
let logStamped = false;
let stampButtonX, stampButtonY, stampButtonW, stampButtonH;
let speakerTalking = false;
let speakerWaveFrame = 0;
let speakerX, speakerY, speakerW, speakerH;
let speakerButtonX, speakerButtonY, speakerButtonW, speakerButtonH;

// ── License scan state ─────────────────────────────────────────────
let scanStartTime = -1; // millis() when scan began (-1 = not started)
let scanComplete = false; // true once the 5-second scan finishes
const SCAN_DURATION = 3000; // ms

// ─── Colour palette ───────────────────────────────────────────────
const C_NAVY = [13, 67, 102];
const C_PANEL = [28, 48, 72]; // dark booth panel
const C_PANELRIM = [18, 34, 54];
const C_BTNBG = [240, 248, 255]; // light button face
const C_BTNHOV = [247, 247, 205];
const C_BTNPRESS = [180, 200, 220];
const C_DISABLED = [160, 175, 190];
const C_ACCENT = [220, 50, 50]; // red accent
const C_GOLD = [200, 165, 60];

// ─── Training highlight pulse ──────────────────────────────────────
// glowPhase increases every frame and drives a sin-wave pulse on the
// highlighted button. Stored here so options.js owns it.
let trainingGlowPhase = 0;

function drawOptions() {
  bottommenu();
}

// ─── Bottom menu panel ────────────────────────────────────────────
function bottommenu() {
  let menuW = 800;
  let menuH = 200;
  let menuX = (width - menuW) / 2;
  let menuY = height - menuH;
  let btnW = menuW / 5;
  let btnH = 160;
  let btnY = menuY + (menuH - btnH) / 2;

  // Advance glow phase every frame
  trainingGlowPhase += 0.08;

  // Which button should glow? (-1 = none)
  let highlightIdx =
    typeof getTrainingHighlightIndex === "function"
      ? getTrainingHighlightIndex()
      : -1;

  // Panel background — dark booth counter
  push();
  noStroke();
  fill(C_PANELRIM[0], C_PANELRIM[1], C_PANELRIM[2]);
  rect(menuX - 4, menuY - 4, menuW + 8, menuH + 8, 6);

  fill(C_PANEL[0], C_PANEL[1], C_PANEL[2]);
  rect(menuX, menuY, menuW, menuH, 4);

  // Panel rivets / corner details
  fill(C_GOLD[0], C_GOLD[1], C_GOLD[2]);
  for (let rx of [menuX + 8, menuX + menuW - 8]) {
    for (let ry of [menuY + 8, menuY + menuH - 8]) {
      ellipse(rx, ry, 7, 7);
    }
  }

  // "BOOTH CONTROLS" label strip at top of panel
  fill(C_GOLD[0], C_GOLD[1], C_GOLD[2], 180);
  rect(menuX + 4, menuY + 4, menuW - 8, 18, 2);
  noStroke();
  fill(C_PANELRIM[0], C_PANELRIM[1], C_PANELRIM[2]);
  textAlign(CENTER, CENTER);
  textSize(10);
  text("★  BOOTH CONTROLS  ★", menuX + menuW / 2, menuY + 13);
  pop();

  // Individual action buttons
  for (let i = 0; i < 5; i++) {
    let bx = menuX + i * btnW + 8;
    let by = btnY;
    let bw = btnW - 16;
    let bh = btnH;

    let hov =
      mouseX >= menuX + i * btnW &&
      mouseX <= menuX + (i + 1) * btnW &&
      mouseY >= menuY &&
      mouseY <= menuY + menuH;
    let pres = hov && mouseIsPressed;
    let dis = typeof disabled !== "undefined" && disabled[i];

    // Is this the training highlight button?
    let isHighlight = i === highlightIdx && !dis;
    let glowAmt = isHighlight ? sin(trainingGlowPhase) * 0.5 + 0.5 : 0; // 0..1

    push();

    // ── Training highlight: outer glow rings ──────────────────────
    if (isHighlight) {
      // Three expanding rings with decreasing opacity
      noFill();
      for (let ring = 0; ring < 3; ring++) {
        let ringAlpha = map(glowAmt, 0, 1, 20, 90) - ring * 22;
        let expand = ring * 6 + glowAmt * 8;
        stroke(60, 220, 120, ringAlpha);
        strokeWeight(3 - ring * 0.8);
        rect(
          bx - expand,
          by - expand,
          bw + expand * 2,
          bh + expand * 2,
          10 + expand,
        );
      }
    }

    // Button shadow
    noStroke();
    fill(0, 0, 0, 40);
    rect(bx + 2, by + 3, bw, bh, 8);

    // Button face
    if (dis) {
      fill(C_DISABLED[0], C_DISABLED[1], C_DISABLED[2]);
    } else if (isHighlight) {
      // Blend between normal and a bright green-tinted face
      let r = lerp(C_BTNBG[0], 220, glowAmt * 0.35);
      let g = lerp(C_BTNBG[1], 255, glowAmt * 0.45);
      let b2 = lerp(C_BTNBG[2], 220, glowAmt * 0.25);
      fill(r, g, b2);
    } else if (pres) {
      fill(C_BTNPRESS[0], C_BTNPRESS[1], C_BTNPRESS[2]);
    } else if (hov) {
      fill(C_BTNHOV[0], C_BTNHOV[1], C_BTNHOV[2]);
    } else {
      fill(C_BTNBG[0], C_BTNBG[1], C_BTNBG[2]);
    }
    stroke(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    strokeWeight(isHighlight ? 2.5 : 1.5);
    if (isHighlight) {
      // Green border on highlight
      let borderAlpha = map(glowAmt, 0, 1, 160, 255);
      stroke(40, 200, 90, borderAlpha);
    }
    rect(bx, by, bw, bh, 8);

    // Top accent bar
    noStroke();
    if (dis) {
      fill(120, 140, 160);
    } else if (isHighlight) {
      fill(40, map(glowAmt, 0, 1, 160, 220), 90, 255);
    } else {
      fill(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    }
    rect(bx + 1, by + 1, bw - 2, 6, 8, 8, 0, 0);

    // ── Highlight: step number badge (top-left of button) ─────────
    if (isHighlight && typeof getTrainingHighlightIndex === "function") {
      // Work out what step number this is
      let shapeIndex = submissions.length % shapeArray.length;
      let shape = shapeArray[shapeIndex];
      let ritual = getRitualForShape(shape);
      let stepNum = clickHistory.length + 1; // 1-based next step

      let badgePulse = map(glowAmt, 0, 1, 180, 255);
      noStroke();
      fill(40, 200, 90, badgePulse);
      ellipse(bx + 16, by + 16, 26, 26);
      fill(255);
      textAlign(CENTER, CENTER);
      textFont("sans-serif");
      textStyle(BOLD);
      textSize(12);
      text(stepNum, bx + 16, by + 17);
      textStyle(NORMAL);

      // "NEXT" label under the step badge
      fill(40, 200, 90, map(glowAmt, 0, 1, 120, 200));
      textFont("sans-serif");
      textSize(7);
      text("NEXT", bx + 16, by + 30);
    }

    // Icon
    let iconX = bx + bw / 2;
    let iconY = by + bh * 0.4;
    let iconAlpha = dis ? 120 : 255;
    drawMenuIcon(options[i].icon, iconX, iconY, dis, iconAlpha);

    // Label
    fill(dis ? 100 : C_NAVY[0], dis ? 100 : C_NAVY[1], dis ? 100 : C_NAVY[2]);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(12);
    text(options[i].label, iconX, by + bh * 0.76);

    // Done tick when disabled — show order number badge
    if (dis) {
      let orderNum = clickHistory.indexOf(i + 1) + 1;
      let badgeCX = bx + bw - 12;
      let badgeCY = by + 12;

      // Green circle
      fill(60, 160, 80, 220);
      noStroke();
      ellipse(badgeCX, badgeCY, 20, 20);

      // Order number
      fill(255);
      noStroke();
      textFont("sans-serif");
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      textSize(11);
      text(orderNum, badgeCX, badgeCY + 1);
      textStyle(NORMAL);
    }

    pop();
  }
}

// ─── Small icons drawn in each button ────────────────────────────
function drawMenuIcon(type, cx, cy, disabled, alpha) {
  push();
  let c = disabled ? [130, 145, 160] : C_NAVY;
  stroke(c[0], c[1], c[2], alpha);
  fill(c[0], c[1], c[2], alpha);

  if (type === "ticket") {
    // Parking ticket
    strokeWeight(1.5);
    fill(255, 255, 255, alpha);
    rect(cx - 22, cy - 14, 44, 28, 4);
    // Perforated left edge
    stroke(c[0], c[1], c[2], alpha);
    strokeWeight(1);
    for (let dy = -10; dy <= 10; dy += 5)
      line(cx - 22, cy + dy, cx - 16, cy + dy);
    // Lines of text
    strokeWeight(1.5);
    line(cx - 10, cy - 5, cx + 18, cy - 5);
    line(cx - 10, cy + 2, cx + 18, cy + 2);
    line(cx - 10, cy + 9, cx + 4, cy + 9);
  } else if (type === "plate") {
    // Licence plate
    strokeWeight(1.5);
    fill(240, 240, 200, alpha);
    rect(cx - 22, cy - 10, 44, 20, 3);
    fill(c[0], c[1], c[2], alpha);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(10);
    text("AB·XYZ", cx, cy);
    stroke(c[0], c[1], c[2], alpha);
    strokeWeight(1);
    noFill();
    ellipse(cx - 18, cy, 4, 4);
    ellipse(cx + 18, cy, 4, 4);
  } else if (type === "pen") {
    // Ballpoint pen
    strokeWeight(1.5);
    fill(80, 100, 180, alpha);
    rect(cx - 18, cy - 5, 30, 10, 4);
    fill(60, 60, 60, alpha);
    rect(cx - 22, cy - 4, 6, 8, 2);
    // Tip
    fill(30, 30, 30, alpha);
    triangle(cx + 12, cy - 4, cx + 12, cy + 4, cx + 22, cy);
    // Clip
    stroke(c[0], c[1], c[2], alpha);
    strokeWeight(1);
    line(cx - 4, cy - 5, cx - 4, cy - 10);
  } else if (type === "stamp") {
    // Rubber stamp
    strokeWeight(1.5);
    fill(160, 100, 50, alpha);
    rect(cx - 12, cy - 14, 24, 10, 3); // handle
    rect(cx - 16, cy - 6, 32, 8, 2); // base
    // Ink face
    fill(200, 30, 30, alpha);
    rect(cx - 14, cy + 2, 28, 12, 2);
    // Text lines on stamp
    stroke(255, 255, 255, alpha);
    strokeWeight(1);
    line(cx - 10, cy + 6, cx + 10, cy + 6);
    line(cx - 6, cy + 10, cx + 6, cy + 10);
  } else if (type === "speaker") {
    // Intercom speaker grille
    strokeWeight(1.5);
    fill(200, 200, 210, alpha);
    rect(cx - 18, cy - 14, 36, 28, 5);
    stroke(c[0], c[1], c[2], alpha);
    strokeWeight(1);
    for (let ly = cy - 9; ly <= cy + 9; ly += 5) line(cx - 12, ly, cx + 12, ly);
    // Small button
    fill(220, 50, 50, alpha);
    noStroke();
    ellipse(cx + 10, cy - 9, 8, 8);
  }

  pop();
}

// ─── Modal overlay ────────────────────────────────────────────────
function drawModal() {
  // Dim background
  push();
  noStroke();
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);

  // Modal card
  let mx = modalX,
    my = modalY,
    mw = modalW,
    mh = modalH;

  // Drop shadow
  fill(0, 0, 0, 60);
  noStroke();
  rect(mx + 6, my + 6, mw, mh, 12);

  // Card body
  fill(248, 250, 253);
  stroke(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
  strokeWeight(2);
  rect(mx, my, mw, mh, 10);

  // Header bar
  fill(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
  noStroke();
  rect(mx, my, mw, 44, 10, 10, 0, 0);

  // Header title
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(17);
  if (currentOptionIndex !== null)
    text(
      options[currentOptionIndex].label.replace("\n", " "),
      mx + mw / 2,
      my + 22,
    );

  // ── Check Ticket ──────────────────────────────────────────────
  if (currentOptionIndex === 0) {
    let tw = mw * 0.58,
      th = mh * 0.52;
    let tx = mx + (mw - tw) / 2,
      ty = my + 60;
    // Ticket body
    fill(255, 252, 235);
    stroke(180, 150, 60);
    strokeWeight(1.5);
    rect(tx, ty, tw, th, 8);
    // Left stub tear line
    stroke(180, 150, 60);
    strokeWeight(1);
    for (let dy = ty + 10; dy < ty + th - 10; dy += 9)
      line(tx + 70, dy, tx + 70, dy + 5);
    // Header strip on ticket
    fill(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    noStroke();
    rect(tx + 1, ty + 1, tw - 2, 28, 7, 7, 0, 0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("PARKING TICKET", tx + tw / 2, ty + 15);
    // Barcode area
    stroke(0);
    strokeWeight(1.5);
    for (let bx = tx + 80; bx < tx + tw - 20; bx += 5)
      line(bx, ty + th / 3, bx + (bx % 10 === 0 ? 2 : 1), ty + th / 3 + 18);
    // Details
    noStroke();
    fill(40);
    textAlign(LEFT, TOP);
    textSize(13);
    text("Zone:  A3", tx + 82, ty + th / 3 + 24);
    text("Issued:  14:32", tx + 82, ty + th / 3 + 40);
    text("Valid:   2 hours", tx + 82, ty + th / 3 + 56);
    // Stub
    fill(C_NAVY[0], C_NAVY[1], C_NAVY[2], 30);
    noStroke();
    rect(tx + 1, ty + 1, 68, th - 2, 7, 0, 0, 7);
    fill(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    textAlign(CENTER, CENTER);
    push();
    translate(tx + 35, ty + th / 2);
    rotate(-HALF_PI);
    textSize(10);
    text("KEEP THIS PORTION", 0, 0);
    pop();
  }

  // ── Check License ─────────────────────────────────────────────
  if (currentOptionIndex === 1) {
    let fw = mw * 0.68,
      fh = mh * 0.52;
    let fx = mx + (mw - fw) / 2,
      fy = my + 62;

    // Start scan timer the first time this modal is drawn
    if (scanStartTime < 0) scanStartTime = millis();

    let elapsed = millis() - scanStartTime;
    let progress = constrain(elapsed / SCAN_DURATION, 0, 1);
    if (elapsed >= SCAN_DURATION) scanComplete = true;

    // Camera viewfinder frame
    stroke(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    strokeWeight(2.5);
    noFill();
    rect(fx, fy, fw, fh, 10);
    // Corner brackets
    strokeWeight(3);
    let blen = 18;
    for (let [bx2, by2, sx, sy] of [
      [fx, fy, 1, 1],
      [fx + fw, fy, -1, 1],
      [fx, fy + fh, 1, -1],
      [fx + fw, fy + fh, -1, -1],
    ]) {
      line(bx2, by2, bx2 + sx * blen, by2);
      line(bx2, by2, bx2, by2 + sy * blen);
    }

    // Plate
    let pw = fw * 0.68,
      ph = fh * 0.38;
    let px = fx + (fw - pw) / 2,
      py = fy + (fh - ph) / 2;
    fill(240, 240, 200);
    stroke(60);
    strokeWeight(1.5);
    rect(px, py, pw, ph, 6);
    fill(10);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(26);
    text("AB12 XYZ", px + pw / 2, py + ph / 2);
    // Screw holes on plate
    fill(150);
    ellipse(px + 10, py + ph / 2, 6, 6);
    ellipse(px + pw - 10, py + ph / 2, 6, 6);

    if (!scanComplete) {
      // Animated scan line sweeping over plate
      let scanY = py + (frameCount % ph);
      stroke(255, 60, 60, 200);
      strokeWeight(2);
      line(px + 4, scanY, px + pw - 4, scanY);
      noStroke();
      fill(255, 60, 60, 30);
      rect(px + 4, scanY - 4, pw - 8, 8);

      // Progress bar
      let barX = fx,
        barY = fy + fh + 14,
        barW = fw,
        barH = 10;
      noStroke();
      fill(200, 215, 230);
      rect(barX, barY, barW, barH, 5);
      fill(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
      rect(barX, barY, barW * progress, barH, 5);
      // Pulsing leading dot
      fill(200, 165, 60, 200);
      ellipse(barX + barW * progress, barY + barH / 2, 12, 12);

      // Label with countdown
      let secsLeft = ceil((SCAN_DURATION - elapsed) / 1000);
      fill(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
      noStroke();
      textAlign(CENTER, TOP);
      textSize(14);
      text("Scanning plate… " + secsLeft + "s", fx + fw / 2, fy + fh + 30);
    } else {
      // ── Scan complete state ──
      // Green success overlay on the viewfinder
      noStroke();
      fill(40, 180, 80, 28);
      rect(fx, fy, fw, fh, 10);

      // Green tick mark in centre of viewfinder
      let tickCX = fx + fw / 2,
        tickCY = fy + fh / 2 - 6;
      stroke(40, 180, 80);
      strokeWeight(5);
      noFill();
      line(tickCX - 22, tickCY, tickCX - 6, tickCY + 18);
      line(tickCX - 6, tickCY + 18, tickCX + 26, tickCY - 14);

      // "SCAN COMPLETE" banner
      let bannerY = fy + fh + 12;
      noStroke();
      fill(40, 180, 80, 220);
      rect(fx, bannerY, fw, 28, 6);
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(15);
      text("✓  SCAN COMPLETE", fx + fw / 2, bannerY + 14);
    }
  }

  // ── Click Pen ─────────────────────────────────────────────────
  if (currentOptionIndex === 2) {
    let pcx = mx + mw / 2,
      pcy = my + mh / 2 - 10;
    // Pen barrel
    stroke(0);
    strokeWeight(2);
    fill(60, 80, 180);
    rect(pcx - 110, pcy - 10, 190, 20, 10);
    // Clip
    fill(180, 180, 200);
    rect(pcx - 70, pcy - 16, 8, 26, 3);
    // Grip section
    fill(40, 40, 100);
    rect(pcx + 60, pcy - 10, 30, 20, 0, 3, 3, 0);
    // End cap / clicker button
    fill(220, 50, 50);
    rect(pcx - 118, pcy - 8, 14, 16, 6);
    // Tip
    if (penExtended) {
      fill(30, 30, 30);
      triangle(pcx + 90, pcy - 5, pcx + 110, pcy, pcx + 90, pcy + 5);
      // Ink drop
      fill(30, 30, 120, 180);
      noStroke();
      ellipse(pcx + 112, pcy, 5, 7);
    } else {
      fill(80);
      stroke(0);
      strokeWeight(1);
      rect(pcx + 88, pcy - 5, 4, 10, 2);
    }
    // Sheen on barrel
    noStroke();
    fill(255, 255, 255, 40);
    rect(pcx - 108, pcy - 8, 186, 6, 8);

    // Label
    fill(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(16);
    text(penExtended ? "Pen ready!" : "Click the pen", mx + mw / 2, my + 60);

    // Click button
    let btnW = 130,
      btnH = 38;
    let btnX = mx + mw / 2 - btnW / 2,
      btnY = my + mh - 90;
    let bhov =
      mouseX >= btnX &&
      mouseX <= btnX + btnW &&
      mouseY >= btnY &&
      mouseY <= btnY + btnH;
    fill(bhov ? [247, 247, 205] : [220, 230, 245]);
    stroke(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    strokeWeight(1.5);
    rect(btnX, btnY, btnW, btnH, 8);
    noStroke();
    fill(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    textAlign(CENTER, CENTER);
    textSize(15);
    text("Click!", btnX + btnW / 2, btnY + btnH / 2);
    penButtonX = btnX;
    penButtonY = btnY;
    penButtonW = btnW;
    penButtonH = btnH;
  }

  // ── Stamp Guest Log ───────────────────────────────────────────
  if (currentOptionIndex === 3) {
    let lw = mw * 0.64,
      lh = mh * 0.52;
    let lx = mx + (mw - lw) / 2,
      ly = my + 58;
    // Log book
    fill(255, 252, 245);
    stroke(140, 100, 50);
    strokeWeight(1.5);
    rect(lx, ly, lw, lh, 6);
    // Book spine
    fill(160, 110, 50);
    noStroke();
    rect(lx, ly, 18, lh, 6, 0, 0, 6);
    // Ruled lines
    stroke(210, 200, 185);
    strokeWeight(1);
    for (let ry = ly + 44; ry < ly + lh - 14; ry += 22)
      line(lx + 24, ry, lx + lw - 14, ry);
    // Header
    fill(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    noStroke();
    rect(lx + 19, ly + 1, lw - 20, 30, 0, 5, 0, 0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("GUEST LOG", lx + 19 + (lw - 20) / 2, ly + 16);
    // Entries
    fill(60);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(12);
    text("Guest:   #" + guestIndex, lx + 30, ly + 52);
    text("Status:  Pending review", lx + 30, ly + 74);
    text("Time:    " + "14:3" + (guestIndex % 10), lx + 30, ly + 96);

    // Stamp tool hovering above
    let stx = lx + lw - 60,
      sty = ly - 40;
    fill(140, 80, 30);
    stroke(80, 40, 10);
    strokeWeight(1);
    rect(stx - 10, sty, 20, 18, 3);
    rect(stx - 14, sty + 14, 28, 10, 2);
    fill(200, 30, 30);
    rect(stx - 12, sty + 22, 24, 14, 2);

    // APPROVED stamp
    if (logStamped) {
      push();
      translate(lx + lw / 2 + 10, ly + lh / 2 + 5);
      rotate(-0.25);
      stroke(180, 20, 20);
      strokeWeight(3);
      noFill();
      rect(-90, -22, 180, 44, 4);
      noStroke();
      fill(180, 20, 20, 230);
      textAlign(CENTER, CENTER);
      textSize(30);
      text("APPROVED", 0, 0);
      pop();
    }

    // Stamp button
    let sbW = 140,
      sbH = 38;
    let sbX = mx + mw / 2 - sbW / 2,
      sbY = my + mh - 88;
    let sbhov =
      mouseX >= sbX &&
      mouseX <= sbX + sbW &&
      mouseY >= sbY &&
      mouseY <= sbY + sbH;
    fill(sbhov ? [247, 247, 205] : [220, 230, 245]);
    stroke(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    strokeWeight(1.5);
    rect(sbX, sbY, sbW, sbH, 8);
    noStroke();
    fill(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    textAlign(CENTER, CENTER);
    textSize(15);
    text("Stamp Log", sbX + sbW / 2, sbY + sbH / 2);
    stampButtonX = sbX;
    stampButtonY = sbY;
    stampButtonW = sbW;
    stampButtonH = sbH;
  }

  // ── Talk Into Speaker ─────────────────────────────────────────
  if (currentOptionIndex === 4) {
    push();
    speakerW = mw * 0.3;
    speakerH = mh * 0.42;
    speakerX = mx + (mw - speakerW) / 2;
    speakerY = my + 58;

    // Speaker housing
    fill(80, 88, 100);
    stroke(40, 46, 58);
    strokeWeight(1.5);
    rect(speakerX, speakerY, speakerW, speakerH, 8);
    // Grille area
    fill(55, 62, 72);
    noStroke();
    rect(speakerX + 8, speakerY + 8, speakerW - 16, speakerH - 40, 4);
    // Grille lines
    stroke(90, 100, 115);
    strokeWeight(1.5);
    for (let gy = speakerY + 16; gy < speakerY + speakerH - 38; gy += 7)
      line(speakerX + 12, gy, speakerX + speakerW - 12, gy);
    // Talk button on housing
    fill(220, 50, 50);
    noStroke();
    ellipse(speakerX + speakerW / 2, speakerY + speakerH - 16, 20, 20);
    fill(255, 100, 100);
    noStroke();
    ellipse(speakerX + speakerW / 2, speakerY + speakerH - 16, 10, 10);
    // Label
    fill(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(14);
    text("Intercom Speaker", speakerX + speakerW / 2, speakerY - 26);

    // Talk button
    let tbW = 140,
      tbH = 38;
    let tbX = mx + mw / 2 - tbW / 2,
      tbY = my + mh - 88;
    let tbhov =
      mouseX >= tbX &&
      mouseX <= tbX + tbW &&
      mouseY >= tbY &&
      mouseY <= tbY + tbH;
    fill(tbhov ? [247, 247, 205] : [220, 230, 245]);
    stroke(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    strokeWeight(1.5);
    rect(tbX, tbY, tbW, tbH, 8);
    noStroke();
    fill(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    textAlign(CENTER, CENTER);
    textSize(15);
    text("Talk", tbX + tbW / 2, tbY + tbH / 2);
    speakerButtonX = tbX;
    speakerButtonY = tbY;
    speakerButtonW = tbW;
    speakerButtonH = tbH;
    pop();
  }

  // Speaker waves
  if (currentOptionIndex === 4 && speakerTalking) {
    push();
    let wx = speakerX + speakerW + 10;
    let wy = speakerY + speakerH / 2 - 10;
    noFill();
    strokeWeight(2.5);
    for (let i = 1; i <= 3; i++) {
      let r = speakerWaveFrame + i * 18;
      stroke(255, 140, 0, map(r, 0, 100, 220, 30));
      arc(wx, wy, r * 2, r * 2, -PI * 0.55, PI * 0.55);
    }
    pop();
    speakerWaveFrame++;
    if (speakerWaveFrame > 70) speakerWaveFrame = 0;
  }

  // ── Close button ──────────────────────────────────────────────
  // Locked while a license scan is in progress
  let scanBlocking = currentOptionIndex === 1 && !scanComplete;
  let chov =
    !scanBlocking &&
    mouseX >= closeX &&
    mouseX <= closeX + closeW &&
    mouseY >= closeY &&
    mouseY <= closeY + closeH;
  if (scanBlocking) {
    fill(C_DISABLED[0], C_DISABLED[1], C_DISABLED[2]);
    stroke(140, 155, 170);
  } else {
    fill(chov ? [247, 247, 205] : [220, 230, 245]);
    stroke(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
  }
  strokeWeight(1.5);
  rect(closeX, closeY, closeW, closeH, 6);
  noStroke();
  fill(
    scanBlocking ? 120 : C_NAVY[0],
    scanBlocking ? 120 : C_NAVY[1],
    scanBlocking ? 120 : C_NAVY[2],
  );
  textAlign(CENTER, CENTER);
  textSize(14);
  text(
    scanBlocking ? "⏳ Wait…" : "✕  Close",
    closeX + closeW / 2,
    closeY + closeH / 2,
  );

  pop();
}

// ─── Mouse interactions (logic unchanged) ─────────────────────────
function modalMouseClicked() {
  if (currentOptionIndex === 2) {
    if (
      mouseX >= penButtonX &&
      mouseX <= penButtonX + penButtonW &&
      mouseY >= penButtonY &&
      mouseY <= penButtonY + penButtonH
    ) {
      penExtended = !penExtended;
      return;
    }
  }
  if (currentOptionIndex === 3) {
    if (
      mouseX >= stampButtonX &&
      mouseX <= stampButtonX + stampButtonW &&
      mouseY >= stampButtonY &&
      mouseY <= stampButtonY + stampButtonH
    ) {
      logStamped = true;
      return;
    }
  }
  if (currentOptionIndex === 4) {
    if (
      mouseX >= speakerButtonX &&
      mouseX <= speakerButtonX + speakerButtonW &&
      mouseY >= speakerButtonY &&
      mouseY <= speakerButtonY + speakerButtonH
    ) {
      speakerTalking = true;
      speakerWaveFrame = 0;
      return;
    }
  }
  if (showModal) {
    if (
      mouseX >= closeX &&
      mouseX <= closeX + closeW &&
      mouseY >= closeY &&
      mouseY <= closeY + closeH
    ) {
      // Don't allow closing while license scan is still running
      if (currentOptionIndex === 1 && !scanComplete) return;
      showModal = false;
    }
    return;
  }
  if (!showModal) {
    logStamped = false;
    penExtended = false;
    speakerTalking = false;
    // Reset scan state so next time the modal opens it starts fresh
    scanStartTime = -1;
    scanComplete = false;
  }
}

function bottomMenuMouseClicked() {
  let menuW = 800,
    menuH = 200;
  let menuX = (width - menuW) / 2,
    menuY = height - menuH;
  let btnW = menuW / 5;

  for (let i = 0; i < 5; i++) {
    let sx = menuX + i * btnW,
      sy = menuY;
    if (
      mouseX >= sx &&
      mouseX <= sx + btnW &&
      mouseY >= sy &&
      mouseY <= sy + menuH
    ) {
      if (!disabled[i]) {
        disabled[i] = true;
        clickHistory.push(i + 1);
        console.log(clickHistory);
      }
      currentOptionIndex = i;
      // Reset license scan state for a fresh open each time
      scanStartTime = -1;
      scanComplete = false;
      showModal = true;
      return;
    }
  }
}
