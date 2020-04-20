// Enable pusher logging - don't include this in production
let microMessage = "";
let gameStart = false;
var boardSize = 3;
var coordinates = 0;
require("dotenv").config();
Pusher.logToConsole = true;

var pusher = new Pusher(process.env.PUSHER_APIKEY, {
  cluster: process.env.PUSHER_CLUSTER,
  forceTLS: true,
});

//Send gameboard response to app.js(server)
function sendServer(text) {
  console.log(text);
  axios
    .post("/post", { clientMessage: text })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error(error);
    });
}

// Enable realtime messenging to server
var channel = pusher.subscribe("my-channel");
channel.bind("my-event", function (data) {
  console.log(JSON.stringify(data));

  microMessage = JSON.parse(JSON.stringify(data)).message;
  console.log("my micro message is " + microMessage);

  //Initialize gameboard on display
  if (microMessage[0] == "F") {
    gameStart = false;
    console.log("Page refreshed! Initialize gameboard on display");

    document.getElementById("instruction").innerHTML =
      "Press A + B on game controller to start new series";
  }

  //Re-initialize gameboard on display
  if (microMessage[0] == "I") {
    location.reload();

    gameStart = false;
    console.log("Page refreshed! Initialize gameboard on display");
  }

  //Prompt player to press A on gameboard and display on web
  if (microMessage[0] == "A") {
    document.getElementById("instruction").innerHTML =
      "Press A to start new game";
  }

  //Prompt player to select boardsize on gameboard and display on web
  if (microMessage[0] == "Z") {
    document.getElementById("instruction").innerHTML =
      "Select board size by pressing A and confirm by pressing B on gameboard ";
  }

  //Determine boardSize
  if (microMessage[0] == "b" && gameStart == false) {
    boardSize = microMessage.slice(1, microMessage.length);
    if (microMessage.length == 1) {
      sendServer("boardsize error");
      console.log("boardsize error");
      alert(
        'Boardsize error: Please reset current game. Once after the "pii" sound is played, press B then A on game controller'
      );
    }

    if (Number.isInteger(Number(boardSize))) {
      document.getElementById("boardsize_input").value = boardSize;
      console.log("new boardSize is " + boardSize);

      initGame();
    }
  }

  //Determine coordinates
  if (microMessage[0] == "c" && gameStart == true) {
    coordinates = microMessage.slice(1, microMessage.length);

    if (microMessage.length == 1) {
      sendServer("coordinate error");
      console.log("coordinate error");
    }

    if (Number.isInteger(Number(coordinates))) {
      document.getElementById(coordinates).click();
    }
  }

  //Display scoreboard
  if (microMessage[0] == "s") {
    let scoreboard = microMessage.slice(1, microMessage.length);

    document.getElementById("score").innerHTML = "" + scoreboard;
  }
});

