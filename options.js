//this file includes all the functions that handle the bottom option menu,
//such as detecting the mouse clicks and drawing the modals
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
  // draw the base menu rectangle
  rect(bottommenux, bottommenuy, bottommenuW, bottommenuH);

  // divide the menu into 5 equal squares along its width
  let sqSize = bottommenuW / 5;
  // squares positioned at the bottom of the menu
  for (let i = 0; i < 5; i++) {
    stroke(13, 67, 102);
    strokeWeight(1);
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
      fill(247, 247, 205);
    } else {
      fill(255);
    }
    rect(sqX, sqY, sqSize, sqSize);

    // draw centered text inside each square
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16); // keep consistent size regardless of other draws
    fill(13, 67, 102); // dark blue
    text(`Option ${i + 1}`, sqX + sqSize / 2, sqY + sqSize / 2);
    fill(255); // reset fill for next iteration
  }
}
function drawModal() {
  // darken entire screen with semi-transparent black
  noStroke();
  fill(0, 150);
  rect(0, 0, width, height);

  // white rectangle in center
  fill(255);
  stroke(13, 67, 102);
  strokeWeight(1);
  rect(modalX, modalY, modalW, modalH);

  // close button in top-right of modal, highlight on hover
  let closeHovered =
    mouseX >= closeX &&
    mouseX <= closeX + closeW &&
    mouseY >= closeY &&
    mouseY <= closeY + closeH;
  if (closeHovered) {
    fill(247, 247, 205); // yellow when hovering
  } else {
    fill(220);
  }
  stroke(13, 67, 102);
  rect(closeX, closeY, closeW, closeH);
  fill(13, 67, 102);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);
  text("Close", closeX + closeW / 2, closeY + closeH / 2);
}

function modalMouseClicked() {
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
}

function bottomMenuMouseClicked() {
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
}
