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
  fill(0); // black text
  stroke(0);
  strokeWeight(1);
  textSize(16);
  text("Submit", submitX + submitSize / 2, submitY + (submitSize + 200) / 2);
}
