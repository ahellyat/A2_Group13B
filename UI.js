function drawHUD() {
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16); // keep consistent size regardless of other draws
  fill(13, 67, 102); // dark blue
  if (submissions.length < 1 && !triedToOpenGateWithoutSubmission) {
    text(
      "It's my first day. I'm going to choose the order of how I want to do things.",
      width / 2,
      height / 8,
    );
  } else if (submissions.length === 1 && !triedToOpenGateWithoutSubmission) {
    text(
      "That felt like the right routine to handle guests with square licenses. How about the triangle ones? \n" +
        "Let me decide a new order.",
      width / 2,
      height / 8,
    );
  } else if (
    submissions.length > 1 &&
    wrongCount === 0 &&
    !triedToOpenGateWithoutSubmission
  ) {
    text(
      "Looks like there's a couple more guests waiting to get in. Let me do the right routine for each of them.",
      width / 2,
      height / 5,
    );
  } else if (
    submissions.length > 1 &&
    wrongCount > 0 &&
    !isMatch &&
    !triedToOpenGateWithoutSubmission
  ) {
    text(
      "Oh no. That felt wrong. I have to make sure I'm serving them properly. \n" +
        "Let me try doing the right shape routine again",
      width / 2,
      height / 5,
    );
  } else if (
    submissions.length > 1 &&
    wrongCount > 0 &&
    isMatch &&
    !triedToOpenGateWithoutSubmission
  ) {
    text(
      "Phew! I'm setting things right. Now my guests will be happy again!\n" +
        "Let's keep going.",
      width / 2,
      height / 5,
    );
  } else if (triedToOpenGateWithoutSubmission) {
    text(
      "I can't let anyone in yet! I didn't do the steps I need to do.",
      width / 2,
      height / 8,
    );
    return; // stop here so other messages don’t override
  }
}

function submitButton() {
  let submitSize = 100;
  let submitHeight = submitSize + 200;
  let submitX = width - submitSize - 10;
  let submitY = height / 2 - submitHeight / 2;
  let hovered =
    mouseX >= submitX &&
    mouseX <= submitX + submitSize &&
    mouseY >= submitY &&
    mouseY <= submitY + submitHeight;
  let pressed = hovered && mouseIsPressed;

  // choose color based on interaction state
  if (pressed) {
    fill(100);
  } else if (hovered) {
    fill(247, 247, 205);
  } else {
    fill(255);
  }
  stroke(13, 67, 102);
  strokeWeight(1);
  rect(submitX, submitY, submitSize, submitSize + 200);

  // draw centered "Submit" text
  textAlign(CENTER, CENTER);
  textSize(16); // explicit size for consistency
  fill(13, 67, 102); // dark blue text
  noStroke();
  text(
    "Open \n" + "Parking \n" + "Lot Gate\n",
    submitX + submitSize / 2,
    submitY + (submitSize + 200) / 2,
  );
}

function displayShapes() {
  // only show shapes if both submissions have been recorded
  if (submissions.length < 2) {
    return;
  }

  let shapeSize = 60;
  let rectWidth = 800;
  let rectStartX = (width - rectWidth) / 2;
  // move the row of shapes to the top of the canvas instead of the bottom
  let shapeY = 50; // 50px from top
  let spacing = rectWidth / 6;
  let highlightedIndex = submissions.length - 2; // index of shape to highlight

  stroke(0);
  strokeWeight(2);

  for (let i = 0; i < shapeArray.length; i++) {
    let shapeX = rectStartX + (i + 0.5) * spacing;

    // highlight with black if this is the current submission's shape, otherwise white
    if (i === highlightedIndex) {
      fill(0);
    } else {
      fill(255);
    }

    if (shapeArray[i] === "square") {
      // draw square centered at shapeX, shapeY
      rect(
        shapeX - shapeSize / 2,
        shapeY - shapeSize / 2,
        shapeSize,
        shapeSize,
      );
    } else if (shapeArray[i] === "triangle") {
      // draw triangle centered at shapeX, shapeY
      let h = shapeSize * 0.866; // height for equilateral triangle
      triangle(
        shapeX,
        shapeY - h / 2,
        shapeX - shapeSize / 2,
        shapeY + h / 2,
        shapeX + shapeSize / 2,
        shapeY + h / 2,
      );
    }
  }
}

function displaySubmissionIndicators() {
  let indicatorSize = 50;
  let indicatorX = 30;
  let squareY = 80;
  let triangleY = squareY + indicatorSize + 50;

  fill(0);
  stroke(0);
  strokeWeight(2);

  // draw square if first submission exists
  if (submissions.length >= 1) {
    rect(indicatorX, squareY, indicatorSize, indicatorSize);
  }

  // draw triangle if second submission exists
  if (submissions.length >= 2) {
    let h = indicatorSize * 0.866;
    triangle(
      indicatorX + indicatorSize / 2,
      triangleY - h / 2,
      indicatorX,
      triangleY + h / 2,
      indicatorX + indicatorSize,
      triangleY + h / 2,
    );
  }
}
function displayCurrentGuest() {
  let shape;

  if (guestIndex === 0 && submissions.length === 0) {
    shape = "square";
  } else if (guestIndex === 1 && submissions.length === 1) {
    shape = "triangle";
  } else {
    return;
  }

  let carX = width / 2;
  let carY = height / 2;

  let carW = 220;
  let carH = 100;

  // -----------------
  // Draw Car
  // -----------------

  stroke(0);
  strokeWeight(2);

  // Car body (blue)
  fill(40, 120, 220);
  rect(carX - carW / 2, carY - carH / 2, carW, carH, 20);

  // Wheels
  fill(30);
  ellipse(carX - 70, carY + carH / 2, 40, 40);
  ellipse(carX + 70, carY + carH / 2, 40, 40);

  // -----------------
  // Draw Shape Inside Car Body (Centered)
  // -----------------

  let size = 60;

  fill(255);
  stroke(0);

  if (shape === "square") {
    rect(carX - size / 2, carY - size / 2, size, size);
  } else if (shape === "triangle") {
    let h = size * 0.866;
    triangle(
      carX,
      carY - h / 2,
      carX - size / 2,
      carY + h / 2,
      carX + size / 2,
      carY + h / 2,
    );
  }
}

function displayCompletion() {
  // show completion square when all 6 shapes have been checked
  // 2 initial submissions + 6 pattern checks = 8 total submissions

  if (submissions.length >= 8) {
    let squareSize = 400;
    let squareX = width / 2 - squareSize / 2;
    let squareY = height / 2 - squareSize / 2;
    // no full white background; just draw the completion box
    fill(255);
    stroke(13, 67, 102);
    strokeWeight(1);

    rect(squareX, squareY, squareSize, squareSize);

    // draw "complete" text in the center
    fill(13, 67, 102);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(48);
    text("Complete", width / 2, height / 2);
  }
}
