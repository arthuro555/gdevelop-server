const express = require('express');
const socketIO = require('socket.io');
var crypto = require('crypto');
const wireUpServer = require('socket.io-fix-close');
// var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

const app = express();
const httpServer = app.listen(80);
const io = socketIO(httpServer);

wireUpServer(httpServer, io);

// Init the database
console.log("Database Initializing...");
let db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error("Could not Init the databse: "+err.message);
  }
});
console.log("Database Initialized");

var password ="123";

console.log("Listening...");
io.on('connection', function (socket) {
  console.log("Connected");
  socket.on('disconnect', function (data) {
    console.log("disconnected");
  });
  socket.on('AdminAccess', function (data){
    console.log(socket+" has requested admin...");
    if (data["password"].toString() == password.toString()){
      console.log("...and got it.");
      socket.on("off", function() {
        // Try to close the server a clean way
        io.emit("Closing", "true");
        io.engine.close();
        io.close();
        httpServer.close();
        console.log("Server Closed");
        db.close((err) => {
          if (err) {
            return console.error("Couldn't close database! Data loss possible! Error: "+err.message);
          }
        });
      })
    } else {
      console.log("...and didn't got anything :'(")
    };
  });
});