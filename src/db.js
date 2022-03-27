var fs = require('fs');

if (!fs.existsSync("./data")){
  fs.mkdirSync("./data");
}

function verifFile(filename, defaultval = {}) {
  let path = `./data/${filename}.json`;
  if (!fs.existsSync(path)) {
    if(filename == "config"){
      defaultval = require("./config").defaultconfig;
    }
    fs.writeFileSync(path, JSON.stringify(defaultval), 'utf8');
    return true;
  }
}

async function getFile(filename) {
  await verifFile(filename);
  return JSON.parse(await fs.readFileSync(`./data/${filename}.json`, 'utf8'));
}

async function setFile(filename, content) {
  let jsonContent = JSON.stringify(content);
  const regex2 = /id":"(-?[0-9]+\.{0,1}[0-9]*)"/g;
  jsonContent = jsonContent.replace(regex2, 'id":$1');
  return fs.writeFileSync(`./data/${filename}.json`, jsonContent, 'utf8');
}

var bdd = {};


bdd.get = async (key) => {
  let keys = key.split(".");
  var rep = await getFile(keys[0]);
  keys = keys.slice(1);
  var result = rep;
  if(keys.length >= 1) {
    keys.forEach((k) => {
      result = result[k];
    })
  }
  return result;
}

bdd.set = async (key, newvalue) => {
  let keys = key.split(".");
  let path = keys[0];
  var result = await getFile(path);
  keys = keys.slice(1);
  var actionSet = `result`;
  if(keys.length >= 1) {
    keys.forEach((k) => {
      if(parseInt(k)){
        actionSet = `${actionSet}['${k}']`;
      }else {
        actionSet = `${actionSet}.${k}`;
      }
    })
  }
  actionSet += ` = ${JSON.stringify(newvalue)}`;
  eval(actionSet);
  setFile(path, result);
  return result;
}

module.exports = {bdd};