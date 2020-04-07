let response = 0;
let boardSize = 0;
let coordinate = 0;
let gameState = 0;
let x = 0;
let y = 0;
let playerXorO = "";
let playerTurn = false;
let playerSet = false;

radio.setGroup(255);

input.onButtonPressed(Button.A, function() {
  // Game play: select coordinates
  if (gameState == 3 && playerTurn) {
    x = x + 1;
    basic.pause(500);

    if (boardSize <= x) {
      x = 0;
      basic.showNumber(x);
      basic.pause(500);
    } else {
      basic.showNumber(x);
      basic.pause(500);
    }
  }
});

input.onButtonPressed(Button.B, function() {
  // Game play: select coordinates
  if (gameState == 3 && playerTurn) {
    y++;
    basic.pause(500);
    if (boardSize <= y) {
      y = 0;
      basic.showNumber(y);
      basic.pause(500);
    } else {
      basic.showNumber(y);
      basic.pause(500);
    }
  }
});

input.onButtonPressed(Button.AB, function() {
  // Game play: confirm coordinates
  if (gameState == 3 && playerTurn) {
    let coordinate = boardSize * y + x;
    basic.pause(500);

    radio.sendString("c" + coordinate);
    basic.pause(500);

    basic.showString("(" + x + "," + y + ")");
    basic.pause(500);

    //housekeeping
    x = 0;
    y = 0;
    playerTurn = false;

    basic.clearScreen();
    basic.pause(500);
  }
});

radio.onReceivedString(function(receivedString) {
  let incoming = receivedString;
  basic.pause(500);

  let turn = receivedString.substr(1, 4);
  //basic.showString(receivedString);

  // Display assigned player after pairing success
  if (incoming[0].compare("p") == 0) {
    let device = incoming.slice(2, incoming.length);
    if (device.compare(control.deviceName()) == 0 && playerSet == false) {
      if (incoming[1].compare("A") == 0) {
        playerSet = true;
        basic.showLeds(`
          # # . . #
          # . # . #
          # # . . #
          # . . . #
          # . . . #
          `);
        basic.pause(500);
      }
      if (incoming[1].compare("B") == 0) {
        playerSet = true;
        basic.showLeds(`
          # # . # #
          # . # . #
          # # . # #
          # . . # .
          # . . # #
          `);
        basic.pause(500);
      }
    }
  }
  // Display active player turn
  if (turn.compare("Turn") == 0) {
    if (incoming[0].compare(playerXorO) == 0) {
      basic.showString(incoming);
      basic.pause(500);

      if (playerXorO.compare("X") == 0) {
        basic.showIcon(IconNames.No);
        basic.pause(2000);
        basic.showNumber(x);
      } else {
        basic.showIcon(IconNames.Square);
        basic.pause(2000);
        basic.showNumber(x);
      }
      playerTurn = true;
    } else {
      playerTurn = false;
      basic.clearScreen();
      basic.pause(500);
    }
  }
  // Set player as X
  if (incoming[0].compare("X") == 0 && incoming.length >= 6) {
    let message = incoming.slice(1, incoming.length);

    if (message.compare(control.deviceName()) == 0) {
      playerXorO = "X";
      //basic.showIcon(IconNames.No);
    }
  }
  // Set player as O
  if (incoming[0].compare("O") == 0 && incoming.length >= 6) {
    let message = incoming.slice(1, incoming.length);

    if (message.compare(control.deviceName()) == 0) {
      playerXorO = "O";
      //basic.showIcon(IconNames.Square);
    }
  }
  // Display board size
  if (incoming[0].compare("b") == 0) {
    boardSize = parseInt(incoming.slice(1, incoming.length));
    basic.showString(incoming);
  }
  // Display Win icon
  if (incoming[0].compare("W") == 0 && incoming.length >= 6) {
    let message = incoming.slice(1, incoming.length);

    if (message.compare(control.deviceName()) == 0) {
      basic.showLeds(`
    # . # . #
    # . # . #
    # . # . #
    # . # . #
    . # . # .
    `);
      basic.pause(5000);
      basic.clearScreen();
    }
  }
  // Display Lose icon
  if (incoming[0].compare("L") == 0 && incoming.length >= 6) {
    let message = incoming.slice(1, incoming.length);

    if (message.compare(control.deviceName()) == 0) {
      basic.showLeds(`
      . # . . .
      . # . . .
      . # . . .
      . # . . .
      . # # # #
      `);
      basic.pause(5000);
      basic.clearScreen();
    }
  }
  // Display Draw icon
  if (incoming[0].compare("D") == 0) {
    basic.showLeds(`
    . # # # .
    . # . . #
    . # . . #
    . # . . #
    . # # # .
    `);
    basic.pause(5000);
    basic.clearScreen();
  }
  // Clear screen
  if (incoming[0].compare("C") == 0) {
    basic.clearScreen();
  }
});

radio.onReceivedNumber(function(receivedNumber) {
  // Game state = 0
  if (receivedNumber == 0) {
    //basic.showString("GState" + receivedNumber);
    //basic.showString("Select from game controller");
    gameState = 0;
  }

  // Game state = 1
  if (receivedNumber == 1) {
    //basic.showString("GState" + receivedNumber);
    //basic.showString("Select from game controller");
    gameState = 1;
  }

  // Game state = 2
  if (receivedNumber == 2) {
    //basic.showString("GState" + receivedNumber);
    //basic.showString("Select from game controller");
    gameState = 2;
  }

  // Game state = 3
  if (receivedNumber == 3) {
    //basic.showString("GState" + receivedNumber);
    gameState = 3;
  }

  // Game state = 4
  if (receivedNumber == 4) {
    //basic.showString("GState" + receivedNumber);
    gameState = 4;
  }
});

input.onGesture(Gesture.Shake, function() {
  radio.sendString("p" + control.deviceName());
  basic.pause(5000);
});
