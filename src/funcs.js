const fs = require('fs');
const { exec } = require("child_process");
const prompt = require("prompt-sync")({ sigint: true });
var {bdd} = require("./db");

var cert = fs.existsSync("./cert/") ? fs.readdirSync("./cert/")[0] || false : false;

let args = process.argv.splice(2);
var cmd = args.join(" ");

//DATABASE
const db = {};
bdd.get("devices").then((dat) =>{
  db.devices = dat;
});
bdd.get("data").then((dat) =>{
  db.data = dat;
});
//DATABASE

let getIp = () => {
  var ip = cmd.match(/\b(?:(?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9]))\b/g);
  if (!ip) ip = prompt("Adresse ip ? ");
  return ip;
}

var getDatas = async() => {
  return db.data;
}

var getInfos = async (log = true) => {
  db.data = {};
  var newData = {};
  return new Promise((resolve, reject) => {
    var doneCntr = 0;
    var devicesArr = Object.values(db.devices);
    devicesArr.forEach(async (device, index) => {
      let dev = await getInfo(device, log);
      newData[dev.id] = dev;
      ++doneCntr;
      if (doneCntr === devicesArr.length) {
        bdd.set("data", newData);
        resolve(newData);
      }
    });
  });
}

var logInfos = () => {
  bdd.get("devices").then((dat) =>{
    db.devices = dat;
    getInfos(false).then((data) => {
      Object.values(data).forEach(d => {
        if(d.disabled) {
          console.log(d.name + "--> Désactivé");
        }else {
          if(d.status == "online"){
            console.log(d.name + "-->");
            console.log(`  Batterie: ${d.battLevel} %`);
            console.log(`  Wifi: ${d.wifiLevel} dB`);
          }else {
            console.log(d.name + "--> Hors Ligne");
          }
        }
      });
    })
  });
}

var getInfo = (device, log = true) => {
  const newDevice = device;
  return new Promise((resolve, reject) => {
    if(device.disabled) {
      if(log) console.log(`${device.name} is disabled`);
      resolve(newDevice);
    }else {
      exec(`ssh ${cert ? `-i ./cert/${cert}` : ""} -o ConnectTimeout=5 -p 2222 ${device.ip} "cat /sys/class/power_supply/battery/capacity && cat /proc/net/wireless"`, (error, stdout, stderr) => {
        if (error || stderr) {
          // if (error) console.log(`error: ${error.message}`);
          // if (stderr) console.error(`stderr: ${stderr}`);
          newDevice.status = "offline";
          delete newDevice.battLevel;
          delete newDevice.wifiLevel;
          newDevice.lastUpdate = new Date();
          // db.data[newDevice.id] = newDevice;
          if(log) console.log(`${newDevice.name} Connection error`);
        } else {
          let lines = stdout.toString().split(/(\r?\n)/g);
          let battLevel = parseInt(lines[0]);
          let wifiLevel = parseInt(lines[6].match(/([0-9]+[0-9]+[0-9])/g)[1]);
          newDevice.status = "online";
          newDevice.lastUpdate = new Date();
          newDevice.battLevel = battLevel;
          newDevice.wifiLevel = wifiLevel;
          // db.data[newDevice.id] = newDevice;
          if(log) console.log(`${newDevice.name} Connection successful`);
        }
        resolve(newDevice);
        // resolve(stdout ? data : stderr);
      });
    }
  });
}

var setKeys = () => {
  let authorized_keys = "";
  var keysLs = fs.readdirSync("./keys/");
  if(keysLs){
    let ip = getIp();
    keysLs.forEach(function (file) {
      let d = fs.readFileSync("./keys/" + file, 'utf8');
      authorized_keys += d + "\n";
    });
    fs.writeFileSync("./authorized_keys", authorized_keys);

    exec(`scp ${cert ? `-i ./cert/${cert}` : ""} -P 2222 ./authorized_keys root@${ip}:/data/user/0/org.galexander.sshd/files/authorized_keys"`, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`Successful certificates update: ${keysLs.join(", ")}`);
      console.log(`${stdout}`);
    });
  }
}

var testSsh = () => {
  let ip = getIp();

  exec(`ssh ${cert ? `-i ./cert/${cert}` : ""} -o ConnectTimeout=5 -p 2222 ${ip} "exit"`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`Successful connection with certificate: ${cert}`);
    console.log(`${stdout}`);
  });
}

var deviceUpdate = (newDevice) => {
  if(db.devices[newDevice.id]){
    const device = db.devices[newDevice.id];
    for (let i in newDevice) {
      let dat = newDevice[i];
      if(device[i] != dat){
        device[i] = dat;
      }
    }
    db.devices[newDevice.id] = device;
    bdd.set(`devices.${newDevice.id}`, device)
  }else {
    db.devices[newDevice.id] = newDevice;
    bdd.set(`devices.${newDevice.id}`, newDevice)
  }
}

module.exports = {
  db,
  args,
  getIp,
  getInfos,
  getInfo,
  getDatas,
  setKeys,
  testSsh,
  deviceUpdate,
  bdd,
  logInfos
}