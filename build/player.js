"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Requirements
let cryptog = require('crypto');
const uuidv1 = require('uuid/v1');
const uuidv4 = require('uuid/v4');
let jwt = require('jsonwebtoken');
const settings = require("./confighandler.js").config;
/**
 * Represents an Object in a scene. Stores GDevelop objects object_data.
 * @class
 * @param {string} name - The Name of the object to know which one to spawn.
 * @param {string} uuid - The GDevelop UUID to interact with an object in particular.
 * @param {number} x - The x-coordinate position of an object.
 * @param {number} y - The y-coordinate position of an object.
 */
class gdobject {
    /** @constructor */
    constructor(name, uuid, x, y) {
        /** @type {string} */
        this.name = name;
        /** @type {string} */
        this.uuid = uuid;
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
    }
    ;
    update(name, uuid, x, y) {
        this.name = name;
        this.uuid = uuid;
        this.x = x;
        this.y = y;
    }
    ;
    /**
     * Returns all the gdobjects object_data in an Array
     * @returns {Array}
     */
    get() {
        return [this.name, this.uuid, this.x, this.y];
    }
}
exports.gdobject = gdobject;
/**
 * Represents a Player. Authenticates players and store their login object_data and game object_data when online.
 * @class
 * @param {string} username - The username.
 * @param {string} password - The password (will automatically be hashed).
 * @param {boolean} [moderator] - Is the user an admin?
 * @property {Array<gdobject>} object_data - An <tt>Array</tt> containing Objects and User data.
 * @property {string} _password - The user password (Hashed).
 * @property {Array<string>} _token - An <tt>Array</tt> containing the Authentication tokens.
 * @property {string} uuid - The <tt>player</tt> Unique ID to distinguish it from other instance.
 * @property {string} username - The <tt>player</tt> Username.
 * @property {boolean} online - If the player is not online, this flag will prevent object_data to be modified.
 * @property {boolean} moderator - Modify this to true to let this player access Admin features (server-side).
 * @property {Array<string>} socket_id - Permits to identify if a socket is the owner of an account.
 */
