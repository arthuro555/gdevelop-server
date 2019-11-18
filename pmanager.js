"use strict";
/**
 * @fileOverview A manager that contains all player instances.
 * @author Arthur Pacaud (arthuro555)
 * @version 0.0.1-dev-in-progress
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Requirements
var fs = require("fs");
var player_1 = require("./player");
var config = require("./confighandler.js").config;
/**
* The class for managing all the player instances.
* @class pmanager
* @property {Array<player>} players The array containing instances of <tt>player</tt>.
*/
var pmanager = /** @class */ (function () {
    /** @constructor */
    function pmanager() {
        /** @type {Array<player>} */
        this.players = Array();
    }
    /**
     * Get the Array with all the player instances.
     * @returns {player[]}
     */
    pmanager.prototype.getPlayers = function () {
        return this.players;
    };
    /**
     * Get a <tt>player</tt> Instance from the username or the user UUID.
     * @method
     * @param {string | null} [playerName] The player username
     * @param {string | null} [playerUUID] The player UUID
     * @returns {player | null}
     */
    pmanager.prototype.getPlayer = function (playerName, playerUUID) {
        if (config["debug"]) {
            console.log(playerUUID, playerName, this.getPlayers());
        }
        for (var _i = 0, _a = this.getPlayers(); _i < _a.length; _i++) {
            var plyr = _a[_i];
            if (playerUUID !== undefined) {
                if (plyr.uuid === playerUUID) {
                    return plyr;
                }
            }
            if (playerName !== undefined) {
                if (plyr.username === playerName) {
                    return plyr;
                }
            }
        }
        return null; //not found
    };
    /**
     * Add a <tt>player</tt> Instance to The manager.
     * @method
     * @param {player} [playerInstance] The <tt>player</tt> instance.
     * @returns {boolean}
     */
    pmanager.prototype.addPlayer = function (playerInstance) {
        var players = this.getPlayers();
        for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
            var p = players_1[_i];
            if (p.uuid === playerInstance.uuid) {
                console.error("Tried to add an already existing player to the player manager!");
                return false;
            }
            if (p.username === playerInstance.username) {
                console.warn("An user with the same username as an existing one is being added! Is this Normal?");
            }
        }
        if (playerInstance.isMod()) {
            console.info("New Moderator Registered: " + playerInstance.username);
        }
        this.players[this.players.length] = playerInstance;
        return true;
    };
    /**
     * Set a <tt>player</tt> Instance to Online.
     * @method
     * @param {string | null} [playerName] The <tt>player</tt>'s instance's name.
     * @param {string | null} [playerUUID] The <tt>player</tt>'s instance's UUID.
     * @returns {boolean}
     * @deprecated Use this.login() instead.
     */
    pmanager.prototype.setOnline = function (playerName, playerUUID) {
        if (playerName === void 0) { playerName = null; }
        if (playerUUID === void 0) { playerUUID = null; }
        var p = this.getPlayer(playerName, playerUUID);
        if (p === null) {
            return false;
        }
        p.online = true;
        return true;
    };
    /**
     * Set a <tt>player</tt> Instance to Offline.
     * @method
     * @param {string | null} [playerName] The <tt>player</tt>'s instance's name.
     * @param {string | null} [playerUUID] The <tt>player</tt>'s instance's UUID.
     * @returns {boolean}
     * @deprecated Use this.logout() instead.
     */
    pmanager.prototype.setOffline = function (playerName, playerUUID) {
        if (playerName === void 0) { playerName = null; }
        if (playerUUID === void 0) { playerUUID = null; }
        var p = this.getPlayer(playerName, playerUUID);
        if (p === null) {
            return false;
        }
        p.logout_force();
        return true;
    };
    /**
     * Get all <tt>objects</tt> of all <tt>players</tt>. Returns null if there are no <tt>objects</tt> on the Scene.
     * @method
     * @returns {Array | null}
     */
    pmanager.prototype.getAllObjects = function () {
        var ol = Array();
        for (var _i = 0, _a = this.getPlayers(); _i < _a.length; _i++) {
            var p = _a[_i];
            for (var _b = 0, _c = p.object_data; _b < _c.length; _b++) {
                var o = _c[_b];
                ol.push(o);
            }
        }
        if (ol.length === 0) {
            return null;
        }
        else {
            return ol;
        }
    };
    /**
     * Get all <tt>object</tt> of a specific <tt>player</tt> instance.
     * @method
     * @param {string | null} [playerName] The <tt>player</tt>'s instance's name.
     * @param {string | null} [playerUUID] The <tt>player</tt>'s instance's UUID.
     * @returns {Array | null}
     */
    pmanager.prototype.getObjectForPlayer = function (playerName, playerUUID) {
        if (playerName === void 0) { playerName = null; }
        if (playerUUID === void 0) { playerUUID = null; }
        var pl = this.getPlayer(playerName, playerUUID);
        var ol = Array();
        for (var _i = 0, _a = this.getPlayers(); _i < _a.length; _i++) {
            var p = _a[_i];
            if (p === pl) {
                continue;
            }
            for (var o in p.getObjects()) {
                ol.push(o);
            }
        }
        if (ol.length === 0) {
            return null;
        }
        else {
            return ol;
        }
    };
    /**
     * Set a <tt>player</tt> online and get a token if the authentication successes.
     * @method
     * @param {string} [username] The <tt>player</tt>'s username.
     * @param {string} [password] The <tt>player</tt>'s password.
     * @returns {string | boolean}
     */
    pmanager.prototype.login = function (username, password) {
        var p = this.getPlayer(username);
        if (p === null) {
            var np = new player_1.player(username, password);
            this.addPlayer(np);
            return np.login(password);
        }
        return p.login(password);
    };
    pmanager.prototype.logout = function (username, token) {
        var p = this.getPlayer(username);
        if (p === null) {
            return false;
        }
        return p.logout(token);
    };
    /**
     * Serialize and save the player object_data in pmanager.
     * @method
     * @param {string} [file]
     * @returns {boolean}
     */
    pmanager.prototype.serialize = function (file) {
        if (file === void 0) { file = "userdata.json"; }
        var i = 0;
        var players = [];
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var p = _a[_i];
            players[i] = player_1.player.serialize(p);
            i++;
        }
        console.log(players);
        fs.writeFileSync("./" + file, JSON.stringify(players, null, 4));
        return true;
    };
    /**
     * Deserialize and load the player object_data in pmanager.
     * @method
     * @param {string} [file]
     * @returns {boolean}
     * @throws "Invalid JSON. Verify for errors or delete userdata.json."
     */
    pmanager.prototype.loadData = function (file) {
        if (file === void 0) { file = "userdata.json"; }
        if (fs.existsSync(file)) {
            try {
                var i = 0;
                // @ts-ignore
                var players = JSON.parse(fs.readFileSync("./" + file));
                var pl = Array(players.length);
                for (var _i = 0, players_2 = players; _i < players_2.length; _i++) {
                    var p = players_2[_i];
                    pl[i] = new player_1.player("none", "");
                    player_1.player.loadData(pl[i], p);
                    i++;
                }
                // console.log(players);
                for (var _a = 0, pl_1 = pl; _a < pl_1.length; _a++) {
                    var p = pl_1[_a];
                    this.addPlayer(p);
                }
                return true;
            }
            catch (e) {
                if (e instanceof SyntaxError) {
                    throw "Invalid JSON. Verify for errors or delete " + file + ".";
                }
                else {
                    console.log("Unknown error while reading " + file + ": " + e);
                }
            }
        }
        else {
            console.log('No user data found: creating a clean new one.');
            return false;
        }
    };
    return pmanager;
}());
exports.pmanager = pmanager;
exports.pmanager = pmanager;
