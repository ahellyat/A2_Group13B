let clickHistory = [];
let disabled = [false, false, false, false, false];
let submissions = [];
let triedToOpenGateWithoutSubmission = false;
let wrongCount = 0;
let isMatch;
let gameOver = false;
// Each entry is "square", "triangle", or "none" (no shape = player decides freely)
let shapeArray = ["square", "square", "triangle", "triangle", "none", "none"];
let showModal = false;
let modalX, modalY, modalW, modalH;
let closeX, closeY, closeW, closeH;
let guestIndex = 0;

// Feedback shape shown on screen after guests 1 & 2 submit
let showFeedbackShape = false;
let feedbackShapeType = ""; // "square" or "triangle"
let feedbackShapeTimer = 0; // counts down frames

// Weather system
let raindrops = [];
let lightningTimer = 0;
let lightningFlash = false;
let thunderbolts = [];

// ── Car animation ──
// Frozen display props — locked at the moment a car starts entering
let frozenShape = "square";
let frozenCarColor;
let frozenAnimalName = "dog";
let frozenGuestLabel = "Guest #1: Doug";

let carAnimX; // current rendered X of car
let carState = "entering"; // "entering" | "waiting" | "raising" | "exiting"
let carStopX; // where the car parks
let gateAngle = 0; // 0 = horizontal arm, -HALF_PI = fully raised

function setup() {
  createCanvas(1250, 680);

  carStopX = width * 0.54; // car rests just left of the booth
  carAnimX = -200; // start off-screen left

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

  // Set initial frozen props for the very first car
  refreshFrozenCar();
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
    // Guest 1: square shape shown on car
    frozenShape = "square";
    frozenCarColor = color(40, 120, 220);
    frozenGuestLabel = "Guest #1: Doug";
    frozenAnimalName = animalList[0];
  } else if (submissions.length === 1) {
    // Guest 2: triangle shape shown on car
    frozenShape = "triangle";
    frozenCarColor = color(220, 60, 60);
    frozenGuestLabel = "Guest #2: Kitty";
    frozenAnimalName = animalList[1];
  } else {
    let shapeIndex = submissions.length - 2;
    frozenShape = shapeArray[shapeIndex];
    // "none" cars get a neutral grey colour
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

function updateCarAnim() {
  if (carState === "entering") {
    carAnimX = lerp(carAnimX, carStopX, 0.055);
    if (abs(carAnimX - carStopX) < 0.8) {
      carAnimX = carStopX;
      carState = "waiting";
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
      // Reset for next guest
      carAnimX = -200;
      gateAngle = 0;
      carState = "entering";
      // clickHistory + disabled are already cleared at submit time
      refreshFrozenCar();
    }
  }
}

function drawWeather() {
  if (wrongCount === 0) {
    drawSunny();
  } else if (wrongCount === 1) {
    drawCloudy();
  } else if (wrongCount === 2) {
    drawRain(1.0);
  } else {
    drawRain(1.0);
    drawThunder();
  }
}

// Stage 2: overcast clouds only, no rain
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

function runGame() {
  let skyColor;
  if (wrongCount === 0) skyColor = color(212, 235, 250);
  else if (wrongCount === 1) skyColor = color(175, 188, 205);
  else if (wrongCount === 2) skyColor = color(120, 135, 152);
  else skyColor = color(72, 82, 98);
  background(skyColor);

  // Game over — draw the scene then overlay and stop
  if (gameOver) {
    drawWeather();
    drawRoad();
    drawGameOver();
    return;
  }

  updateCarAnim();

  drawWeather();
  drawRoad();

  // Tick feedback shape timer
  if (showFeedbackShape) {
    feedbackShapeTimer--;
    if (feedbackShapeTimer <= 0) showFeedbackShape = false;
    drawFeedbackShape();
  }

  if (submissions.length < 8) {
    fill(255);
    drawOptions();
    drawMessage();
    displayShapes();
    // Only allow submit + menu interaction while car is waiting
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
  }
  drawFog();
  if (showModal) drawModal();
  displayCompletion();
}

function mousePressed() {
  if (gameState === "start") handleStartClick();

  // Block all interaction after game over
  if (gameOver) return;

  // Block modal/menu interactions during animation
  if (carState !== "waiting") return;

  // When a modal is open, only process modal clicks — block everything else
  if (showModal) {
    modalMouseClicked();
    return;
  }

  modalMouseClicked();
  bottomMenuMouseClicked();

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

    guestIndex++;
    submissions.push([...clickHistory]);
    console.log("Saved submission:", clickHistory);
    console.log("All submissions:", submissions);

    if (submissions.length === 1) {
      // Guest 1 just submitted — show square as feedback
      showFeedbackShape = true;
      feedbackShapeType = "square";
      feedbackShapeTimer = 180; // ~3 seconds at 60fps
    } else if (submissions.length === 2) {
      // Guest 2 just submitted — show triangle as feedback
      showFeedbackShape = true;
      feedbackShapeType = "triangle";
      feedbackShapeTimer = 180;
    } else if (submissions.length >= 3) {
      let highlightedIndex = submissions.length - 3;
      let guestShape = shapeArray[highlightedIndex];

      if (guestShape === "none") {
        // No shape = player may click anything; always a match
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
        if (wrongCount >= 4) gameOver = true;
      } else if (wrongCount > 0) wrongCount = max(0, wrongCount - 1);
    }

    // Reset history immediately so the menu is clean when the next car arrives
    clickHistory = [];
    disabled = [false, false, false, false, false];
    tickGameClock();
    carState = "raising";
  }
}

