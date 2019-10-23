/**
 * @fileOverview A manager that contains all player instances.
 * @author Arthur Pacaud (arthuro555)
 * @version 0.0.1-dev-in-progress
 */

// Requirements
import { player, gdobject } from "./player"
import fs = require("fs");

/**
* The class for managing all the player instances.
* @class pmanager
* @property {Array<player>} players The array containing instances of <tt>player</tt>.
*/
class pmanager {
    private players: player[];
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
    getPlayer(playerName:string = null, playerUUID:string = null) {
        var i;
        for (i = 0; i < this.players.length; i += 1) {
            if (!playerUUID === null) {
                if (this.players[i].uuid === playerUUID) {
                    return this.players[i];
                }
            }
            if (!playerName === null) {
                if (this.players[i].username === playerName) {
                    return this.players[i];
                }
            }
        }
        return null; //not found
    }
    /**
     * Add a <tt>player</tt> Instance to The manager.
     * @method
     * @param {player} [playerInstance] The <tt>player</tt> instance.
     * @returns {boolean}
     */
    addPlayer(playerInstance:player) {
        let players:player[] = this.getPlayers();
        for(let p of players){
            if(p.uuid === playerInstance.uuid){
                console.error("Tried to add an already existing player to the player manager!");
                return false
            }
            if(p.username === playerInstance.username){
                console.warn("An user with the same username as an existing one is being added! Is this Normal?")
            }
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
    setOnline(playerName:string = null, playerUUID:string = null) {
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
    setOffline(playerName:string = null, playerUUID:string = null) {
        let p:player = this.getPlayer(playerName, playerUUID);
        if (p === null) {
            return false;
        }
        p.logout_force();
        return true;
    }
    /**
     * Get all <tt>objects</tt> of all <tt>players</tt>. Returns null if there are no <tt>objects</tt> on the Scene.
     * @method
     * @returns {Array | null}
     */
    getAllObjects() {
        let ol:gdobject[] = Array();
        let p:player = undefined;
        let o:gdobject = undefined;
        for (p of this.players) {
            for (o of p.data) {
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
     * Get all <tt>object</tt> of a specific <tt>player</tt> instance.
     * @method
     * @param {string | null} [playerName] The <tt>player</tt>'s instance's name.
     * @param {string | null} [playerUUID] The <tt>player</tt>'s instance's UUID.
     * @returns {Array | null}
     */
    getObjectForPlayer(playerName = null, playerUUID = null) {
        var pl = this.getPlayer(playerName, playerUUID);
        var ol = Array();
        for (var p of this.players) {
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
            let np = new player(username, password);
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
    /**
     * Serialize and save the player data in pmanager.
     * @method
     * @param {string} [file]
     * @returns {boolean}
     */
    serialize(file = "userdata.json"){
        let i:number = 0;
        let players:string[] = [];
        for(let p of this.players){
            players[i] = <string>player.serialize(p);
            i++;
        }
        console.log(players);
        fs.writeFileSync("./"+file, JSON.stringify(players));
        return true;
    }
    /**
     * Deserialize and load the player data in pmanager.
     * @method
     * @param {string} [file]
     * @returns {boolean}
     * @throws "Invalid JSON. Verify for errors or delete userdata.json."
     */
    loadData(file = "userdata.json"){
        if (fs.existsSync(file)) {
            try {
                let i = 0;
                // @ts-ignore
                let players = JSON.parse(fs.readFileSync("./"+file));
                let pl:player[] = Array(players.length);
                for(let p of players){
                    pl[i] = new player("none", "");
                    player.loadData(pl[i], p);
                    i++;
                }
                // console.log(players);
                for(let p of pl){
                    this.addPlayer(p);
                }
                return true;
            } catch (e) {
                if(e instanceof SyntaxError){
                    throw "Invalid JSON. Verify for errors or delete "+file+"."
                } else {
                    console.log("Unknown error while reading "+file+": " + e);
                }
            }
        } else{
            console.log('No user data found: creating a clean new one.');
            return false;
        }
    }
}

exports.pmanager = pmanager;