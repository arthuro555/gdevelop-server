let crypto = require('crypto');
const uuidv1 = require('uuid/v1');
var jwt = require('jsonwebtoken');
const settings = require("./confighandler.js").config;

class object {
    constructor(name, uuid, x, y){
        this.name = name;
        this.uuid = uuid;
        this.x = x;
        this.y = y;
    };
    update(name, uuid, x, y){
        this.name = name;
        this.uuid = uuid;
        this.x = x;
        this.y = y;
    };
    get(){
        return [this.name, this.uuid, this.x, this.y];
    }
}

class player {
    constructor(username, password){
        this.data = Array();
        this._password = crypto.createHash('sha256').update(password).digest('hex');
        this._token = Array();
        this.uuid = uuidv1();
        this.username = username;
        this.online = true;
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
    addObject(object){
        if (!this.online){
            throw "Trying to access data from a non-online player!";
        }
        this.data.push(object)
    };
    removeObject(name = null, uuid = null){
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
    getToken(){
        return this.token;
    };
    login(password){
        return crypto.createHash('sha256').update(password).digest('hex') === this._password;
    }
    logout(){
        this.data = Array();
        this.online = false;
    }
    getObjects(){
        return this.data;
    }
}
exports.object = object;
exports.player = player;