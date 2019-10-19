/**
 * @fileOverview Definition of players and objects, that will contain the user data.
 * @author Arthur Pacaud (arthuro555)
 * @version 0.0.1-dev-in-progress
 */


// Requirements
let crypto = require('crypto');
const uuidv1 = require('uuid/v1');
const uuidv4 = require('uuid/v4');
var jwt = require('jsonwebtoken');
const settings = require("./confighandler.js").config;

/**
 * Represents an Object in a scene. Stores GDevelop objects data.
 * @constructor
 * @param {string} name - The Name of the object to know which one to spawn.
 * @param {string} uuid - The GDevelop UUID to interact with an object in particular.
 * @param {string} x - The x-coordinate position of an object.
 * @param {string} y - The y-coordinate position of an object.
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
 * @constructor
 * @param {string} username - The username.
 * @param {string} password - The password (will automatically be hashed).
 * @property {Array} data - An <tt>Array</tt> containing Objects and User data.
 * @property {string} _password - The user password (Hashed).
 * @property {Array} _token - An <tt>Array</tt> containing the Authentication tokens.
 * @property {string} uuid - The <tt>player</tt> Unique ID to distinguish it from other instance.
 * @property {string} username - The <tt>player</tt> Username.
 * @property {boolean} online - If the player is not online, this flag will prevent data to be modified.
 * @property {boolean} moderator - Modify this to true to let this player access Admin features (server-side).
 */
class player {
    /** @constructor */
    constructor(username, password){
        /** @type {Array} */
        this.data = Array();
        /**
         * @type {string}
         * @private
         */
        this._password = crypto.createHash('sha256').update(password).digest('hex');
        /**
         * @type {Array}
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
    getObjectByName(name){
        if (!this.online){
            throw "Trying to access data from a non-online player!";
        }
        var i;
        for (i = 0; i < this.data.length; i += 1) {
            if (this.data[i].name === name) {
                return i;
            }
        }
        return null; //not found
    };
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
    removeObject(token, name = null, uuid = null){
        if(!this.verifyToken(token)){
            return false;
        }
        if (!this.online){
            throw "Trying to access data from a non-online player!";
        }
        if(!name === null){
            var id = this.getObjectID(this.getObjectByName(name));
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
    verifyPassword(password){
        return crypto.createHash('sha256').update(password).digest('hex') === this._password;
    }
    modifyPassword(token=null, oldPassword=null, newPassword){
        if(this.verifyToken(token) || this.verifyPassword(oldPassword)){
            this._password = crypto.createHash('sha256').update(newPassword).digest('hex');
        }
    }
    logout(token){
        if(this.verifyToken(token)) {
            this.removeToken(token);
            this.data = Array();  //Clear all data
            this.online = false;
            return true;
        }
        return false;
    }
    getObjects(){
        return this.data;
    }
}
exports.object = object;
exports.player = player;