object = {
    object : function(name, uuid, x, y){
        this.name = name;
        this.uuid = uuid;
        this.x = x;
        this.y = y;
    }
};

player = {
    data : Array(),
    player : function(username, token){
        this.username = username;
        this.token = token;
    },
    getObjectByName : function(name){
        var i;
        for (i = 0; i < this.data.length; i += 1) {
            if (this.data[i].name === name) {
                return i;
            }
        }
        return null; //not found
    },
    getObjectByUUID : function(uuid){
        var i;
        for (i = 0; i < this.data.length; i += 1) {
            if (this.data[i].uuid === uuid) {
                return this.data[i];
            }
        }
        return null; //not found
    },
    getObjectID : function(uuid){
        var i;
        for (i = 0; i < this.data.length; i += 1) {
            if (this.data[i].uuid === uuid) {
                return i;
            }
        }
        return null; //not found
    },
    addObject : function(object){
        this.data.push(object)
    },
    removeObject : function(name = null, uuid = null){
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
    }
}