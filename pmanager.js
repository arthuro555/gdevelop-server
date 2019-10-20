/**
 * @fileOverview A manager that contains all player instances.
 * @author Arthur Pacaud (arthuro555)
 * @version 0.0.1-dev-in-progress
 */

// Requirements
let playerClasses = require("./player.js");

/**
* The class for managing all the player instances.
* @class pmanager
* @property {Array} players The array containing instances of <tt>player</tt>.
*/
class pmanager {
    /** @constructor */
    constructor() {
        /** @type {Array} */
        this.players = Array();
    }

    /**
     * Get the Array with all the player instances.
     * @returns {playerClasses.player[]}
     */
    getPlayers() {
        return this.players;
    }

    /**
     * Get a <tt>player</tt> Instance from the username or the user UUID.
     * @method
     * @param {string | null} [playerName] The player username
     * @param {string | null} [playerUUID] The player UUID
     * @returns {playerClasses.player | null}
     */
    getPlayer(playerName = null, playerUUID = null) {
        var i;
        for (i = 0; i < this.players.length; i += 1) {
            if (!playerUUID === null) {
                if (this.players[i].uuid === playerUUID) {
                    return this.players[i];
                }
            }
            if (!playerName === null) {
                if (this.players[i].name === playerName) {
                    return this.players[i];
                }
            }
        }
        return null; //not found
    }
    /**
     * Add a <tt>player</tt> Instance to The manager.
     * @method
     * @param {playerClasses.player} [player] The <tt>player</tt> instance.
     * @returns {boolean}
     */
    addPlayer(player) {
        if (!player instanceof playerClasses.player) {
            return false;
        }
        this.players.push(player);
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
        var p = this.getPlayer(playerName, playerUUID);
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
        var p = this.getPlayer(playerName, playerUUID);
        if (p === null) {
            return false;
        }
        p.logout();
        return true;
    }
    /**
     * Get all <tt>objects</tt> of all <tt>players</tt>. Returns null if there are no <tt>objects</tt> on the Scene.
     * @method
     * @returns {Array | null}
     */
    getAllObjects() {
        var ol = Array();
        for (var p in this.players) {
            for (var o in p.getObjects()) {
                ol.push(o)
            }
        }
        if (ol.length() === 0) {
            return null;
        } else {
            return ol;
        }
    }
    /**
     * Get all <tt>object</tt> of a specific <tt>player</tt> instance.
     * @method
     * @param {string | null} [playerName] The <tt>player</tt>'s instance's name.
     * @param {string | null} [playerUUID] The <tt>player</tt>'s instance's UUID.
     * @returns {Array | null}
     */
    getObjectForPlayer(playerName = null, playerUUID = null) {
        var pl = this.getPlayer(playerName, playerUUID);
        var ol = Array();
        for (var p in this.players) {
            if (p === pl) {
                continue;
            }
            for (var o in p.getObjects()) {
                ol.push(o)
            }
        }
        if (ol.length === 0) {
            return null;
        } else {
            return ol;
        }
    }
    /**
     * Set a player online and get a token if the authentication successes.
     * @method
     * @param {string} [username] The <tt>player</tt>'s username.
     * @param {string} [password] The <tt>player</tt>'s password.
     * @returns {string | boolean}
     */
    login(username, password) {
        var p = this.getPlayer(username);
        if (p === null) {
            let np = new playerClasses.player(username, password);
            this.addPlayer(np);
            return np.login(password);
        }
        return p.login(password);
    }
    logout(username, token){
        var p = this.getPlayer(username);
        if (p === null) {
            return false;
        }
        return p.logout(token);

    }
}
exports.pmanager = pmanager;