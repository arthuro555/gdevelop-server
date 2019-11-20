/**
 * @fileOverview The server part of the project.
 * @author Arthur Pacaud (arthuro555)
 * @version 0.0.1-dev-in-progress
 */
import {config} from "./confighandler";

const express = require('express');
const socketIO = require('socket.io');
const wireUpServer = require('socket.io-fix-close');
const settings = require("./confighandler.js").config;

const PORT = process.env.PORT || 80;


import {player} from "./player"
import {pmanager} from "./pmanager"
let pm = new pmanager();
pm.loadData();

const httpServer = express()
    .use((req, res) => res.sendFile("/index.html", { root: __dirname }))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socketIO(httpServer);

wireUpServer(httpServer, io);

io.on('connection', function (socket) {
    console.log("Player Connected");
    socket.on('disconnect', function () {
        console.log("Non Logged-in player disconnected.");
    });
    socket.on('auth', function (data) {
        let p = data["password"];
        let u = data["username"];
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
                if (pm.getPlayer(data["username"]).isMod()) {
                    // Try to close the server a clean way
                    io.emit("Closing", true);
                    io.engine.close();
                    io.close();
                    httpServer.close();
                    console.log("Server Closed");
                    for(let p of pm.getPlayers()){
                        p.logout_force();
                    }
                    pm.serialize();
                    console.log("Goodbye!")
                }
            });

            socket.on("updateState", function (data) {
                let p = pm.getPlayer(data["username"]);
                p.updateObjects(data["token"], data["data"]);
            });

            socket.on("event", function (data) {
                if(config["verbose"]){console.log("Event received: "+ JSON.stringify(data))}
                socket.broadcast.emit("event", data);
            })
        }
    })
});

if (process.platform === "win32") {
    let rl = require("readline").createInterface({
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
    for(let p of pm.getPlayers()){
        p.logout_force();
    }
    pm.serialize();
    process.exit();
});

let updateGameState = function () {
    io.emit("tick", pm.getAllObjects());
    setTimeout(updateGameState, 200)
};
setTimeout(updateGameState, 200);