"use strict";
/**
 * @fileOverview A manager that contains all player instances.
 * @author Arthur Pacaud (arthuro555)
 * @version 0.0.1-dev-in-progress
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Requirements
const fs = require("fs");
const player_1 = require("./player");
const config = require("./confighandler.js").config;
/**
* The class for managing all the player instances.
* @class pmanager
* @property {Array<player>} players - The array containing instances of <tt>player</tt>.
*/
class pmanager {
    /** @constructor */
    constructor() {
        /** @type {Array<player>} */
        this.players = Array();
    }
    /**
     * Get the Array with all the player instances.
     * @returns {player[]}
     */
    getPlayers() {
        return this.players;
    }
    /**
     * Get a <tt>player</tt> Instance from the username or the user UUID.
     * @method
     * @param {string | null} [playerName] The player username
     * @param {string | null} [playerUUID] The player UUID
     * @returns {player | null}
     */
    getPlayer(playerName, playerUUID) {
        // if (config["debug"]) {console.log(playerUUID, playerName, this.getPlayers());}
        for (const plyr of this.getPlayers()) {
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
    }
    /**
     * Add a <tt>player</tt> Instance to The manager.
     * @method
     * @param {player} playerInstance - The <tt>player</tt> instance.
     * @returns {boolean}
     */
    addPlayer(playerInstance) {
        let players = this.getPlayers();
        for (let p of players) {
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
    }
    /**
     * Set a <tt>player</tt> Instance to Online.
     * @method
     * @param {string | null} [playerName] The <tt>player</tt>'s instance's name.
     * @param {string | null} [playerUUID] The <tt>player</tt>'s instance's UUID.
     * @returns {boolean}
     * @deprecated Use this.login() instead.
     */
    setOnline(playerName = null, playerUUID = null) {
        let p = this.getPlayer(playerName, playerUUID);
        if (p === null) {
            return false;
        }
        p.online = true;
        return true;
    }
    /**
     * Set a <tt>player</tt> Instance to Offline.
     * @method
     * @param {string | null} [playerName] The <tt>player</tt>'s instance's name.
     * @param {string | null} [playerUUID] The <tt>player</tt>'s instance's UUID.
     * @returns {boolean}
     * @deprecated Use this.logout() instead.
     */
    setOffline(playerName = null, playerUUID = null) {
        let p = this.getPlayer(playerName, playerUUID);
        if (p === null) {
            return false;
        }
        p.logout_force();
        return true;
    }
    /**
     * Get all <tt>objects</tt> of all <tt>players</tt>. Returns null if there are no <tt>objects</tt> on the Scene.
     * @method
     * @returns {Array<gdobject> | null}
     */
    getAllObjects() {
        let ol = Array();
        for (const p of this.getPlayers()) {
            for (const o of p.object_data) {
                ol.push(o);
            }
        }
        if (ol.length === 0) {
            return null;
        }
        else {
            return ol;
        }
    }
    /**
     * Get all <tt>object</tt> of a specific <tt>player</tt> instance.
     * @method
     * @param {string | null} [playerName] The <tt>player</tt>'s instance's name.
     * @param {string | null} [playerUUID] The <tt>player</tt>'s instance's UUID.
     * @returns {Array<gdobject> | null}
     */
    getObjectForPlayer(playerName = null, playerUUID = null) {
        let pl = this.getPlayer(playerName, playerUUID);
        let ol = Array();
        for (let p of this.getPlayers()) {
            if (p === pl) {
                continue;
            }
            for (let o in p.getObjects()) {
                ol.push(o);
            }
        }
        if (ol.length === 0) {
            return null;
        }
        else {
            return ol;
        }
    }
    /**
     * Set a <tt>player</tt> online and get a token if the authentication successes.
     * @method
     * @param {string} username The <tt>player</tt>'s username.
     * @param {string} password The <tt>player</tt>'s password.
     * @returns {string | boolean}
     */
    login(username, password, socketID) {
        let p = this.getPlayer(username);
        if (p === null) {
            let np = new player_1.player(username, password);
            this.addPlayer(np);
            return np.login(password, socketID);
        }
        return p.login(password, socketID);
    }
    /**
     * Set a <tt>player</tt> offline and clear his data.
     * @method
     * @param {string} username - The <tt>player</tt>'s username.
     * @param {string} token - The <tt>player</tt>'s token.
     * @returns {boolean}
     */
    logout(username, token) {
        let p = this.getPlayer(username);
        if (p === null) {
            return false;
        }
        return p.logout(token);
    }
    /**
     * Finds an use with it's socket ID.
     * @method
     * @param {string} socketID - The Socket ID
     * @return {player | boolean}
     */
    getBySocketID(socketID) {
        /** @type {player}*/
        for (let plyr of this.players) {
            if (plyr.verifySocketID(socketID)) {
                return plyr;
            }
        }
        return false;
    }
    /**
     * Serialize and save the player data in pmanager to a local file.
     * @method
     * @param {string} [file]
     * @returns {boolean}
     */
    serialize(file = "userdata.json") {
        let i = 0;
        let players = [];
        for (let p of this.players) {
            players[i] = player_1.player.serialize(p);
            i++;
        }
        // if (config["debug"]){console.log(players);}
        fs.writeFileSync("./serverData/" + file, JSON.stringify(players, null, 4));
        return true;
    }
    /**
     * Deserialize and load the player data into pmanager.
     * @method
     * @param {string} [file]
     * @returns {boolean}
     * @throws "Invalid JSON. Verify for errors or delete userdata.json/the file containing the user data.."
     */
    loadData(file = "userdata.json") {
        if (fs.existsSync("./serverData/" + file)) {
            try {
                let i = 0;
                // @ts-ignore
                let players = JSON.parse(fs.readFileSync("./serverData/" + file));
                let pl = Array(players.length);
                for (let p of players) {
                    pl[i] = new player_1.player("none", "");
                    player_1.player.loadData(pl[i], p);
                    i++;
                }
                // console.log(players);
                for (let p of pl) {
                    this.addPlayer(p);
                }
                return true;
            }
            catch (e) {
                if (e instanceof SyntaxError) {
                    throw new Error("Invalid JSON. Verify for errors or delete " + file + ".");
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
    }
}
exports.pmanager = pmanager;
exports.pmanager = pmanager;
//# sourceMappingURL=pmanager.js.map