function drawGameOver() {
  // Dark semi-transparent overlay
  noStroke();
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);

  // Red flicker vignette
  fill(120, 0, 0, 60);
  rect(0, 0, width, height);

  // Card
  let cW = 520,
    cH = 300;
  let cX = width / 2 - cW / 2;
  let cY = height / 2 - cH / 2;

  // Card shadow
  fill(0, 0, 0, 80);
  noStroke();
  rect(cX + 8, cY + 8, cW, cH, 14);

  // Card body
  fill(22, 22, 28);
  stroke(180, 20, 20);
  strokeWeight(3);
  rect(cX, cY, cW, cH, 12);

  // Red top bar
  fill(160, 20, 20);
  noStroke();
  rect(cX, cY, cW, 48, 12, 12, 0, 0);

  // Title
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("SHIFT OVER", width / 2, cY + 24);

  // Icon — rain cloud
  let ix = width / 2,
    iy = cY + 100;
  fill(100, 110, 130);
  noStroke();
  ellipse(ix - 20, iy, 52, 38);
  ellipse(ix + 18, iy - 4, 60, 44);
  ellipse(ix + 48, iy + 2, 40, 32);
  fill(80, 90, 108);
  rect(ix - 42, iy + 10, 100, 24, 0, 0, 6, 6);
  // Rain drops
  stroke(150, 180, 220, 200);
  strokeWeight(2);
  for (let [dx, dy] of [
    [-28, 18],
    [-12, 24],
    [4, 18],
    [20, 24],
    [36, 18],
  ]) {
    line(ix + dx, iy + dy, ix + dx - 2, iy + dy + 10);
  }

  // Message
  noStroke();
  fill(210, 210, 220);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(
    "Too many mistakes — the guests have lost patience.",
    width / 2,
    cY + 188,
  );

  // Sub-message
  fill(140, 140, 160);
  textSize(13);
  text("Refresh the page to try again.", width / 2, cY + 218);

  // Bottom rule
  stroke(80, 20, 20);
  strokeWeight(1);
  line(cX + 30, cY + cH - 28, cX + cW - 30, cY + cH - 28);
  noStroke();
  fill(100, 20, 20);
  textSize(11);
  text("PAWS PARKING AUTHORITY", width / 2, cY + cH - 14);
}

// ── Feedback shape — shown briefly after guests 1 & 2 submit ──────
function drawFeedbackShape() {
  let alpha =
    feedbackShapeTimer > 60 ? 255 : map(feedbackShapeTimer, 0, 60, 0, 255); // fade out in last second

  let cx = width / 2;
  let cy = height / 2 - 60;
  let sz = 90;

  push();

  // Glow halo
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

  // Shape
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

  // Label beneath shape
  noStroke();
  fill(13, 67, 102, alpha);
  textAlign(CENTER, CENTER);
  textSize(14);
  let label = feedbackShapeType === "square" ? "Ritual 1" : "Ritual 2";
  text(label, cx, cy + sz * 0.75);

  pop();
}
