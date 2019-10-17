const express = require('express');
const socketIO = require('socket.io');
let crypto = require('crypto');
const wireUpServer = require('socket.io-fix-close');
const fs = require('fs');

let rawdata = fs.readFileSync('userdata.json');
let userdata = JSON.parse(rawdata);
let pclass = require("./player");
let pm = require("./pmanager.js").pmanager();

const app = express();
const httpServer = app.listen(80);
const io = socketIO(httpServer);

wireUpServer(httpServer, io);

console.log("Listening...");
io.on('connection', function (socket) {
  console.log("Connected");
  socket.on('disconnect', function (data) {
    console.log("disconnected");
  });
  socket.on('auth', function (data){
    var p = crypto.createHash('sha256').update(data["password"]).digest('hex');
    var u = data["username"];
    console.log(u+" is logging in...");
    if (u in userdata){
      console.log("Logging into existing account.");
    } else {
      userdata[u] = {"username":u, "password":p, "admin":false, "data":{}};
      console.log("Registered New User.");
    };
    if (userdata[u]["password"] == p) {
      console.log(u+" logged in.");
      socket.emit("authSuccess");

      socket.on("off", function(data) {
        if(userdata[data.user]["admin"]){
          // Try to close the server a clean way
          io.emit("Closing", true);
          io.engine.close();
          io.close();
          httpServer.close();
          console.log("Server Closed");
          fs.writeFileSync('userdata.json', JSON.stringify(userdata));
        }
      });

      socket.on("updateTick", function(data) {
        socket.emit("tickUpdate", userdata[data.user]["data"]);
      });
    } else {
      console.log("Authentification Failed.");
      socket.emit("AuthFail");
    };
  });
});

if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", function () {
    process.emit("SIGINT");
  });
}

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  io.emit("Closing", true);
  io.engine.close();
  io.close();
  httpServer.close();
  console.log("Server Closed");
  fs.writeFileSync('userdata.json', JSON.stringify(userdata));
  process.exit();
});