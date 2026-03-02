let clickHistory = []; // stores index values of buttons clicked (1-5)
let disabled = [false, false, false, false, false]; // flags for each button
let submissions = []; // stores all completed arrays
let showCorrect = false; // flag to display "Correct" message
let showWrong = false; // flag to display "Wrong" message
let shapeArray = []; // array with 6 random shapes (square or triangle)

function setup() {
  createCanvas(1200, 800);

  // initialize shape array with 6 random shapes
  for (let i = 0; i < 6; i++) {
    shapeArray.push(random() < 0.5 ? "square" : "triangle");
  }
  console.log("Shape array:", shapeArray);
}

function draw() {
  background(220);
  fill(255);
  bottommenu();
  displayShapes();
  submitButton();
  displaySubmissionIndicators();

  // show click history in the center of the canvas
  fill(0);
  stroke(0);
  strokeWeight(1);
  textAlign(CENTER, CENTER);
  textSize(24);
  let historyString = clickHistory.join(", ");
  text(historyString, width / 2, height / 2);

  // show "Correct" or "Wrong" at the top based on pattern matching
  if (showCorrect) {
    fill(0);
    stroke(0);
    strokeWeight(1);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Correct", width / 2, 50);
  } else if (showWrong) {
    fill(0);
    stroke(0);
    strokeWeight(1);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Wrong", width / 2, 50);
  }

  // show completion screen when all shapes have been checked
  displayCompletion();
}

function displayShapes() {
  // only show shapes if both submissions have been recorded
  if (submissions.length < 2) {
    return;
  }

  let shapeSize = 60;
  let rectWidth = 800;
  let rectStartX = (width - rectWidth) / 2;
  let shapeY = height - 240; // 20px above the rect
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
    background(255);
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

function mousePressed() {
  // reuse same dimensions as bottommenu to detect which square was clicked
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
        // mark button disabled and record click
        disabled[i] = true;
        clickHistory.push(i + 1);
        console.log(clickHistory);
      }
      return;
    }
  }

  // check for submit button click
  let submitSize = 100;
  let submitHeight = submitSize + 200;
  let submitX = width - submitSize - 10;
  let submitY = height / 2 - submitHeight / 2;
  if (
    mouseX >= submitX &&
    mouseX <= submitX + submitSize &&
    mouseY >= submitY &&
    mouseY <= submitY + submitHeight
  ) {
    // save current array and reset
    if (clickHistory.length > 0) {
      submissions.push([...clickHistory]);
      console.log("Saved submission:", clickHistory);
      console.log("All submissions:", submissions);

      // pattern matching logic after first two submissions
      if (submissions.length >= 3) {
        let highlightedIndex = submissions.length - 3; // index of pattern to check
        let patternToMatch;

        // determine which pattern to match against based on highlighted shape
        if (shapeArray[highlightedIndex] === "triangle") {
          patternToMatch = submissions[1]; // triangle pattern
        } else {
          patternToMatch = submissions[0]; // square pattern
        }

        // check if current submission matches the pattern
        let isMatch =
          patternToMatch.length === clickHistory.length &&
          patternToMatch.every((val, idx) => val === clickHistory[idx]);

        showCorrect = isMatch;
        showWrong = !isMatch;
      } else {
        showCorrect = false;
        showWrong = false;
      }
    }
    // reset for new array
    clickHistory = [];
    disabled = [false, false, false, false, false];
  }
}