function initGame() {
  gameStart = true;
  console.log("Game started!");
  document.getElementById("instruction").innerHTML = "";
  sendServer("gamestart");

  // If play button is clicked, change to reset

  // These functions will come in handy
  function isEven(value) {
    if (value % 2 == 0) {
      return true;
    } else {
      return false;
    }
  }

  function isOdd(value) {
    if (value % 1 == 0) {
      return true;
    } else {
      return false;
    }
  }

  function allSame(array) {
    // Ultimately got this solution from stack overflow, I had a lot of difficulty getting it to work on my own

    var first = array[0];

    if (array[0] == "") {
      return false;
    } else {
      return array.every(function (element) {
        return element == first;
      });
    }
  }

  // * Fun! Let the user choose the background color
  var customBackground = document.getElementById("boardcolor_input").value;

  // Set board size according to input value parsed to integer
  boardSize = parseInt(document.getElementById("boardsize_input").value);

  // Create variable game board (empty array)
  var gameBoard = [];

  // create variable numSquares, which is gameboard size squared
  var numSquares = boardSize * boardSize;

  // Create gameboard array containing [] of board size squared
  for (var i = 0; i < numSquares; i++) {
    gameBoard.push(i);
  }

  // Create a wrapper div called "board" inside of "game" div
  document.getElementById("game").innerHTML = '<div id="board"></div>';

  // Store board div inside of a variable

  var board = document.getElementById("board");

  // Center board in middle of page by adding margin css
  board.style.margin = "0 auto";

  // To make scalable, set wrapper div width and height 100px* board size
  board.style.height = 100 * boardSize + "px";
  board.style.width = 100 * boardSize + "px";

  // Add border to board for visibility
  board.style.border = "solid 1px black";

  // Iterate over gameboard, for every index in gameboard, print to document a div
  for (var i = 0; i < numSquares; i++) {
    board.innerHTML += '<div class="square"></div>'; // Need to add += or else divs overwrite each other!!
  }

  // Store square divs in a variable - need to include in global scope
  var squares = document.getElementsByClassName("square");

  // Mandatory square div styling
  for (var i = 0; i < numSquares; i++) {
    // set div squares to 100px x 100px
    squares[i].style.height = "100px";
    squares[i].style.width = "100px";
    // Float square divs left
    squares[i].style.float = "left";
    // Set div line height to 100px
    squares[i].style.lineHeight = "100px";
    // Set unique DIV IDs to each square
    squares[i].setAttribute("id", i.toString());
  }

  // ** Fancy! Make every other square light gray
  if (numSquares % 2 !== 0) {
    // If board size is odd
    for (var i = 0; i < numSquares; i += 2) {
      // make every other square light gray
      squares[i].style.backgroundColor = customBackground;
    }
  } else {
    // If board size is even ### This was extremely hard to nail down ###
    for (i = 0; i < numSquares; i += 1) {
      if (isEven(i / boardSize)) {
        // make even rows alternate color
        for (var squareNum = i; squareNum < i + boardSize; squareNum += 2) {
          squares[squareNum].style.backgroundColor = customBackground;
        }
      } else if (isOdd(i / boardSize)) {
        // make odd rows alternate color
        for (var squareNum = i + 1; squareNum < i + boardSize; squareNum += 2) {
          squares[squareNum].style.backgroundColor = customBackground;
        }
      } else {
      }
    }
  }

  // Store turn indicator div in a variable for easy access
  var turnIndicator = document.getElementById("turnIndicator");
  var turnIndicatorWarning = document.getElementById("turnIndicatorWarning");

  // After board is made, indicate who goes first
  turnIndicator.style.color = "black";
  turnIndicator.innerHTML = "X's Turn";
  sendServer("X turn");

  // Declare a global click counter
  var boardClicks = 0;

  // If board is clicked, increment global click counter
  board.addEventListener("click", function () {
    if (boardClicks >= Number(boardSize * boardSize - 1)) {
      // determineWinner will return true if it finds a winning combination
      turnIndicator.style.color = "grey";
      turnIndicator.innerHTML = "Draw";
      sendServer("Draw");
      gameStart = false;
    } else if (determineWinner()) {
      // determineWinner will return true if it finds a winning combination
      turnIndicator.style.color = "blue";
      turnIndicator.innerHTML = winningPlayer[0] + " wins!";

      sendServer(winningPlayer[0] + " winner");
      gameStart = false;
    } else if (isEven(boardClicks)) {
      turnIndicator.style.color = "red";
      turnIndicator.innerHTML = "O's Turn";
      sendServer("O turn");
    } else {
      turnIndicator.style.color = "black";
      turnIndicator.innerHTML = "X's Turn";
      sendServer("X turn");
    }
    boardClicks++;
    console.log(
      "current clicks: " + boardClicks + "/" + Number(boardSize * boardSize)
    );
  }); // End board click function

  // Make an array to hold square click data
  var squareClicks = [];

  // Set squareclick data for each square to 0
  for (var i = 0; i < numSquares; i++) {
    squareClicks[i] = 0;
  }

  // Make a variable to store winning combination
  var winningPlayer;

  // Add function to determine winner based on clicks array
  var determineWinner = function () {
    // Check for win by row
    for (i = 0; i < numSquares; i += 1) {
      // iterate over entire board
      if (i % boardSize == 0) {
        var rowCheck = [];
        for (var squareNum = i; squareNum < i + boardSize; squareNum += 1) {
          // iteration over column 1
          rowCheck.push(squares[squareNum].innerHTML);
        }
        console.log("Row " + i + " is " + rowCheck);
        console.log(allSame(rowCheck));

        if (allSame(rowCheck)) {
          winningPlayer = rowCheck; // Push winning player data
          return true;
        }
      }
    }
    // Check for win by column
    for (i = 0; i < numSquares; i += 1) {
      // iterate over entire board
      if (i < boardSize) {
        //
        var colCheck = [];
        for (
          var squareNum = i;
          squareNum < numSquares;
          squareNum += boardSize
        ) {
          // iteration over row 1
          colCheck.push(squares[squareNum].innerHTML);
        }
        console.log("Column " + i + "is " + colCheck);
        console.log(allSame(colCheck));

        if (allSame(colCheck)) {
          winningPlayer = colCheck; // Push winning player data
          return true;
        }
      }
    }
    // Check for win by left diagonal
    var diag1Check = []; // Needs to be outside of for loop to prevent overwriting array
    for (i = 0; i < numSquares; i += 1) {
      // first iteration over board
      if (i % (boardSize + 1) == 0) {
        // use condition if iterator % BOARDSIZE + 1 === 0 to get left diagonals
        console.log(i);
        diag1Check.push(squares[i].innerHTML);
      }
    }
    console.log(diag1Check); // These also need to be outside of for loop to prevent checks on incomplete arrays
    console.log(allSame(diag1Check));
    if (allSame(diag1Check)) {
      // As does the return statement
      winningPlayer = diag1Check; // Push winning player data
      return true;
    }
    // Check for win by right diagonal
    var diag2Check = []; // Needs to be outside of for loop to prevent overwriting array
    for (i = boardSize - 1; i < numSquares - 1; i += 1) {
      // first iteration over board
      if (i % (boardSize - 1) == 0) {
        // use condition if iterator % BOARDSIZE - 1 === 0 to get right diagonals
        console.log(i);
        diag2Check.push(squares[i].innerHTML);
      }
    }
    console.log(diag2Check); // These also need to be outside of for loop to prevent checks on incomplete arrays
    console.log(allSame(diag2Check));
    if (allSame(diag2Check)) {
      // As does the return statement
      winningPlayer = diag2Check; // Push winning player data
      return true;
    }
  }; // End determineWinner function

  // Add function to count square clicks
  var countClicks = function () {
    turnIndicatorWarning.style.visibility = "hidden";
    var divID = this.getAttribute("id");
    squareClicks[divID] += 1;
    // If global click counter is odd and local click is == 1, change innerhtml of div to 'X'
    if (isEven(boardClicks) && squareClicks[divID] == 1) {
      this.innerHTML = "X";
      // If global click counter is even and local click is == 1, change innerhtml of div to 'O'
    } else if (isOdd(boardClicks) && squareClicks[divID] == 1) {
      this.innerHTML = "O";
      this.style.color = "red";
      // If local click counter is greater than 1, alert player and subtract 1 from global clicks
    } else if (!determineWinner()) {
      turnIndicatorWarning.style.visibility = "visible";
      turnIndicatorWarning.style.color = "red";
      turnIndicatorWarning.innerHTML =
        "You cannot move there. That space is taken.";
      sendServer("space taken");
      boardClicks -= 1;
    } else {
    }
    // Check for winner, if true, lock all local clicks
    if (determineWinner()) {
      // determine winner will return true or false if it identifies a winning combination
      // Set all square clicks to 2 to "lock" them to prevent further moves from taking place
      for (var i = 0; i < numSquares; i++) {
        squareClicks[i] = 2;
      }
      // Change play button to say play again
    }
  };

  // Add local click counter to each square on the board
  for (var i = 0; i < numSquares; i++) {
    squares[i].addEventListener("click", countClicks);
  }
}
