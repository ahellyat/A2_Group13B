function bottommenu() {
  let bottommenuW = 800;
  let bottommenuH = 200;
  let bottommenux = (width - bottommenuW) / 2;
  let bottommenuy = height - bottommenuH;

  // draw the base menu rectangle
  rect(bottommenux, bottommenuy, bottommenuW, bottommenuH);

  // divide the menu into 5 equal squares along its width
  let sqSize = bottommenuW / 5;
  // squares positioned at the bottom of the menu
  for (let i = 0; i < 5; i++) {
    let sqX = bottommenux + i * sqSize;
    let sqY = bottommenuy + bottommenuH - sqSize; // align squares bottom

    // determine hover/press state for this square
    let hovered =
      mouseX >= sqX &&
      mouseX <= sqX + sqSize &&
      mouseY >= sqY &&
      mouseY <= sqY + sqSize;
    let pressed = hovered && mouseIsPressed;

    // choose color based on interaction state or disabled status
    if (typeof disabled !== "undefined" && disabled[i]) {
      fill(200); // dimmed for disabled
    } else if (pressed) {
      fill(100);
    } else if (hovered) {
      fill(150);
    } else {
      fill(255);
    }
    rect(sqX, sqY, sqSize, sqSize);

    // draw centered text inside each square
    textAlign(CENTER, CENTER);
    textSize(16); // keep consistent size regardless of other draws
    fill(0); // black text
    stroke(0);
    strokeWeight(1);
    text(`Option ${i + 1}`, sqX + sqSize / 2, sqY + sqSize / 2);
    fill(255); // reset fill for next iteration
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
    fill(150);
  } else {
    fill(255);
  }
  stroke(0);
  strokeWeight(1);
  rect(submitX, submitY, submitSize, submitSize + 200);

  // draw centered "Submit" text
  textAlign(CENTER, CENTER);
  textSize(16); // explicit size for consistency
  fill(0); // black text
  stroke(0);
  strokeWeight(1);
  text("Submit", submitX + submitSize / 2, submitY + (submitSize + 200) / 2);
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

function displayCompletion() {
  // show completion square when all 6 shapes have been checked
  // 2 initial submissions + 6 pattern checks = 8 total submissions

  if (submissions.length >= 8) {
    let squareSize = 400;
    let squareX = width / 2 - squareSize / 2;
    let squareY = height / 2 - squareSize / 2;
    // no full white background; just draw the completion box
    fill(255);
    stroke(0);
    strokeWeight(2);
    rect(squareX, squareY, squareSize, squareSize);

    // draw "complete" text in the center
    fill(0);
    stroke(0);
    strokeWeight(1);
    textAlign(CENTER, CENTER);
    textSize(48);
    text("Complete", width / 2, height / 2);
  }
}
