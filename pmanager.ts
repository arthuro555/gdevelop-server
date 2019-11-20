/**
 * @fileOverview A manager that contains all player instances.
 * @author Arthur Pacaud (arthuro555)
 * @version 0.0.1-dev-in-progress
 */

// Requirements
const fs = require("fs");
import { player, gdobject } from "./player";
const config = require("./confighandler.js").config;

/**
* The class for managing all the player instances.
* @class pmanager
* @property {Array<player>} players - The array containing instances of <tt>player</tt>.
*/
export class pmanager {
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
    getPlayer(playerName?:string, playerUUID?:string) {
        if (config["debug"]) {console.log(playerUUID, playerName, this.getPlayers());}
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
        if(playerInstance.isMod()){
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
    setOnline(playerName:string = null, playerUUID:string = null) {
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
     * @returns {Array<gdobject> | null}
     */
    getAllObjects() {
        let ol:gdobject[] = Array();
        for (const p of this.getPlayers()) {
            for (const o of p.object_data) {
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
     * Set a <tt>player</tt> online and get a token if the authentication successes.
     * @method
     * @param {string} username The <tt>player</tt>'s username.
     * @param {string} password The <tt>player</tt>'s password.
     * @returns {string | boolean}
     */
    login(username, password) {
        let p = this.getPlayer(username);
        if (p === null) {
            let np = new player(username, password);
            this.addPlayer(np);
            return np.login(password);
        }
        return p.login(password);
    }
    /**
     * Set a <tt>player</tt> offline and clear his data.
     * @method
     * @param {string} username - The <tt>player</tt>'s username.
     * @param {string} token - The <tt>player</tt>'s token.
     * @returns {boolean}
     */
    logout(username, token){
        let p = this.getPlayer(username);
        if (p === null) {
            return false;
        }
        return p.logout(token);
    }
    /**
     * Serialize and save the player data in pmanager to a local file.
     * @method
     * @param {string} [file]
     * @returns {boolean}
     */
    serialize(file = "userdata.json"){
        let i:number = 0;
        let players:string[] = [];
        for(let p of this.players){
            players[i] = <string><unknown>player.serialize(p);
            i++;
        }
        if (config["debug"]){console.log(players);}
        fs.writeFileSync("./"+file, JSON.stringify(players, null, 4));
        return true;
    }
    /**
     * Deserialize and load the player data into pmanager.
     * @method
     * @param {string} [file]
     * @returns {boolean}
     * @throws "Invalid JSON. Verify for errors or delete userdata.json/the file containing the user data.."
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
                    throw new Error("Invalid JSON. Verify for errors or delete "+file+".")
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