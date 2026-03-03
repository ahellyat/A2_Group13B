//this file includes all the functions that handle the bottom option menu,
//such as detecting the mouse clicks and drawing the modals
let options = [
  { label: "Check Ticket" },
  { label: "Check License" },
  { label: "Click Pen" },
  { label: "Stamp the \n" + "Guest Log" },
  { label: "Talk Into \n" + "Speaker" },
];

let currentOptionIndex = null; // which option is active in modal
let penExtended = false;
let penButtonX, penButtonY, penButtonW, penButtonH;
let logStamped = false;
let stampButtonX, stampButtonY, stampButtonW, stampButtonH;
let speakerTalking = false; // true when Talk button pressed
let speakerWaveFrame = 0; // for animation progress

// speaker modal variables (declare outside block)
let speakerX, speakerY, speakerW, speakerH;
let speakerButtonX, speakerButtonY, speakerButtonW, speakerButtonH;

function drawOptions() {
  bottommenu();
}

function bottommenu() {
  let bottommenuW = 800;
  let bottommenuH = 200;
  let bottommenux = (width - bottommenuW) / 2;
  let bottommenuy = height - bottommenuH;
  stroke(13, 67, 102);
  strokeWeight(1);
  rect(bottommenux, bottommenuy, bottommenuW, bottommenuH);

  let sqSize = bottommenuW / 5;
  for (let i = 0; i < 5; i++) {
    let sqX = bottommenux + i * sqSize;
    let sqY = bottommenuy + bottommenuH - sqSize;

    let hovered =
      mouseX >= sqX &&
      mouseX <= sqX + sqSize &&
      mouseY >= sqY &&
      mouseY <= sqY + sqSize;
    let pressed = hovered && mouseIsPressed;

    push(); // isolate styles
    stroke(13, 67, 102); // ensure stroke is applied
    strokeWeight(1);

    if (typeof disabled !== "undefined" && disabled[i]) {
      fill(200);
    } else if (pressed) {
      fill(100);
    } else if (hovered) {
      fill(247, 247, 205);
    } else {
      fill(255);
    }

    rect(sqX, sqY, sqSize, sqSize);

    // draw text
    noStroke();
    fill(13, 67, 102);
    textAlign(CENTER, CENTER);
    textSize(16);
    text(options[i].label, sqX + sqSize / 2, sqY + sqSize / 2);
    pop(); // restore for next iteration
  }
}

