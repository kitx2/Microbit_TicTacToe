let gameState = 0;
let gameId = 0;
let response = 0;
let result = 0;
let x = 0;
let y = 0;
let boardSize = 3;
let scoreboard = "00-00";
let playerTurn = "";
let player1 = "";
let player2 = "";
let paired = false;
let p1Score = 0;
let p2Score = 0;
let p1XorO = "";
let p2XorO = "";

serial.redirectToUSB();
basic.showIcon(IconNames.Yes);

// welcome screen
function showWelcome() {
  basic.showIcon(IconNames.Giraffe);
  // pairing via radio, join game by receiving device name
  serial.writeString("I");
  basic.pause(2000);
  serial.writeString("F");
  basic.pause(500);
  basic.showString("Press A+B to start new series");
}

// initialize game
function initGame() {
  gameState = 0;
  gameId = 0;
  response = 0;
  result = 0;

  showWelcome();
  basic.pause(500);
}

input.onButtonPressed(Button.A, function() {
  // Game initialization: select gameboard size
  if (gameState == 2) {
    boardSize++;
    basic.pause(500);

    if (boardSize > 10) {
      boardSize = 3;
      basic.showNumber(boardSize);
      basic.pause(500);
    } else {
      basic.showNumber(boardSize);
      basic.pause(500);
    }
  }
  // Series initalization: Reset scoreboard
  if (gameState == 1) {
    serial.writeString("Z"); //prompt user to enter board game size on web
    //basic.showString("SNG");
    gameState = 2; // goto Game initialization
    radio.sendNumber(2);
    //basic.showString("SBS " + boardSize);
    basic.pause(500);
    basic.showNumber(boardSize);
    basic.pause(2000);
  }
});

input.onButtonPressed(Button.B, function() {
  // End game prematurely
  if (gameState == 3) {
    serial.writeString("I");
    basic.pause(500);

    gameState = 1;
    radio.sendNumber(1);
    boardSize = 3;
    x = 0;
    y = 0;
    // TODO: Display current scoreboard
    basic.showString(p1Score + "-" + p2Score);

    // Display current on web game board
    serial.writeString("s" + p1Score + "-" + p2Score);
    basic.pause(500);
    //basic.showString("Start new game");
    serial.writeString("A");
    basic.pause(500);

    radio.sendString("C");
  }

  // confirm gameboard size, commence gameplay
  if (gameState == 2) {
    basic.showNumber(boardSize);
    serial.writeString("b" + boardSize);
    basic.pause(500);
    // Display current on web game board
    serial.writeString("s" + p1Score + "-" + p2Score);
    basic.pause(500);
  }
});

input.onButtonPressed(Button.AB, function() {
  // End current series
  if (gameState == 1) {
    // TODO: Display final scoreboard
    basic.showString(p1Score + "-" + p2Score);
    // TODO: Send overall outcome to game device
    if (p1Score > p2Score) {
      radio.sendString("W" + player1);
      basic.pause(500);

      radio.sendString("L" + player2);
      basic.pause(500);

      basic.showString(player1 + " wins");
    } else if (p1Score == p2Score) {
      radio.sendString("D");
      basic.pause(500);

      basic.showString("Draw");
    } else {
      radio.sendString("W" + player2);
      basic.pause(500);

      radio.sendString("L" + player1);
      basic.pause(500);

      basic.showString(player2 + " wins");
    }

    //housekeeping
    gameState = 0;
    p1Score = 0;
    p2Score = 0;
    radio.sendNumber(0);
    basic.showString("End cur series");
    initGame();
  }

  // Splash Screen: Start new series
  if (gameState == 0) {
    serial.writeString("A");
    basic.pause(500);
    serial.writeString("s00-00");
    basic.pause(500);

    gameState = 1; //goto series initalization
    radio.sendNumber(1);
    scoreboard = "00-00";
    basic.showString(scoreboard + ", Press A to start");
    // Display current on web game board
  }
});

