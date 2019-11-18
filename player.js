"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Requirements
var cryptog = require('crypto');
var uuidv1 = require('uuid/v1');
var uuidv4 = require('uuid/v4');
var jwt = require('jsonwebtoken');
var settings = require("./confighandler.js").config;
/**
 * Represents an Object in a scene. Stores GDevelop objects object_data.
 * @class
 * @param {string} [name] - The Name of the object to know which one to spawn.
 * @param {string} [uuid] - The GDevelop UUID to interact with an object in particular.
 * @param {number} [x] - The x-coordinate position of an object.
 * @param {number} [y] - The y-coordinate position of an object.
 */
var gdobject = /** @class */ (function () {
    /** @constructor */
    function gdobject(name, uuid, x, y) {
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
    gdobject.prototype.update = function (name, uuid, x, y) {
        /** @type {string} */
        this.name = name;
        /** @type {string} */
        this.uuid = uuid;
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
    };
    ;
    /**
     * Returns all the gdobjects object_data in an Array
     * @returns {Array}
     */
    gdobject.prototype.get = function () {
        return [this.name, this.uuid, this.x, this.y];
    };
    return gdobject;
}());
exports.gdobject = gdobject;
/**
 * Represents a Player. Authenticates players and store their login object_data and game object_data when online.
 * @class
 * @param {string} [username] - The username.
 * @param {string} [password] - The password (will automatically be hashed).
 * @param {boolean} [moderator] - Is the user an admin?
 * @property {Array<gdobject>} [object_data] - An <tt>Array</tt> containing Objects and User object_data.
 * @property {string} [_password] - The user password (Hashed).
 * @property {Array<string>} [_token] - An <tt>Array</tt> containing the Authentication tokens.
 * @property {string} [uuid] - The <tt>player</tt> Unique ID to distinguish it from other instance.
 * @property {string} [username] - The <tt>player</tt> Username.
 * @property {boolean} [online] - If the player is not online, this flag will prevent object_data to be modified.
 * @property {boolean} [moderator] - Modify this to true to let this player access Admin features (server-side).
 * @property {Array<string>} [socket_id] - Permits to identify if a socket is the owner of an account.
 */
var player = /** @class */ (function () {
    /** @constructor */
    function player(username, password, moderator) {
        if (moderator === void 0) { moderator = false; }
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
     * @param {string} [name] - The name variable of the gdobject
     * @returns {gdobject | null}
     * @throws "Trying to access object_data from a non-online player!"
     */
    player.prototype.getObjectByName = function (name) {
        if (!this.online) {
            throw "Trying to access object_data from a non-online player!";
        }
        var i;
        for (i = 0; i < this.object_data.length; i += 1) {
            if (this.object_data[i].name === name) {
                return this.object_data[i];
            }
        }
        return null; //not found
    };
    ;
    /**
     * Get an <tt>gdobject</tt> by its UUID
     * @method
     * @param {string} [uuid] - The uuid variable of the gdobject
     * @returns {gdobject | null}
     * @throws "Trying to access object_data from a non-online player!"
     */
    player.prototype.getObjectByUUID = function (uuid) {
        if (!this.online) {
            throw "Trying to access object_data from a non-online player!";
        }
        var i;
        for (i = 0; i < this.object_data.length; i += 1) {
            if (this.object_data[i].uuid === uuid) {
                return this.object_data[i];
            }
        }
        return null; //not found
    };
    ;
    /**
     * Get an <tt>gdobject</tt>'s ID (mapping in <tt>player</tt> gdobject) by its UUID.
     * @method
     * @param {string} [uuid] - The uuid variable of the gdobject.
     * @returns {number | null}
     * @throws "Trying to access object_data from a non-online player!"
     */
    player.prototype.getObjectID = function (uuid) {
        if (!this.online) {
            throw "Trying to access object_data from a non-online player!";
        }
        var i;
        for (i = 0; i < this.object_data.length; i += 1) {
            if (this.object_data[i].uuid === uuid) {
                return i;
            }
        }
        return null; //not found
    };
    ;
    /**
     * Add a gdobject to the Player.
     * @method
     * @param {string} [token] - The authorization/authentication token.
     * @param {gdobject} [object] - The gdobject to add.
     * @returns {boolean}
     * @throws "Trying to access object_data from a non-online player!"
     */
    player.prototype.addObject = function (token, object) {
        if (!this.verifyToken(token)) {
            return false;
        }
        if (!this.online) {
            throw "Trying to access object_data from a non-online player!";
        }
        this.object_data.push(object);
        return true;
    };
    ;
    /**
     * Remove a gdobject from the Player.
     * @method
     * @param {string} token - The authorization/authentication token.
     * @param {string | null} [name] - The UUID of the gdobject to remove.
     * @param {string | null} [uuid] - The name of the gdobject to remove.
     * @returns {boolean}
     */
    player.prototype.removeObject = function (token, name, uuid) {
        if (name === void 0) { name = null; }
        if (uuid === void 0) { uuid = null; }
        if (!this.verifyToken(token)) {
            return false;
        }
        if (!this.online) {
            throw "Trying to access object_data from a non-online player!";
        }
        if (!name === null) {
            var id = this.getObjectID(this.getObjectByName(name).uuid);
            if (id === null) {
                return false;
            }
            this.object_data.splice(id, 1);
            return true;
        }
        if (!uuid === null) {
            var id = this.getObjectID(uuid);
            if (id === null) {
                return false;
            }
            this.object_data.splice(id, 1);
            return true;
        }
        return false;
    };
    ;
    /**
     * Verify if a token comes from the player and is valid.
     * @method
     * @param {string} [token] - The authorization/authentication token.
     * @returns {boolean}
     */
    player.prototype.verifyToken = function (token) {
        try {
            var exists = false;
            var tuuid = "nope";
            for (var t in this._token) {
                if (t[0] === token) {
                    exists = true;
                    tuuid = t[1];
                }
            }
            if (exists === false) {
                return false;
            }
            var data = jwt.verify(token, settings["SECRET"]);
            return data["username"] === this.username && data["password"] === this._password && data["tokenUUID"] === tuuid;
        }
        catch (e) {
            return false;
        }
    };
    ;
    /**
     * Invalidate a Token (Aka Logout).
     * @method
     * @param {string} [token] - The authorization/authentication token.
     * @returns {boolean}
     */
    player.prototype.removeToken = function (token) {
        if (this.verifyToken(token)) {
            var i = void 0;
            for (i = 0; i < this._token.length; i += 1) {
                if (this._token[i][0] === token) {
                    this._token.splice(i, 0);
                    return true;
                }
            }
            return false; //not found
        }
    };
    /**
     * Verify if a token comes from the <tt>player</tt> and is valid.
     * @method
     * @param {string} [password] - The <tt>player</tt>'s Password
     * @returns {boolean | string}
     */
    player.prototype.login = function (password) {
        password = cryptog.createHash('sha256').update(password).digest('hex');
        if (password === this._password) {
            var tuuid = uuidv4();
            var secret = settings["SECRET"];
            var token = jwt.sign({ "username": this.username, "password": password, "tokenUUID": tuuid }, secret);
            var tarray = Array(token, tuuid);
            // @ts-ignore
            this._token.push(tarray);
            this.online = true;
            return token;
        }
        return false;
    };
    /**
     * Hashes the input and compare the hash with <tt>this._password</tt>.
     * @method
     * @param {string} [password] - The <tt>player</tt>'s password.
     * @returns {boolean}
     */
    player.prototype.verifyPassword = function (password) {
        return cryptog.createHash('sha256').update(password).digest('hex') === this._password;
    };
    /**
     * Change The <tt>player</tt>'s password. Needs either a valid token or the current password.
     * @method
     * @param {string | null} [token] - The authorization/authentication token.
     * @param {string | null} [oldPassword] - The current password.
     * @param {string} [newPassword] - The new password.
     * @returns {boolean}
     */
    player.prototype.modifyPassword = function (token, oldPassword, newPassword) {
        if (token === void 0) { token = null; }
        if (oldPassword === void 0) { oldPassword = null; }
        if (this.verifyToken(token) || this.verifyPassword(oldPassword)) {
            this._password = cryptog.createHash('sha256').update(newPassword).digest('hex');
            return true;
        }
        return false;
    };
    /**
     * Deletes the current Token and set the player to offline.
     * @method
     * @param {string} [token] - The authorization/authentication token.
     * @returns {boolean}
     */
    player.prototype.logout = function (token) {
        if (this.verifyToken(token)) {
            this.removeToken(token);
            this.object_data = Array(); //Clear all object_data
            this.online = false;
            return true;
        }
        return false;
    };
    /**
     * Forces the logout with or without token.
     * @returns {boolean}
     */
    player.prototype.logout_force = function () {
        this.object_data = Array(); //Clear all object_data
        this.online = false;
        return true;
    };
    /**
     * Get an array with all the gdobjects.
     * @method
     * @returns {Array}
     */
    player.prototype.getObjects = function () {
        return this.object_data;
    };
    /**
     * Update gdobjects
     * @param {string} [token] - The authorization/authentication token.
     * @param {Array<gdobject>} [objectArray] - An array with all the gdobjects.
     */
    player.prototype.updateObjects = function (token, objectArray) {
        // Auth
        if (!this.verifyToken(token)) {
            return false;
        }
        // Object Update
        this.object_data = objectArray;
        return true;
    };
    /**
     * Check if is a moderator.
     * @return {boolean}
     */
    player.prototype.isMod = function () {
        return this.moderator;
    };
    /**
     * Serialize and returns the player object_data.
     * @method
     * @param {player} [playerInstance] - The player instance where the object_data should be loaded from.
     * @returns {Array}
     */
    player.serialize = function (playerInstance) {
        var data = {};
        data["username"] = playerInstance.username;
        data["uuid"] = playerInstance.uuid;
        data["password"] = playerInstance._password;
        data["moderator"] = playerInstance.moderator;
        return data;
    };
    /**
     * Loads player object_data from an array.
     * @method
     * @param {player} [playerInstance] - The player instance where the object_data should be loaded.
     * @param {Array} [data] - The serialized player object_data.
     * @returns {player}
     */
    player.loadData = function (playerInstance, data) {
        playerInstance.username = data["username"];
        playerInstance.uuid = data["uuid"];
        playerInstance._password = data["password"];
        playerInstance.moderator = data["moderator"];
        return true;
    };
    return player;
}());
exports.player = player;
exports.gdobject = gdobject;
exports.player = player;
