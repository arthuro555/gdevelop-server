/**
 * @fileOverview Definition of players and objects, that will contain the user data.
 * @author Arthur Pacaud (arthuro555)
 * @version 0.0.1-dev-in-progress
 */


// Requirements
let crypto = require('crypto');
const uuidv1 = require('uuid/v1');
const uuidv4 = require('uuid/v4');
let jwt = require('jsonwebtoken');
const settings = require("./confighandler.js").config;

/**
 * Represents an Object in a scene. Stores GDevelop objects data.
 * @constructor
 * @param {string} [name] - The Name of the object to know which one to spawn.
 * @param {string} [uuid] - The GDevelop UUID to interact with an object in particular.
 * @param {string} [x] - The x-coordinate position of an object.
 * @param {string} [y] - The y-coordinate position of an object.
 */
class object {
    /** @constructor */
    constructor(name, uuid, x, y){
        /** @type {string} */
        this.name = name;
        /** @type {string} */
        this.uuid = uuid;
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
    };
    update(name, uuid, x, y){
        /** @type {string} */
        this.name = name;
        /** @type {string} */
        this.uuid = uuid;
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
    };
    /**
     * Returns all the object data in an Array
     * @returns {Array}
     */
    get(){
        return [this.name, this.uuid, this.x, this.y];
    }
}

/**
 * Represents a Player. Authenticates players and store their login data and game data when online.
 * @class
 * @param {string} [username] - The username.
 * @param {string} [password] - The password (will automatically be hashed).
 * @property {Array<object>} [data] - An <tt>Array</tt> containing Objects and User data.
 * @property {string} [_password] - The user password (Hashed).
 * @property {Array<string>} [_token] - An <tt>Array</tt> containing the Authentication tokens.
 * @property {string} [uuid] - The <tt>player</tt> Unique ID to distinguish it from other instance.
 * @property {string} [username] - The <tt>player</tt> Username.
 * @property {boolean} [online] - If the player is not online, this flag will prevent data to be modified.
 * @property {boolean} [moderator] - Modify this to true to let this player access Admin features (server-side).
 */