//Determined that gameboard is set from web interface
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => {
  let incoming = serial
    .readUntil(serial.delimiters(Delimiters.NewLine))
    .substr(0, 2);
  //basic.showString(incoming);
  serial.writeString(incoming);

  if (incoming.compare("H") == 0) {
    basic.showString("Board size error");
  }

  if (incoming.compare("GS") == 0) {
    gameState = 3; // goto game play
    radio.sendNumber(3);
    basic.pause(500);
    radio.sendString("b" + boardSize);
    basic.pause(500);

    //randomize player
    let player = Math.floor(Math.random() * Math.floor(2)) + 1;
    basic.pause(500);

    if (player == 1) {
      radio.sendString("X" + player1);
      basic.pause(500);

      radio.sendString("O" + player2);
      basic.pause(500);

      p1XorO = "X";
      p2XorO = "O";
    } else {
      radio.sendString("X" + player2);
      basic.pause(500);

      radio.sendString("O" + player1);
      basic.pause(500);

      p2XorO = "X";
      p1XorO = "O";
    }

    basic.showIcon(IconNames.Heart);
    basic.pause(500);
  }

  // X's turn
  if (incoming.compare("XT") == 0) {
    //success sound
    music.playTone(262, music.beat(BeatFraction.Half));
    music.playTone(523, music.beat(BeatFraction.Whole));
    basic.pause(500);

    playerTurn = "X";
    radio.sendString("XTurn");
    basic.pause(500);
    basic.showIcon(IconNames.No);
  }

  // O's turn
  if (incoming.compare("OT") == 0) {
    //success sound
    music.playTone(262, music.beat(BeatFraction.Half));
    music.playTone(523, music.beat(BeatFraction.Whole));
    basic.pause(500);

    playerTurn = "O";
    radio.sendString("OTurn");
    basic.pause(500);
    basic.showIcon(IconNames.Square);
  }

  // Space taken, prompt to retry
  if (incoming.compare("ST") == 0) {
    // Error sound
    music.playTone(262, music.beat(BeatFraction.Half));
    music.playTone(165, music.beat(BeatFraction.Double));
    basic.pause(500);

    basic.showString("Retry " + playerTurn);
  }

  // Coordinate error
  if (incoming.compare("E") == 0) {
    // Error sound
    music.playTone(262, music.beat(BeatFraction.Half));
    music.playTone(165, music.beat(BeatFraction.Double));
    basic.pause(500);

    basic.showString("Retry " + playerTurn);
    basic.pause(500);

    radio.sendString(playerTurn + "Turn");
    basic.pause(500);

    if (playerTurn.compare("X") == 0) {
      basic.showIcon(IconNames.No);
      basic.pause(500);
    } else {
      basic.showIcon(IconNames.Square);
      basic.pause(500);
    }
  }

  // Declare X winner
  if (incoming.compare("XW") == 0) {
    //TODO: Update score
    basic.pause(500);

    if (p1XorO.compare("X") == 0) {
      p1Score++;
      basic.pause(500);

      radio.sendString("W" + player1);
      basic.pause(500);
      radio.sendString("L" + player2);
      basic.pause(500);
      basic.showString("X Wins [" + player1 + "]");
    } else {
      p2Score++;
      basic.pause(500);

      radio.sendString("W" + player2);
      basic.pause(500);
      radio.sendString("L" + player1);
      basic.pause(500);
      basic.showString("X Wins [" + player2 + "]");
    }
    basic.pause(500);

    //TODO: reset game
    serial.writeString("A");
    basic.pause(500);

    // Display current on web game board
    serial.writeString("s" + p1Score + "-" + p2Score);
    basic.pause(500);

    gameState = 1;
    boardSize = 3;
    x = 0;
    y = 0;
    radio.sendNumber(1);
    //TODO: Display current scoreboard
    basic.showString(p1Score + "-" + p2Score);
    basic.pause(500);
  }

  // Declare O winner
  if (incoming.compare("OW") == 0) {
    //TODO: Update score
    if (p1XorO.compare("O") == 0) {
      p1Score++;
      basic.pause(500);

      radio.sendString("W" + player1);
      basic.pause(500);

      radio.sendString("L" + player2);
      basic.pause(500);

      basic.showString("O Wins [" + player1 + "]");
    } else {
      p2Score++;
      basic.pause(500);

      radio.sendString("W" + player2);
      basic.pause(500);

      radio.sendString("L" + player1);
      basic.pause(500);

      basic.showString("O Wins [" + player2 + "]");
    }

    //TODO: reset game
    serial.writeString("A");
    basic.pause(500);
    gameState = 1;
    boardSize = 3;
    x = 0;
    y = 0;
    radio.sendNumber(1);
    basic.pause(500);

    //TODO: Display current scoreboard
    basic.showString(p1Score + "-" + p2Score);
    basic.pause(500);
    // Display current on web game board
    serial.writeString("s" + p1Score + "-" + p2Score);
    basic.pause(500);
  }

  // Declare no winner
  if (incoming.compare("DR") == 0) {
    serial.writeString("A");
    basic.pause(500);
    basic.showString("Draw");
    radio.sendString("D");
    basic.pause(500);

    //TODO: Update score
    //TODO: reset game
    gameState = 1;
    boardSize = 3;
    x = 0;
    y = 0;
    radio.sendNumber(1);
    basic.pause(500);

    //TODO: Display current scoreboard
    basic.showString(p1Score + "-" + p2Score);
    basic.pause(500);
    // Display current on web game board
    serial.writeString("s" + p1Score + "-" + p2Score);
    basic.pause(500);
  }
});

radio.onReceivedString(function(receivedString) {
  let incoming = receivedString;
  //basic.showString(receivedString);

  if (!paired) {
    //pairing with gamecontroller (pDEVICEname e.g. pVEGAV)
    if (incoming[0].compare("p") == 0) {
      let device = incoming.slice(1, incoming.length);
      //basic.showString(device);

      if (
        !(player1.compare(device) == 0) &&
        player1.compare("") == 0 &&
        player2.compare("") == 0
      ) {
        player1 = device;
        basic.showString("p1 con " + device);
        radio.sendString("pA" + device);
        basic.pause(500);
      } else if (
        !(player2.compare(device) == 0) &&
        !(player1.compare("") == 0) &&
        !(player1.compare(device) == 0) &&
        player2.compare("") == 0
      ) {
        player2 = device;
        basic.showString("p2 con " + device);
        paired = true;
        radio.sendString("pB" + device);
        basic.pause(500);

        initGame();
      } else {
        //basic.showString("Both connected " + player1 + "," + player2);
        paired = true;
        initGame();
      }
    }
  }

  if (paired) {
    //Start new game

    //Receive coordinates from controller
    if (incoming[0].compare("c") == 0) {
      //push to web interface
      serial.writeString(incoming);
    }
  }
});

radio.setGroup(255);
