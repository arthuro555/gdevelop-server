"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @fileOverview The server part of the project.
 * @author Arthur Pacaud (arthuro555)
 * @version 0.0.1-dev-in-progress
 */
const confighandler_1 = require("./confighandler");
const express = require("express");
const socketIO = require("socket.io");
const wireUpServer = require("socket.io-fix-close");
const settings = require("./confighandler.js").config;
let path = require('path');
let appRoot = path.resolve(__dirname);
const PORT = process.env.PORT || settings.port || 80;
const player_1 = require("./player");
const pmanager_1 = require("./pmanager");
/**
 * The class containing the server. Soon all handlers will be moved to a function to make custom servers easier to make.
 * @class
 * @property {pmanager} pm - The player Manager.
 * @property {express} httpServer - The Express http server hosting the socket IO server.
 * @property {socketIO.Server} io - The socket IO Server.
 */
class Server {
    /**
     * The constructor of the class containing the server. Soon all handlers will be moved to a function to make custom servers easier to make.
     * @constructor
     * @param {boolean} main - Is this the main process? If yes will terminate the whole thing on control-c, else let the main program handle exiting and Interrupt signals.
     */
    constructor(main = false) {
        /**
         * Close the server. Also saves al potential data
         * @method
         */
        this.close = () => {
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
        /** @type {pmanager}*/
        this.pm = new pmanager_1.pmanager();
        this.pm.loadData();
        /** @type {express}*/
        this.httpApp = express();
        // For avoiding interference in sub-functions
        let that = this;
        // Add Static files
        this.httpApp.use("/", express.static(__dirname + "/CPannel"));
        // Start web server
        this.httpServer = this.httpApp.listen(PORT, () => console.log(`Listening on ${PORT}`));
        /** @type {socketIO.Server}*/
        this.io = socketIO(this.httpServer);
        wireUpServer(this.httpServer, this.io);
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
                }
                else {
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
                        const plyer = currentPlayer;
                        if (plyer.isMod()) {
                            // Try to close the server a clean way
                            that.close();
                            console.log("Goodbye!");
                        }
                    });
                    socket.on("updateState", function (data) {
                        that.updateState(socket, data);
                    });
                    socket.on("event", function (data) {
                        if (confighandler_1.config["verbose"]) {
                            console.log("Event received: " + JSON.stringify(data));
                        }
                        socket.broadcast.emit("event", data);
                    });
                }
            });
            socket.on('web-auth', function (data) {
                console.log(data);
                let p = data["password"];
                let u = data["username"];
                if (u === undefined || p === undefined) {
                    if (confighandler_1.config["debug"])
                        console.log("Invalid credentials.");
                    socket.emit("AuthFail", "Invalid Username/password");
                    return;
                }
                console.log(u + " is trying to log in through the web interface...");
                let user = that.pm.getPlayer(u);
                if (user === null) {
                    if (confighandler_1.config["debug"])
                        console.log("User not existing.");
                    socket.emit("AuthFail", "The entered username doesn't exists.");
                    return;
                }
                let token = user.loginOutGame(p);
                if (token === false) {
                    console.log("Auth. Failed for " + u + "!.");
                    socket.emit("AuthFail", "Invalid password");
                }
                else {
                    console.log(u + " logged in.");
                    socket.emit("AuthSuccess", token);
                    // SOCKET.ON DEFINITIONS HERE
                    socket.on("off", function (data) {
                        let p = that.pm.getBySocketID(socket.id);
                        if (p === false)
                            return;
                        if (p.isMod()) {
                            that.close();
                        }
                    });
                }
            });
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
        // Hacky way of requesting Data. Will change in the future.
        const updateGameState = function () {
            that.io.emit("tick", that.pm.getAllObjects());
            setTimeout(updateGameState, 200);
        };
        setTimeout(updateGameState, 200);
    }
    /**
     * Function called each time a user sends his new data to update the previous one. Will be removed in the future to replace with more events to prevent the need of sending big packs of data each tick.
     * @method
     * @param {socketIO.Socket} socket - The socket sending the data.
     * @param {object} data - The data sent by the socket.
     */
    updateState(socket, data) {
        let p = this.pm.getBySocketID(socket.id);
        if (p instanceof player_1.player) {
            p.updateObjects(data["token"], data["data"]);
        }
        else {
            socket.emit("error", "NotLoggedIn");
        }
    }
    /**
     * Easier to use alias of <tt>this.pm.serialize</tt>. Saves all the player Data.
     * @method
     */
    save() {
        this.pm.serialize();
    }
}
module.exports.Server = Server;
exports.default = Server;
//# sourceMappingURL=server.js.map