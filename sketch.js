let clickHistory = []; // stores index values of buttons clicked (1-5)
let disabled = [false, false, false, false, false]; // flags for each button
let submissions = []; // stores all completed arrays
// track incorrect pattern checks to darken background
let wrongCount = 0;
let bgColor;
let shapeArray = []; // array with 6 random shapes (square or triangle)

// modal state for when an option has been pressed
let showModal = false;
let modalX, modalY, modalW, modalH;
let closeX, closeY, closeW, closeH;

function setup() {
  createCanvas(1200, 800);

  // start with base background colour
  bgColor = color(102, 178, 220);

  // initialize shape array with 6 random shapes
  for (let i = 0; i < 6; i++) {
    shapeArray.push(random() < 0.5 ? "square" : "triangle");
  }
  console.log("Shape array:", shapeArray);

  // configure modal dimensions once
  modalW = 600;
  modalH = 400;
  modalX = (width - modalW) / 2;
  modalY = (height - modalH) / 2;
  closeW = 80;
  closeH = 40;
  // position close button near top-right of modal with 10px padding
  closeX = modalX + modalW - closeW - 10;
  closeY = modalY + 10;
}

function draw() {
  background(bgColor);

  // if complete, only draw the completion box; hide other UI elements
  if (submissions.length < 8) {
    fill(255);
    bottommenu();
    displayShapes();
    submitButton();
    displaySubmissionIndicators();

    // show click history just above the bottom menu
    let bottommenuW = 800;
    let bottommenuH = 200;
    let bottommenuy = height - bottommenuH;
    let historyY = bottommenuy - 20; // raised up by ~15px from previous position
    fill(0);
    stroke(0);
    strokeWeight(1);
    textAlign(CENTER, CENTER);
    textSize(24);
    let historyString = clickHistory.join(", ");
    text(historyString, width / 2, historyY);
  }

  // show completion screen when all shapes have been checked
  displayCompletion();

  // draw modal overlay if active
  if (showModal) {
    // darken entire screen with semi-transparent black
    noStroke();
    fill(0, 150);
    rect(0, 0, width, height);

    // white rectangle in center
    fill(255);
    stroke(0);
    strokeWeight(2);
    rect(modalX, modalY, modalW, modalH);

    // close button in top-right of modal, highlight on hover
    let closeHovered =
      mouseX >= closeX &&
      mouseX <= closeX + closeW &&
      mouseY >= closeY &&
      mouseY <= closeY + closeH;
    if (closeHovered) {
      fill(180); // darker grey when hovering
    } else {
      fill(220);
    }
    stroke(0);
    rect(closeX, closeY, closeW, closeH);
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Close", closeX + closeW / 2, closeY + closeH / 2);
  }
}

function mousePressed() {
  // if the modal is showing, only allow the close button to be pressed
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
      // show the modal when any option is clicked
      showModal = true;
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

        if (!isMatch) {
          wrongCount++;
          // progressively darken the background toward dark gray more aggressively
          let darkGray = color(50);
          // increase the interpolation factor as wrongCount grows, but clamp at 0.9
          let factor = min(0.3 + wrongCount * 0.2, 0.9);
          bgColor = lerpColor(bgColor, darkGray, factor);
        }
        // if it is a match we leave bgColor unchanged
      }
    }
    // reset for new array
    clickHistory = [];
    disabled = [false, false, false, false, false];
  }
}
