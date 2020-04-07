const express = require("express");
const app = express();
const path = require("path");

//parser json data from client
const bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Enable CORS policy
const cors = require("cors");
app.use(cors());

//Import library for reading microbit
var SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

// viewed at http://localhost:8080
app.use(express.static(__dirname + "/"));
app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname, "./index.html"));
});

//Pusher: enables realtime messaging with client
var Pusher = require("pusher");

var pusher = new Pusher({
  appId: "963357",
  key: "bae3f167b2a04f27d7ac",
  secret: "bcb925286431fe03fdd9",
  cluster: "ap1",
  encrypted: true
});

// WARNING: Need to adjust the COM port from PC
var portMicrobit = new SerialPort("COM11", {
  baudRate: 115200,
  parser: new Readline("\n")
});

//Read microbit serialport data
portMicrobit.open(() => {
  console.log("Port open");

  portMicrobit.on("data", function(data) {
    console.log("data received: " + data);
    pusher.trigger("my-channel", "my-event", {
      message: data.toString()
    });

    pusher.get({ path: "/channels/my-channel/my-event", params: {} }, function(
      error,
      request,
      response
    ) {
      if (response.statusCode === 200) {
        var result = JSON.parse(response.body);
        console.log(result);
      }
    });
  });
});

/*  1. Receive data from game board
    2. Write to microbit game controller 
*/
app.post("/post", (req, res) => {
  let message = req.body.clientMessage;

  res.json({ requestBody: req.body }); // <==== req.body will be a parsed JSON object
  console.log(message);

  if (message == "gamestart") {
    portMicrobit.write("GS\n");
  }

  if (message == "X turn") {
    portMicrobit.write("XT\n");
  }

  if (message == "O turn") {
    portMicrobit.write("OT\n");
  }

  if (message == "X winner") {
    portMicrobit.write("XW\n");
  }

  if (message == "O winner") {
    portMicrobit.write("OW\n");
  }

  if (message == "Draw") {
    portMicrobit.write("DR\n");
  }

  if (message == "space taken") {
    portMicrobit.write("ST\n");
  }

  if (message == "coordinate error") {
    portMicrobit.write("E\n");
  }

  if (message == "boardsize error") {
    portMicrobit.write("H\n");
  }
});

app.listen(8080);
