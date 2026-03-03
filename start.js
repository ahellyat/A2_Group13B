// start.js

let gameState = "start"; // "start" or "play"

function drawStartScreen() {
  background(212, 235, 250);
  drawTitle();
  drawPattern();
  drawInstructions();
  drawBeginButton();
}

function drawTitle() {
  fill(13, 67, 102);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(48);
  text("*Paws Parking Routine*", width / 2, height / 2 - 200);
}

function drawPattern() {
  let carX = width / 2;
  let carY = height / 3;

  let carW = 200;
  let carH = 80;

  // -----------------
  // Draw Car
  // -----------------

  stroke(13, 67, 102);
  strokeWeight(1);

  // Car body (blue)
  fill(40, 120, 220);
  rect(carX - carW / 2, carY - carH / 2, carW, carH, 20);

  // Wheels
  fill(30);
  ellipse(carX - 70, carY + carH / 2, 40, 40);
  ellipse(carX + 70, carY + carH / 2, 40, 40);

  let centerX = width / 2;
  let y = height / 2 - 120;
  let size = 50;
  let spacing = 30;

  stroke(13, 67, 102);
  strokeWeight(1);
  fill(255);

  // Square
  rect(centerX - spacing - size / 2, y - size / 2, size, size);

  // Triangle
  let h = size * 0.87;
  triangle(
    centerX + spacing,
    y - h / 2,
    centerX + spacing - size / 2,
    y + h / 2,
    centerX + spacing + size / 2,
    y + h / 2,
  );
}

function drawInstructions() {
  fill(13, 67, 102);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);

  let instructions =
    "You are a parking booth attendant. Animals pull up.\n" +
    "You'll develop a specific way of handling each of them.\n" +
    "Let's start your daily routine(s)!";

  text(instructions, width / 2, height / 2);
}

function drawBeginButton() {
  let btnW = 200;
  let btnH = 60;
  let btnX = width / 2 - btnW / 2;
  let btnY = height / 2 + 120;

  let hovered =
    mouseX >= btnX &&
    mouseX <= btnX + btnW &&
    mouseY >= btnY &&
    mouseY <= btnY + btnH;

  if (hovered) {
    fill(247, 247, 205);
  } else {
    fill(255);
  }

  stroke(13, 67, 102);
  strokeWeight(1);
  rect(btnX, btnY, btnW, btnH, 10);

  fill(13, 67, 102);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(20);
  text("Begin Shift", width / 2, btnY + btnH / 2);
}

function handleStartClick() {
  let btnW = 200;
  let btnH = 60;
  let btnX = width / 2 - btnW / 2;
  let btnY = height / 2 + 120;

  if (
    mouseX >= btnX &&
    mouseX <= btnX + btnW &&
    mouseY >= btnY &&
    mouseY <= btnY + btnH
  ) {
    gameState = "play";
  }
}