class player {
    /** @constructor */
    constructor(username, password){
        /** @type {Array<object>} */
        this.data = Array();
        /**
         * @type {string}
         * @private
         */
        this._password = crypto.createHash('sha256').update(password).digest('hex');
        /**
         * @type {Array<string>}
         * @private
         */
        this._token = Array();
        /** @type {string} */
        this.uuid = uuidv1();
        /** @type {string} */
        this.username = username;
        /** @type {boolean} */
        this.online = false;
        /** @type {boolean} */
        this.moderator = false;
    };
    /**
     * Get an <tt>object</tt> by its name (Prefer getObjectByUUID())
     * @method
     * @param {string} [name] - The name variable of the Object
     * @returns {object | null}
     * @throws "Trying to access data from a non-online player!"
     */
    getObjectByName(name){
        if (!this.online){
            throw "Trying to access data from a non-online player!";
        }
        var i;
        for (i = 0; i < this.data.length; i += 1) {
            if (this.data[i].name === name) {
                return this.data[i];
            }
        }
        return null; //not found
    };
    /**
     * Get an <tt>object</tt> by its UUID
     * @method
     * @param {string} [uuid] - The uuid variable of the Object
     * @returns {object | null}
     * @throws "Trying to access data from a non-online player!"
     */
    getObjectByUUID(uuid){
        if (!this.online){
            throw "Trying to access data from a non-online player!";
        }
        var i;
        for (i = 0; i < this.data.length; i += 1) {
            if (this.data[i].uuid === uuid) {
                return this.data[i];
            }
        }
        return null; //not found
    };
    /**
     * Get an <tt>object</tt>'s ID (mapping in <tt>player</tt> object) by its UUID.
     * @method
     * @param {string} [uuid] - The uuid variable of the Object.
     * @returns {number | null}
     * @throws "Trying to access data from a non-online player!"
     */
    getObjectID(uuid){
        if (!this.online){
            throw "Trying to access data from a non-online player!";
        }
        var i;
        for (i = 0; i < this.data.length; i += 1) {
            if (this.data[i].uuid === uuid) {
                return i;
            }
        }
        return null; //not found
    };
    /**
     * Add an object to the Player.
     * @method
     * @param {string} [token] - The authorization/authentication token.
     * @param {object} [object] - The Object to add.
     * @returns {boolean}
     * @throws "Trying to access data from a non-online player!"
     */
    addObject(token, object){
        if(!this.verifyToken(token)){
            return false;
        }
        if (!this.online){
            throw "Trying to access data from a non-online player!";
        }
        this.data.push(object);
        return true
    };
    /**
     * Remove an object from the Player.
     * @method
     * @param {string} token - The authorization/authentication token.
     * @param {string | null} [name] - The UUID of the object to remove.
     * @param {string | null} [uuid] - The name of the object to remove.
     * @returns {boolean}
     */
    removeObject(token, name = null, uuid = null){
        if(!this.verifyToken(token)){
            return false;
        }
        if (!this.online){
            throw "Trying to access data from a non-online player!";
        }
        if(!name === null){
            var id = this.getObjectID(this.getObjectByName(name).uuid);
            if(id === null){
               return false
            }
            this.data.splice(id, 1);
            return true;
        }
        if(!uuid === null){
            var id = this.getObjectID(uuid);
            if(id === null){
                return false
            }
            this.data.splice(id, 1);
            return true;
        }
        return false;
    };
    /**
     * Verify if a token comes from the player and is valid.
     * @method
     * @param {string} [token] - The authorization/authentication token.
     * @returns {boolean}
     */
    verifyToken(token){
        try {
            var exists = false;
            for(var t in this._token){
                if(t[0] === token){
                    exists = true;
                    var tuuid = t[1];
                }
            }
            if(exists === false){return false}
            var data = jwt.verify(token, settings["SECRET"]);
            return data["username"] === this.username && data["password"] === this._password && data["tokenUUID"] === tuuid;
        } catch (e){
            return false;
        }
    };
    /**
     * Invalidate a Token (Aka Logout).
     * @method
     * @param {string} [token] - The authorization/authentication token.
     * @returns {boolean}
     */
    removeToken(token){
        if(this.verifyToken(token)){
            var i;
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
     * Verify if a token comes from the <tt>player</tt> and is valid.
     * @method
     * @param {string} [password] - The <tt>player</tt>'s Password
     * @returns {boolean | string}
     */
    login(password){
        password = crypto.createHash('sha256').update(password).digest('hex');
        if(password === this._password){
            var tuuid = uuidv4();
            var token = jwt.sign({"username": this.username, "password": password, "tokenUUID":tuuid}, settings["SECRET"]);
            this._token.push([token,tuuid]);
            this.online = true;
            return token;
        }
        return false;
    }
    /**
     * Hashes the input and compare the hash with <tt>this._password</tt>.
     * @method
     * @param {string} [password] - The <tt>player</tt>'s password.
     * @returns {boolean}
     */
    verifyPassword(password){
        return crypto.createHash('sha256').update(password).digest('hex') === this._password;
    }
    /**
     * Change The <tt>player</tt>'s password. Needs either a valid token or the current password.
     * @method
     * @param {string | null} [token] - The authorization/authentication token.
     * @param {string | null} [oldPassword] - The current password.
     * @param {string} [newPassword] - The new password.
     * @returns {boolean}
     */
    modifyPassword(token=null, oldPassword=null, newPassword){
        if(this.verifyToken(token) || this.verifyPassword(oldPassword)){
            this._password = crypto.createHash('sha256').update(newPassword).digest('hex');
            return true;
        }
        return false;
    }
    /**
     * Deletes the current Token and set the player to offline.
     * @method
     * @param {string} [token] - The authorization/authentication token.
     * @returns {boolean}
     */
    logout(token){
        if(this.verifyToken(token)) {
            this.removeToken(token);
            this.data = Array();  //Clear all data
            this.online = false;
            return true;
        }
        return false;
    }

    /**
     * Forces the logout with or without token.
     * @returns {boolean}
     */
    logout_force(){
        this.data = Array();  //Clear all data
        this.online = false;
        return true;
    }
    /**
     * Get an array with all the objects.
     * @method
     * @returns {Array}
     */
    getObjects(){
        return this.data;
    }

    /**
     * Update objects
     * @param {string} [token] - The authorization/authentication token.
     * @param {Array<object>} [objectArray] - An array with all the objects.
     */
    updateObjects(token, objectArray){
        // Auth
        if(!this.verifyToken(token)){return false}
        // Validation
        for(let ob in objectArray){
            if(!ob instanceof object){
                return false;
            }
        }
        this.data = objectArray;
        return true;
    }
    /**
     * Serialize and returns the player data.
     * @method
     * @param {player} [playerInstance] - The player instance where the data should be loaded from.
     * @returns {Array}
     */
    static serialize(playerInstance){
        let data = {};
        data["username"] = playerInstance.username;
        data["password"] = playerInstance._password;
        data["moderator"] = playerInstance.moderator;
        return data;
    }
    /**
     * Loads player data from an array.
     * @method
     * @param {player} [playerInstance] - The player instance where the data should be loaded.
     * @param {Array} [data] - The serialized player data.
     * @returns {boolean}
     */
    static loadData(playerInstance, data){
        playerInstance.username = data["username"];
        playerInstance._password = data["password"];
        playerInstance.moderator = data["moderator"];
        return true;
    }
}
exports.object = object;
exports.player = player;