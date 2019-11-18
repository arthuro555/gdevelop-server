/**
 * @fileOverview The server part of the project.
 * @author Arthur Pacaud (arthuro555)
 * @version 0.0.1-dev-in-progress
 */
var express = require('express');
var socketIO = require('socket.io');
var wireUpServer = require('socket.io-fix-close');
var settings = require("./confighandler.js").config;
var PORT = process.env.PORT || 80;
var pclass = require("./player");
var pm = require("./pmanager.js");
pm = new pm.pmanager();
pm.loadData();
var httpServer = express()
    .use(function (req, res) { return res.sendFile("/index.html", { root: __dirname }); })
    .listen(PORT, function () { return console.log("Listening on " + PORT); });
var io = socketIO(httpServer);
wireUpServer(httpServer, io);
io.on('connection', function (socket) {
    console.log("Player Connected");
    socket.on('disconnect', function () {
        console.log("Non Logged-in player disconnected.");
    });
    socket.on('auth', function (data) {
        var p = data["password"];
        var u = data["username"];
        console.log(u + " is trying to log in...");
        var token = pm.login(u, p);
        if (token === false) {
            console.log("Auth. Failed for " + u + "!.");
            socket.emit("AuthFail", true);
        }
        else {
            console.log(u + " logged in.");
            socket.emit("AuthSuccess", token);
            // SOCKET.ON DEFINITIONS HERE
            socket.on('disconnect', function (data) {
                console.log(data["username"] + " disconnected.");
                if (!pm.logout(data["username"], data["token"])) {
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
                    for (var _i = 0, _a = pm.getPlayers(); _i < _a.length; _i++) {
                        var p_1 = _a[_i];
                        p_1.logout_force();
                    }
                    pm.serialize();
                    console.log("Goodbye!");
                }
            });
            socket.on("updateState", function (data) {
                var p = pm.getPlayer(data["username"]);
                p.updateObjects(data["token"], data["data"]);
            });
            socket.on("event", function (data) {
                socket.broadcast.emit("event", data);
            });
        }
    });
});
if (process.platform === "win32") {
    var rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on("SIGINT", function () {
        // @ts-ignore
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
    for (var _i = 0, _a = pm.getPlayers(); _i < _a.length; _i++) {
        var p = _a[_i];
        p.logout_force();
    }
    pm.serialize();
    process.exit();
});
var updateGameState = function () {
    io.emit("tick", pm.getAllObjects());
    setTimeout(updateGameState, 200);
};
setTimeout(updateGameState, 200);
