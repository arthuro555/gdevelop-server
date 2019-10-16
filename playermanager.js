class pmanager{
    constructor() {
        this.players = Array;
    }
    getPlayers(){
        return this.players;
    }
    getPlayer(playerName = null, playerUUID = null){
        var i;
        for (i = 0; i < this.players.length; i += 1) {
            if(!playerUUID === null) {
                if (this.players[i].uuid === playerUUID) {
                    return this.players[i];
                }
            }
            if(!playerName === null) {
                if (this.players[i].name === playerName) {
                    return this.players[i];
                }
            }
        }
        return null; //not found
    }
    addPlayer(player){
        this.players.push(player);
        return true;
    }
    setOnline(playerName = null, playerUUID = null){
        var p = this.getPlayer(playerName, playerUUID);
        if(p === null){
            return false;
        }
        p.online = true;
        return true;
    }
    setOffline(playerName = null, playerUUID = null){
        var p = this.getPlayer(playerName, playerUUID);
        if(p === null){
            return false;
        }
        p.logout();
        return true;
    }
}

exports.pmanager = pmanager;