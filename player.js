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
};

class player {
    data = Array();
    constructor(username, token){
        this.username = username;
        this.token = token;
    };
    getObjectByName(name){
        var i;
        for (i = 0; i < this.data.length; i += 1) {
            if (this.data[i].name === name) {
                return i;
            }
        }
        return null; //not found
    };
    getObjectByUUID(uuid){
        var i;
        for (i = 0; i < this.data.length; i += 1) {
            if (this.data[i].uuid === uuid) {
                return this.data[i];
            }
        }
        return null; //not found
    };
    getObjectID(uuid){
        var i;
        for (i = 0; i < this.data.length; i += 1) {
            if (this.data[i].uuid === uuid) {
                return i;
            }
        }
        return null; //not found
    };
    addObject(object){
        this.data.push(object)
    };
    removeObject(name = null, uuid = null){
        if(!name === null){
            var id = this.getObjectID(this.getObjectByName(name))
            if(id === null){
               return false
            }
            this.data.splice(id, 1);
            return true;
        };
        if(!uuid === null){
            var id = this.getObjectID(uuid);
            if(id === null){
                return false
            }
            this.data.splice(id, 1);
            return true;
        };
        return false;
    };
};