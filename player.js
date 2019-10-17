let crypto = require('crypto');
const uuidv1 = require('uuid/v1');
const uuidv4 = require('uuid/v4');
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
    addObject(token, object){
        if(!this.verifyToken(token)){
            return false;
        }
        if (!this.online){
            throw "Trying to access data from a non-online player!";
        }
        this.data.push(object)
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
            return token;
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