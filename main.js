const express = require('express');
const socketIO = require('socket.io');
let crypto = require('crypto');
const wireUpServer = require('socket.io-fix-close');
const fs = require('fs');

let pclass = require("./player");
let pms = require("./pmanager.js");
pms = pms.pmserializer();
pm = pms.pmserializer.load();

const app = express();
const httpServer = app.listen(80);
const io = socketIO(httpServer);

wireUpServer(httpServer, io);

console.log("Listening...");
io.on('connection', function (socket) {
    console.log("Player Connected");
    socket.on('disconnect', function (data) {
        console.log("Non Logged-in player disconnected.");
    });
    socket.on('auth', function (data) {
        var p = data["password"];
        var u = data["username"];
        console.log(u + " is trying to log in...");
        let token = pm.login(u, p);
        if (token === false) {
            console.log("Auth. Failed for " + u + "!.");
            socket.emit("AuthFail", true);
        } else {
            console.log(u + " logged in.");
            socket.emit("AuthSuccess", token);

            // SOCKET.ON DEFINITIONS HERE


            socket.on('disconnect', function (data) {
                console.log(data["username"] + " disconnected.");
                if(!pm.logout(data["username"], data["token"])){
                    console.error("Error while logging out.");
                    console.warn("THIS IS NOT A NORMAL ERROR. SOMEONE IS INTENTIONALLY TRYING TO CRASH OR TAKE CONTROL OF THE SERVER!!!");
                    console.warn("You should shut down the server as soon as possible or ban the user provoking this.");
                }
            });

            socket.on("off", function (data) {
                if (pm.getPlayer(data["username"]).moderator) {
                    // Try to close the server a clean way
                    io.emit("Closing", true);
                    io.engine.close();
                    io.close();
                    httpServer.close();
                    console.log("Server Closed");
                    pms.serialize(pm);
                    console.log("Goodbye!")
                }
            });

            socket.on("updateTick", function (data) {
                let p = pm.getPlayer(data["username"]);
                p.updateObjects(data["token"], data["data"]);
                socket.emit("tickUpdate", pm.getAllObjects());
            })
        }
    })
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

process.on('SIGINT', function () {
    console.log("Caught interrupt signal");
    io.emit("Closing", true);
    io.engine.close();
    io.close();
    httpServer.close();
    console.log("Server Closed");
    fs.writeFileSync('userdata.json', JSON.stringify(userdata));
    process.exit();
});