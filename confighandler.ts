const fs = require("fs");
const uuidv4 = require("uuid/v4");


/**
 * A class to load/handle the config.json file.
 * @class
 * @protected {Array} [defaultConfig] - The default config.
 * @public {Array} [config] - The actual config
 */
export class config {
    protected requiredConfig:string[] = [
        "SECRET",
        "Verbose",
        "debug",
        "Security Rules"
    ];
    protected customConfigVerifier = {
        "Security Rules": this.securityRulesVerifier,
        "defaultUsers": this.defaultUsersVerifier
    };
    protected defaultConfig: object = {
        "SECRET": uuidv4(),
        "Verbose": false,
        "defaultUsers": {
            "admin": {
                "username": "admin",
                "password": "1234",
                "Admin?": true
            },
            "user": {
                "username": "user",
                "password": "no u",
                "Admin?": false
            }
        },
        "Security Rules" : {
            "allowDuplicateUsername" : true,
            "allowDuplicateUUID" : false,
            "warnOnDuplicateUsername" : true,
            "warnOnDuplicateUUID" : true
        }
    };
    public conf:object = this.defaultConfig;

    /** @constructor*/
    constructor() {
        if (fs.existsSync('config.json')) {
            console.log('Loading Existing Config...');
            try {
                // noinspection JSCheckFunctionSignatures
                this.conf = JSON.parse(fs.readFileSync("config.json"));
            } catch (e) {
                if (e instanceof SyntaxError) {
                    console.log("Invalid JSON. Re-Creating Default config.");
                    this.conf = this.defaultConfig;
                    fs.writeFileSync('config.json', JSON.stringify(this.conf, null, 4));
                } else {
                    console.log("Unknown error while reading config.json: " + e);
                }
            }
        } else {
            console.log('Creating New Default Config...');
            this.conf = this.defaultConfig;
            fs.writeFileSync('config.json', JSON.stringify(this.conf, null, 4));
        }

        this.defaultSettingVerifier("Verbose");
        this.checkSettings(this.conf["Verbose"]);
    }
    defaultSettingVerifier(settingName:string, verbose:boolean = false){
        if(verbose){console.log("Checking config: "+settingName)}
        if (typeof this.conf[settingName] === "object") {
            console.error("ERROR: 'Can't check an object: create your own check.' in '"+settingName+"'.")
        }
        if (this.conf[settingName] === undefined) {
            console.warn("WARN: 'Invalid Config. Using default value.' in '"+settingName+"'.");
            this.conf[settingName] = this.defaultConfig[settingName];
        }
    }
    checkSettings(verbose:boolean = false){
        for (let s of this.requiredConfig){
            this.checkSetting(s, verbose)
        }
    }
    checkSetting(setting:string, verbose:boolean = false){
        if(setting in this.customConfigVerifier){
            this.customConfigVerifier[setting].call(this,verbose);
        } else{
            this.defaultSettingVerifier(setting, verbose);
        }
    }
    securityRulesVerifier(verbose:boolean = false){
        if (this.conf["Security Rules"] === undefined) {
            console.warn("WARN: 'Invalid Config. Using default value.' in 'Security Rules'.");
            this.conf["Security Rules"] = this.defaultConfig["Security Rules"];
            return;
        }
        if (this.conf["Security Rules"]["allowDuplicateUsername"] === undefined) {
            console.warn("WARN: 'Invalid Config. Using default value.' in 'Security Rules/allowDuplicateUsername'.");
            this.conf["Security Rules"]["allowDuplicateUsername"] = this.defaultConfig["allowDuplicateUsername"];
        }
        if (this.conf["Security Rules"]["allowDuplicateUUID"] === undefined) {
            console.warn("WARN: 'Invalid Config. Using default value.' in 'Security Rules/allowDuplicateUUID'.");
            this.conf["Security Rules"]["allowDuplicateUUID"] = this.defaultConfig["allowDuplicateUUID"];
        }
        if (this.conf["Security Rules"]["warnOnDuplicateUsername"] === undefined) {
            console.warn("WARN: 'Invalid Config. Using default value.' in 'Security Rules/warnOnDuplicateUsername'.");
            this.conf["Security Rules"]["warnOnDuplicateUsername"] = this.defaultConfig["warnOnDuplicateUsername"];
        }
        if (this.conf["Security Rules"]["warnOnDuplicateUUID"] === undefined) {
            console.warn("WARN: 'Invalid Config. Using default value.' in 'Security Rules/warnOnDuplicateUUID'.");
            this.conf["Security Rules"]["warnOnDuplicateUUID"] = this.defaultConfig["warnOnDuplicateUUID"];
        }
    }
    defaultUsersVerifier(verbose:boolean = false){
        if (this.conf["defaultUsers"] === undefined) {
            console.warn("WARN: 'Invalid Config. Using default value.' in 'Security Rules'.");
            this.conf["defaultUsers"] = this.defaultConfig["defaultUsers"];
            return;
        }
        for(let key in this.conf["defaultUsers"].keys()){
            if (this.conf["defaultUsers"][key]["username"] === undefined) {
                console.warn("WARN: 'Invalid Config. Can't load one of the users in defaultUsers.");
                delete conf["defaultUsers"][key];
            }
            if (this.conf["defaultUsers"][key]["password"] === undefined) {
                console.warn("WARN: 'Invalid Config. Can't load one of the users in defaultUsers.");
                delete conf["defaultUsers"][key];
            }
            if (this.conf["defaultUsers"][key]["Admin?"] === undefined) {
                console.warn("WARN: 'Invalid Config. Can't load one of the users in defaultUsers.");
                delete conf["defaultUsers"][key];
            }
        }
    }
}

let conf = new config();

exports.configClass = config;
exports.configInstance = conf;
exports.config = conf.conf;
