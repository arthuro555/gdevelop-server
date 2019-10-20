const fs = require("fs");
const uuidv4 = require("uuid/v4");

console.log("Loading config...");

let defaultConfig = {"SECRET" : uuidv4()};
let conf = defaultConfig;
debugger;

if (fs.existsSync('config.json')) {
    console.log('Loading Existing Config...');
    try {
        // noinspection JSCheckFunctionSignatures
        conf = JSON.parse(fs.readFileSync("config.json"));
    } catch (e) {
        if(e instanceof SyntaxError){
            console.log("Invalid JSON. Re-Creating Default config.");
            conf = defaultConfig;
            fs.writeFileSync('config.json', JSON.stringify(conf));
        } else {
            console.log("Unknown error while reading config.json: " + e);
        }
    }
} else{
    console.log('Creating New Default Config...');
    conf = defaultConfig;
    fs.writeFileSync('config.json', JSON.stringify(conf));
}


if(conf["SECRET"] === undefined){
    console.log("Invalid Config. Creating A new one.");
    conf = defaultConfig;
    fs.writeFileSync('config.json', JSON.stringify(conf));
}

exports.config = conf;