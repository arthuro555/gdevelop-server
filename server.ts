/**
 * @fileOverview The server part of the project.
 * @author Arthur Pacaud (arthuro555)
 * @version 0.0.1-dev-in-progress
 */
import {config} from "./confighandler";

import express = require('express');
import socketIO = require('socket.io');
import wireUpServer = require('socket.io-fix-close');
const settings = require("./confighandler.js").config;

const PORT = process.env.PORT || settings.port || 80;


import {player} from "./player"
import {pmanager} from "./pmanager"

/**
 *
 * @param main - Is this the main process? If yes will terminate the whole thing on control-c
 * @constructor
 */
class Server{
    pm:pmanager;
    httpServer:express;
    io:socketIO.Server;
    constructor(main:boolean = false) {
        this.pm = new pmanager();
        this.pm.loadData();

        this.httpServer = express()
            .use((req, res) => res.sendFile("/CPannel/index.html", {root: __dirname}))
            .listen(PORT, () => console.log(`Listening on ${PORT}`));
        this.io = socketIO(this.httpServer);

        wireUpServer(this.httpServer, this.io);

        let that = this;

        this.io.on('connection', function (socket) {
            console.log("Player Connected");
            socket.on('disconnect', function () {
                console.log("Non Logged-in player disconnected.");
            });
            socket.on('auth', function (data) {
                let p = data["password"];
                let u = data["username"];
                console.log(u + " is trying to log in...");
                let token = that.pm.login(u, p, socket.id);
                if (token === false) {
                    console.log("Auth. Failed for " + u + "!.");
                    socket.emit("AuthFail", true);
                } else {
                    console.log(u + " logged in.");
                    socket.emit("AuthSuccess", token);

                    // SOCKET.ON DEFINITIONS HERE


                    socket.on('disconnect', function (data) {
                        console.log(data["username"] + " disconnected.");
                        if (!that.pm.logout(data["username"], data["token"])) {
                            console.error("Error while logging out.");
                            console.warn("THIS IS NOT A NORMAL ERROR. SOMEONE IS INTENTIONALLY TRYING TO CRASH OR TAKE CONTROL OF THE SERVER!!!");
                            console.warn("You should shut down the server as soon as possible or ban the user provoking this.");
                        }
                    });

                    socket.on("off", function () {
                        const currentPlayer = that.pm.getBySocketID(socket.id);
                        if (currentPlayer === false) {
                            return;
                        }
                        // This seems weird but is for now my best way to keep the typing while having an unknown type
                        const plyer: player = currentPlayer;
                        if (plyer.isMod()) {
                            // Try to close the server a clean way
                            that.close();
                            console.log("Goodbye!")
                        }
                    });

                    socket.on("updateState", function (data) {
                        that.updateState(socket, data);
                    });

                    socket.on("event", function (data) {
                        if (config["verbose"]) {
                            console.log("Event received: " + JSON.stringify(data))
                        }
                        socket.broadcast.emit("event", data);
                    })
                }
            })
        });

        if (main) {
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
                that.close();
                process.exit();
            });
        }

        const updateGameState = function () {
            that.io.emit("tick", that.pm.getAllObjects());
            setTimeout(updateGameState, 200)
        };
        setTimeout(updateGameState, 200);
    }

    close = () => {
        this.io.emit("Closing", true);
        // @ts-ignore
        this.io.engine.close();
        this.io.close();
        this.httpServer.close();
        console.log("Server Closed");
        for (let p of this.pm.getPlayers()) {
            p.logout_force();
        }
        this.pm.serialize();
    };

    updateState = (socket:socketIO.Socket, data:object) => {
        let p = this.pm.getBySocketID(socket.id);
        if (p instanceof player) {
            p.updateObjects(data["token"], data["data"]);
        } else {
            socket.emit("error", "NotLoggedIn")
        }
    }
}

module.exports.Server = Server;
export default Server;
