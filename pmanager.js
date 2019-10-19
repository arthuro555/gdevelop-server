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
     * @param {string} [playerName] The player username
     * @param {string} [playerUUID] The player UUID
     * @returns {playerClasses.player}
     * @returns {null}
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

    addPlayer(player) {
        if (!player instanceof playerClasses.player) {
            return false;
        }
        this.players.push(player);
        return true;
    }

    setOnline(playerName = null, playerUUID = null) {
        var p = this.getPlayer(playerName, playerUUID);
        if (p === null) {
            return false;
        }
        p.online = true;
        return true;
    }

    setOffline(playerName = null, playerUUID = null) {
        var p = this.getPlayer(playerName, playerUUID);
        if (p === null) {
            return false;
        }
        p.logout();
        return true;
    }

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
        if (ol.length() === 0) {
            return null;
        } else {
            return ol;
        }
    }

    login(username, password) {
        var p = this.getPlayer(username);
        if (p === null) {
            let np = new playerClasses.player(username, password);
            this.addPlayer(np);
            return np.login(password);
        }
        return p.login(username, password);
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