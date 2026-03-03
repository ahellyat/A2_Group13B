let clickHistory = []; // stores index values of buttons clicked (1-5)
let disabled = [false, false, false, false, false]; // flags for each button
let submissions = []; // stores all completed arrays
let triedToOpenGateWithoutSubmission = false;
// track incorrect pattern checks to darken background
let wrongCount = 0;
let bgColor;
let baseColor;
let isMatch;
let shapeArray = [
  "square",
  "square",
  "square",
  "triangle",
  "triangle",
  "triangle",
];
// modal state for when an option has been pressed
let showModal = false;
let modalX, modalY, modalW, modalH;
let closeX, closeY, closeW, closeH;
let guestIndex = 0; // which guest is currently being served

function setup() {
  createCanvas(1250, 680);

  // start with base background colour
  baseColor = color(212, 235, 250);
  bgColor = baseColor;
  // initialize shape array with 6 random shapes
  // Shuffle it
  for (let i = shapeArray.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [shapeArray[i], shapeArray[j]] = [shapeArray[j], shapeArray[i]];
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
  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "play") {
    runGame(); // your main gameplay function
  }
}

function runGame() {
  background(bgColor);

  // if complete, only draw the completion box; hide other UI elements
  if (submissions.length < 8) {
    fill(255);
    drawOptions();
    drawMessage();
    displayShapes();
    submitButton();
    displaySubmissionIndicators();
    displayCurrentGuest();

    // show click history just above the bottom menu
    let bottommenuW = 800;
    let bottommenuH = 200;
    let bottommenuy = height - bottommenuH;
    let historyY = bottommenuy - 30; // 30px above menu
    fill(13, 67, 102);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    let historyString = clickHistory.join(", ");
    text(historyString, width / 2, historyY);
  }
  if (showModal) {
    drawModal();
  }
  // show completion screen when all shapes have been checked
  displayCompletion();
}

function mousePressed() {
  if (gameState === "start") {
    handleStartClick();
  }

  modalMouseClicked();
  bottomMenuMouseClicked();
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
    if (clickHistory.length === 0) {
      triedToOpenGateWithoutSubmission = true;
      return; // stop further logic
    }
    triedToOpenGateWithoutSubmission = false;

    // save current array and reset
    if (clickHistory.length > 0) {
      guestIndex++;
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
        isMatch =
          patternToMatch.length === clickHistory.length &&
          patternToMatch.every((val, idx) => val === clickHistory[idx]);

        if (!isMatch) {
          wrongCount++;
          let darkGray = color(50);
          let factor = min(0.3 + wrongCount * 0.2, 0.9);
          bgColor = lerpColor(bgColor, darkGray, factor);
        } else {
          // lighten toward base color
          bgColor = lerpColor(bgColor, baseColor, 0.3);
        }
        // if it is a match we leave bgColor unchanged
      }
    }
    // reset for new array
    clickHistory = [];
    disabled = [false, false, false, false, false];
  }
}