function drawModal() {
  strokeWeight(1);
  fill(0, 150);
  rect(0, 0, width, height);

  fill(255);
  stroke(13, 67, 102);
  strokeWeight(1);
  rect(modalX, modalY, modalW, modalH);

  // Check Ticket
  if (currentOptionIndex === 0) {
    let ticketW = modalW * 0.6;
    let ticketH = modalH * 0.5;
    let ticketX = modalX + (modalW - ticketW) / 2;
    let ticketY = modalY + (modalH - ticketH) / 2;
    fill(255);
    stroke(0);
    rect(ticketX, ticketY, ticketW, ticketH, 10);
    stroke(150);
    for (let i = ticketX + 20; i < ticketX + ticketW - 20; i += 15) {
      line(i, ticketY + ticketH / 3, i + 8, ticketY + ticketH / 3);
    }
    noStroke();
    fill(0);
    textAlign(CENTER, TOP);
    textSize(18);
    text("Parking Ticket", ticketX + ticketW / 2, ticketY + 15);
    textSize(14);
    text("Zone: A3", ticketX + ticketW / 2, ticketY + ticketH / 3 + 15);
    text(
      "Time Issued: 14:32",
      ticketX + ticketW / 2,
      ticketY + ticketH / 3 + 35,
    );
    text(
      "Valid for 2 Hours",
      ticketX + ticketW / 2,
      ticketY + ticketH / 3 + 55,
    );
  }

  // Check License
  if (currentOptionIndex === 1) {
    let frameW = modalW * 0.7;
    let frameH = modalH * 0.5;
    let frameX = modalX + (modalW - frameW) / 2;
    let frameY = modalY + (modalH - frameH) / 2;
    stroke(13, 67, 102);
    strokeWeight(3);
    noFill();
    rect(frameX, frameY, frameW, frameH, 15);

    let plateW = frameW * 0.7;
    let plateH = frameH * 0.35;
    let plateX = frameX + (frameW - plateW) / 2;
    let plateY = frameY + (frameH - plateH) / 2;
    fill(240);
    stroke(0);
    rect(plateX, plateY, plateW, plateH, 8);
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(28);
    text("AB12 XYZ", plateX + plateW / 2, plateY + plateH / 2);

    let scanY = plateY + (frameCount % plateH);
    stroke(255, 0, 0);
    strokeWeight(2);
    line(plateX, scanY, plateX + plateW, scanY);

    noStroke();
    fill(13, 67, 102);
    textSize(18);
    textAlign(CENTER, TOP);
    text("Scanning License Plate...", frameX + frameW / 2, frameY - 30);
  }

  // Click Pen
  if (currentOptionIndex === 2) {
    let penCenterX = modalX + modalW / 2;
    let penCenterY = modalY + modalH / 2;
    stroke(0);
    strokeWeight(2);
    fill(50, 50, 120);
    rect(penCenterX - 100, penCenterY - 10, 200, 20, 10);
    fill(80);
    rect(penCenterX - 110, penCenterY - 6, 15, 12, 4);
    if (penExtended) {
      fill(30);
      triangle(
        penCenterX + 100,
        penCenterY - 6,
        penCenterX + 120,
        penCenterY,
        penCenterX + 100,
        penCenterY + 6,
      );
    }
    noStroke();
    fill(13, 67, 102);
    textAlign(CENTER, TOP);
    textSize(20);
    text("Click the Pen", modalX + modalW / 2, modalY + 60);

    let btnW = 120;
    let btnH = 40;
    let btnX = modalX + modalW / 2 - btnW / 2;
    let btnY = modalY + modalH - 100;
    fill(220);
    stroke(13, 67, 102);
    rect(btnX, btnY, btnW, btnH, 8);
    noStroke();
    fill(13, 67, 102);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("Click", btnX + btnW / 2, btnY + btnH / 2);

    penButtonX = btnX;
    penButtonY = btnY;
    penButtonW = btnW;
    penButtonH = btnH;
  }

  // Stamp Guest Log
  if (currentOptionIndex === 3) {
    let logW = modalW * 0.65;
    let logH = modalH * 0.55;
    let logX = modalX + (modalW - logW) / 2;
    let logY = modalY + (modalH - logH) / 2 - 20;
    fill(255);
    stroke(0);
    rect(logX, logY, logW, logH, 8);

    stroke(200);
    for (let y = logY + 40; y < logY + logH - 20; y += 30) {
      line(logX + 20, y, logX + logW - 20, y);
    }

    noStroke();
    fill(0);
    textAlign(CENTER, TOP);
    textSize(20);
    text("Guest Log", logX + logW / 2, logY + 10);

    textSize(16);
    textAlign(LEFT, CENTER);
    text("Name: Guest #" + guestIndex, logX + 40, logY + 70);
    text("Status: Pending", logX + 40, logY + 100);

    fill(120, 70, 40);
    rect(logX + logW - 80, logY - 30, 40, 30, 5);
    rect(logX + logW - 90, logY - 10, 60, 20, 5);

    if (logStamped) {
      push();
      translate(logX + logW / 2, logY + logH / 2);
      rotate(-0.3);
      stroke(200, 0, 0);
      strokeWeight(4);
      noFill();
      rect(-100, -25, 200, 50);
      noStroke();
      fill(200, 0, 0);
      textAlign(CENTER, CENTER);
      textSize(32);
      text("APPROVED", 0, 0);
      pop();
    }

    stampButtonW = 140;
    stampButtonH = 40;
    stampButtonX = modalX + modalW / 2 - stampButtonW / 2;
    stampButtonY = modalY + modalH - 80;
    let stampHovered =
      mouseX >= stampButtonX &&
      mouseX <= stampButtonX + stampButtonW &&
      mouseY >= stampButtonY &&
      mouseY <= stampButtonY + stampButtonH;
    fill(stampHovered ? [247, 247, 205] : 220);
    stroke(13, 67, 102);
    rect(stampButtonX, stampButtonY, stampButtonW, stampButtonH, 8);
    noStroke();
    fill(13, 67, 102);
    textAlign(CENTER, CENTER);
    textSize(16);
    text(
      "Stamp Log",
      stampButtonX + stampButtonW / 2,
      stampButtonY + stampButtonH / 2,
    );
  }

  // Talk Into Speaker
  if (currentOptionIndex === 4) {
    push();
    speakerW = modalW * 0.3;
    speakerH = modalH * 0.4;
    speakerX = modalX + (modalW - speakerW) / 2;
    speakerY = modalY + (modalH - speakerH) / 2;

    fill(180);
    stroke(0);
    strokeWeight(2);
    rect(speakerX, speakerY, speakerW, speakerH, 10);

    stroke(120);
    strokeWeight(2);
    for (let i = speakerY + 10; i < speakerY + speakerH - 10; i += 10) {
      line(speakerX + 10, i, speakerX + speakerW - 10, i);
    }

    noStroke();
    fill(0);
    textAlign(CENTER, TOP);
    textSize(18);
    text("Speaker", speakerX + speakerW / 2, speakerY - 30);

    let btnW = 140;
    let btnH = 40;
    let btnX = modalX + modalW / 2 - btnW / 2;
    let btnY = modalY + modalH - 80;
    let talkHovered =
      mouseX >= btnX &&
      mouseX <= btnX + btnW &&
      mouseY >= btnY &&
      mouseY <= btnY + btnH;
    fill(talkHovered ? [247, 247, 205] : 220);
    stroke(13, 67, 102);
    rect(btnX, btnY, btnW, btnH, 8);
    noStroke();
    fill(13, 67, 102);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Talk", btnX + btnW / 2, btnY + btnH / 2);

    speakerButtonX = btnX;
    speakerButtonY = btnY;
    speakerButtonW = btnW;
    speakerButtonH = btnH;
    pop();
  }

  // Draw speaker waves outside the block
  if (currentOptionIndex === 4 && speakerTalking) {
    push(); // <-- isolate wave styles
    let centerX = speakerX + speakerW / 2 + 50;
    let centerY = speakerY + speakerH / 2;
    noFill();
    stroke(255, 100, 0, 200);
    strokeWeight(3);
    for (let i = 1; i <= 3; i++) {
      let radius = speakerWaveFrame + i * 15;
      arc(centerX, centerY, radius * 2, radius * 2, -PI / 2, PI / 2);
    }
    pop(); // <-- restore after waves
    speakerWaveFrame += 1;
    if (speakerWaveFrame > 60) {
      speakerWaveFrame = 0;
    }
  }

  // Close button
  let closeHovered =
    mouseX >= closeX &&
    mouseX <= closeX + closeW &&
    mouseY >= closeY &&
    mouseY <= closeY + closeH;
  fill(closeHovered ? [247, 247, 205] : 220);
  stroke(13, 67, 102);
  rect(closeX, closeY, closeW, closeH);
  noStroke();
  fill(13, 67, 102);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("Close", closeX + closeW / 2, closeY + closeH / 2);
}

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
      showModal = false;
    }
    return;
  }
  if (!showModal) {
    logStamped = false;
    penExtended = false;
    speakerTalking = false;
  }
}

function bottomMenuMouseClicked() {
  let bottommenuW = 800;
  let bottommenuH = 200;
  let bottommenux = (width - bottommenuW) / 2;
  let bottommenuy = height - bottommenuH;
  let sqSize = bottommenuW / 5;

  for (let i = 0; i < 5; i++) {
    let sx = bottommenux + i * sqSize;
    let sy = bottommenuy + bottommenuH - sqSize;
    if (
      mouseX >= sx &&
      mouseX <= sx + sqSize &&
      mouseY >= sy &&
      mouseY <= sy + sqSize
    ) {
      if (!disabled[i]) {
        disabled[i] = true;
        clickHistory.push(i + 1);
        console.log(clickHistory);
      }
      currentOptionIndex = i;
      showModal = true;
      return;
    }
  }
}
