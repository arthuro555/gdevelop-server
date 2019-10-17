let playerClasses = require("./player.js");


class pmanager {
    constructor() {
        this.players = Array;
    }

    getPlayers() {
        return this.players;
    }

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
        } else {
            return p.login(username, password);
        }
    }
}
exports.pmanager = pmanager;