class player {
    /** @constructor */
    constructor(username, password, moderator = false) {
        /** @type {Array<gdobject>} */
        this.object_data = [];
        /**
         * @type {string}
         * @private
         */
        this._password = cryptog.createHash('sha256').update(password).digest('hex');
        /**@type {string[]}*/
        this.socket_id = [];
        /**
         * @type {Array<string>}
         * @private
         */
        this._token = [];
        /** @type {string} */
        this.uuid = uuidv1();
        /** @type {string} */
        this.username = username;
        /** @type {boolean} */
        this.online = false;
        /** @type {boolean} */
        this.moderator = moderator;
    }
    ;
    /**
     * Get an <tt>gdobject</tt> by its name (Prefer getObjectByUUID())
     * @method
     * @param {string} name - The name variable of the gdobject
     * @returns {gdobject | null}
     * @throws "Trying to access object_data from a non-online player!"
     */
    getObjectByName(name) {
        if (!this.online) {
            throw new Error("Trying to access object_data from a non-online player!");
        }
        let i;
        for (i = 0; i < this.object_data.length; i += 1) {
            if (this.object_data[i].name === name) {
                return this.object_data[i];
            }
        }
        return null; //not found
    }
    ;
    /**
     * Get a <tt>gdobject</tt> by its UUID
     * @method
     * @param {string} uuid - The uuid variable of the gdobject
     * @returns {gdobject | null}
     * @throws "Trying to access object_data from a non-online player!"
     */
    getObjectByUUID(uuid) {
        if (!this.online) {
            throw new Error("Trying to access object_data from a non-online player!");
        }
        let i;
        for (i = 0; i < this.object_data.length; i += 1) {
            if (this.object_data[i].uuid === uuid) {
                return this.object_data[i];
            }
        }
        return null; //not found
    }
    ;
    /**
     * Get a <tt>gdobject</tt>'s ID (mapping in <tt>player</tt> gdobject) by its UUID.
     * @method
     * @param {string} uuid - The uuid variable of the gdobject.
     * @returns {number | null}
     * @throws "Trying to access object_data from a non-online player!"
     */
    getObjectID(uuid) {
        if (!this.online) {
            throw new Error("Trying to access object_data from a non-online player!");
        }
        let i;
        for (i = 0; i < this.object_data.length; i += 1) {
            if (this.object_data[i].uuid === uuid) {
                return i;
            }
        }
        return null; //not found
    }
    ;
    /**
     * Add a gdobject to the Player.
     * @method
     * @param {string} token - The authorization/authentication token.
     * @param {gdobject} object - The gdobject to add.
     * @returns {boolean}
     * @throws "Trying to access object_data from a non-online player!"
     */
    addObject(token, object) {
        if (!this.verifyToken(token)) {
            return false;
        }
        if (!this.online) {
            throw new Error("Trying to access object_data from a non-online player!");
        }
        this.object_data.push(object);
        return true;
    }
    ;
    /**
     * Remove a gdobject from the Player.
     * @method
     * @param {string} token - The authorization/authentication token.
     * @param {string | null} [name] - The name of the gdobject to remove.
     * @param {string | null} [uuid] - The UUID of the gdobject to remove.
     * @returns {boolean}
     */
    removeObject(token, name = null, uuid = null) {
        if (!this.verifyToken(token)) {
            return false;
        }
        if (!this.online) {
            throw new Error("Trying to access object_data from a non-online player!");
        }
        if (!name === null) {
            let id = this.getObjectID(this.getObjectByName(name).uuid);
            if (id === null) {
                return false;
            }
            this.object_data.splice(id, 1);
            return true;
        }
        if (!uuid === null) {
            let id = this.getObjectID(uuid);
            if (id === null) {
                return false;
            }
            this.object_data.splice(id, 1);
            return true;
        }
        return false;
    }
    ;
    /**
     * Verify if a token comes from the player and is valid.
     * @method
     * @param {string} token - The authorization/authentication token.
     * @returns {boolean}
     */
    verifyToken(token) {
        try {
            let exists = false;
            let tuuid = "nope";
            for (let t in this._token) {
                if (t[0] === token) {
                    exists = true;
                    tuuid = t[1];
                }
            }
            if (exists === false) {
                return false;
            }
            let data = jwt.verify(token, settings["SECRET"]);
            return data["username"] === this.username && data["password"] === this._password && data["tokenUUID"] === tuuid;
        }
        catch (e) {
            return false;
        }
    }
    ;
    /**
     * Invalidate a Token (Aka Logout).
     * @method
     * @param {string} token - The authorization/authentication token.
     * @returns {boolean}
     */
    removeToken(token) {
        if (this.verifyToken(token)) {
            let i;
            for (i = 0; i < this._token.length; i += 1) {
                if (this._token[i][0] === token) {
                    this._token.splice(i, 0);
                    return true;
                }
            }
            return false; //not found
        }
    }
    /**
     * Verify the password and returns a new token if it was correct, and false if it wasn't.
     * @method
     * @param {string} password - The <tt>player</tt>'s Password
     * @returns {boolean | string}
     */
    login(password) {
        password = cryptog.createHash('sha256').update(password).digest('hex');
        if (password === this._password) {
            let tuuid = uuidv4();
            let secret = settings["SECRET"];
            let token = jwt.sign({ "username": this.username, "password": password, "tokenUUID": tuuid }, secret);
            let tarray = Array(token, tuuid);
            // @ts-ignore
            this._token.push(tarray);
            this.online = true;
            return token;
        }
        return false;
    }
    /**
     * Hashes the input and compare the hash with <tt>this._password</tt>.
     * @method
     * @param {string} password - The <tt>player</tt>'s password.
     * @returns {boolean}
     */
    verifyPassword(password) {
        return cryptog.createHash('sha256').update(password).digest('hex') === this._password;
    }
    /**
     * Change The <tt>player</tt>'s password. Needs either a valid token or the current password.
     * @method
     * @param {string | null} [token] - The authorization/authentication token.
     * @param {string | null} [oldPassword] - The current password.
     * @param {string} newPassword - The new password.
     * @returns {boolean}
     */
    modifyPassword(token = null, oldPassword = null, newPassword) {
        if (this.verifyToken(token) || this.verifyPassword(oldPassword)) {
            this._password = cryptog.createHash('sha256').update(newPassword).digest('hex');
            return true;
        }
        return false;
    }
    /**
     * Deletes the current Token and set the player to offline.
     * @method
     * @param {string} token - The authorization/authentication token.
     * @returns {boolean}
     */
    logout(token) {
        if (this.verifyToken(token)) {
            this.removeToken(token);
            this.object_data = Array(); //Clear all object_data
            this.online = false;
            return true;
        }
        return false;
    }
    /**
     * Forces the logout with or without token.
     * @method
     * @returns {boolean}
     */
    logout_force() {
        this.object_data = Array(); //Clear all object_data
        this.online = false;
        return true;
    }
    /**
     * Get an array with all the gdobjects.
     * @method
     * @returns {Array}
     */
    getObjects() {
        return this.object_data;
    }
    /**
     * Update gdobjects
     * @param {string} token - The authorization/authentication token.
     * @param {Array<gdobject>} objectArray - An array with all the gdobjects.
     */
    updateObjects(token, objectArray) {
        // Auth
        if (!this.verifyToken(token)) {
            return false;
        }
        // Object Update
        this.object_data = objectArray;
        return true;
    }
    /**
     * Check if is a moderator.
     * @method
     * @return {boolean}
     */
    isMod() {
        return this.moderator;
    }
    /**
     * Serialize and returns the player object_data.
     * @method
     * @static
     * @param {player} playerInstance - The player instance where the object_data should be loaded from.
     * @returns {Array}
     */
    static serialize(playerInstance) {
        let data = {};
        data["username"] = playerInstance.username;
        data["uuid"] = playerInstance.uuid;
        data["password"] = playerInstance._password;
        data["moderator"] = playerInstance.moderator;
        return data;
    }
    /**
     * Loads player object_data from an array.
     * @method
     * @static
     * @param {player} playerInstance - The player instance where the object_data should be loaded.
     * @param {Array} data - The serialized player object_data.
     * @returns {player}
     */
    static loadData(playerInstance, data) {
        playerInstance.username = data["username"];
        playerInstance.uuid = data["uuid"];
        playerInstance._password = data["password"];
        playerInstance.moderator = data["moderator"];
        return true;
    }
}
exports.player = player;
exports.gdobject = gdobject;
exports.player = player;
//# sourceMappingURL=player.js.map