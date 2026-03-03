function drawMessage() {
  let message = "";
  let yPos = height / 8;

  // ------------------------
  // Determine Message
  // ------------------------

  if (triedToOpenGateWithoutSubmission) {
    message = "I can't let anyone in yet! I didn't do the steps I need to do.";
  } else if (submissions.length < 1) {
    message =
      "It's my first day. I'm going to choose the order of how I want to do things.";
  } else if (submissions.length === 1) {
    message =
      "That felt like the right routine to handle guests with square licenses. How about the triangle ones?\n" +
      "Let me decide a new order.";
  } else if (submissions.length > 1 && wrongCount === 0) {
    message =
      "Looks like there's a couple more guests waiting to get in. Let me do the right routine for each of them.";
  } else if (submissions.length > 1 && wrongCount > 0 && !isMatch) {
    message =
      "Oh no. That felt wrong. I have to make sure I'm serving them properly.\n" +
      "Let me try doing the right shape routine again";
  } else if (submissions.length > 1 && wrongCount > 0 && isMatch) {
    message =
      "Phew! I'm setting things right. Now my guests will be happy again!\n" +
      "Let's keep going.";
  }

  if (message === "") return;

  // ------------------------
  // Draw Speech Bubble SAFELY
  // ------------------------

  push(); // SAVE ALL CURRENT DRAW SETTINGS

  textAlign(CENTER, CENTER);
  textSize(16);

  let padding = 10;
  let maxWidth = width * 0.7;

  // Calculate text box height properly for multiline text
  let textBoxHeight = textLeading() * message.split("\n").length + 20;

  rectMode(CENTER);
  noStroke();
  fill(247, 247, 205); //yellow

  rect(width / 2, yPos, maxWidth, textBoxHeight + padding, 25);

  // Draw Text
  noStroke();
  fill(13, 67, 102);
  text(message, width / 2, yPos, maxWidth - 40);

  pop(); // RESTORE previous rectMode, stroke, textAlign, etc.
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
  let shapeY = height / 2; // 50px from top
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
  let indicatorSize = 20;
  let startX = 45;
  let startY = 90;
  let spacing = 40;

  push();

  textAlign(CENTER, CENTER);
  textSize(12);
  noStroke();
  fill(13, 67, 102);
  text("Guest\nLog", width / 20 - 10, height / 11);

  stroke(0);
  strokeWeight(2);

  for (let i = 0; i < submissions.length; i++) {
    let shapeType;

    if (i === 0) {
      shapeType = "square";
    } else if (i === 1) {
      shapeType = "triangle";
    } else {
      shapeType = shapeArray[i - 2];
    }

    let y = startY + i * spacing;

    fill(0);

    if (shapeType === "square") {
      rect(startX, y, indicatorSize, indicatorSize);
    } else if (shapeType === "triangle") {
      let h = indicatorSize * 0.866;
      triangle(
        startX + indicatorSize / 2,
        y - h / 2,
        startX,
        y + h / 2,
        startX + indicatorSize,
        y + h / 2,
      );
    }

    // Draw pressed order hint for first 2
    // in displaySubmissionIndicators()
    if (i < 2 && submissions.length > i) {
      let orderArray = submissions[i]; // first 2 submissions
      for (let j = 0; j < orderArray.length; j++) {
        fill(255, 0, 0);
        noStroke();
        textSize(12);
        text(orderArray[j], startX + indicatorSize + 10 + j * 15, y);
        // +1 because indices start at 0
      }
    }
  }

  pop();
}

function displayCurrentGuest() {
  let shape;

  if (guestIndex === 0 && submissions.length === 0) {
    shape = "square";
    // Car body (blue)
    fill(40, 120, 220);
  } else if (guestIndex === 1 && submissions.length === 1) {
    shape = "triangle";
    fill(252, 3, 3); //red
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

  //draw guest name
  if (guestIndex === 0) {
    textAlign(CENTER, CENTER);
    textSize(16); // explicit size for consistency
    fill(13, 67, 102); // dark blue text
    noStroke();
    text("Guest #1: Doug", carX, carY - carH - 30);
  } else if (guestIndex === 1) {
    textSize(16); // explicit size for consistency
    fill(13, 67, 102); // dark blue text
    noStroke();
    text("Guest #2: Kitty", carX, carY - carH - 30);
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
