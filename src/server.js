const express = require('express');
const app = express();
var cors = require('cors');
const fs = require('fs');
const server = require('http').Server(app);
const io = require('socket.io')(server);

require('./funcs');
var {getInfos, getInfo, deviceUpdate, bdd, db} = require('./funcs');


var rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

async function updateValues() {
  bdd.get("devices").then((dat) =>{
    db.devices = dat;
  });
  db.data = await getInfos();
  bdd.get("data").then((dat) =>{
    db.data = dat;
    io.emit('update', db);
  });
}

setTimeout(() => {
  updateValues();
}, 500);
setInterval(() => {
  updateValues();
}, 300000);

rl.on('line', function (line) {
  if (line == "data") {
    console.log(db.data);
  } else if (line == "devices") {
    console.log(db.devices);
  } else if (line == "update") {
    updateValues();
  } else if (line == "exit") {
    process.exit();
  }
});


var host = 'localhost';
var port = 8000;

app.use(express.json())
app.use(cors())
app.use(express.static('web'));
app.use(express.urlencoded({ extended: true }));




app.get('/data', (req,res) => {
  res.status(200).json(db.data);
})

app.post('/updatedevice', (req,res) => {
  let reqData = req.body;
  console.log(`Update device ${reqData.name}`);
  deviceUpdate(reqData);
  res.status(200).json({status: "OK"});
})

app.post('/updateconfig', (req,res) => {
  let reqData = req.body;
  db.config.host = reqData.host;
  db.config.port = reqData.port;
  bdd.set("config", db.config);
  res.status(200).json({status: "OK"});
})

app.get('/disabledevice/:id/:state', (req,res) => {
  const id = parseInt(req.params.id);
  const state = req.params.state;
  const device = db.devices[id];
  console.log(`${state == "true" ? "Disable" : "Enable"} device ${device.name}`);
  db.devices[id].disabled = state == "true" ? true : false;
  bdd.set("devices", db.devices);
  res.status(200).json({status: "OK"});
})

app.get('/deletedevice/:id', (req,res) => {
  const id = parseInt(req.params.id);
  const device = db.devices[id];
  console.log(`Deleting device ${device.name}`);
  delete db.devices[id];
  bdd.set("devices", db.devices);
  res.status(200).json({status: "OK"});
})

app.get('/updateval', (req,res) => {
  updateValues();
  console.log(`Updating values`);
  res.status(200).json({status: "OK"});
})

app.get('/updateval/:id', async (req,res) => {
  const id = parseInt(req.params.id);
  const device = db.devices[id];
  if(device){
    console.log(`Updating ${device.name}`);
    let dev = await getInfo(device);
    db.data[dev.id] = dev;
    io.emit('update', db);
    res.status(200).json(db.data)
  }
})

// établissement de la connexion
io.on('connection', (socket) => {
  console.log(`Connecté au client ${socket.id}`);
  bdd.get("devices").then((dat) =>{
    db.devices = dat;
    io.emit('devices', db);
  });
  bdd.get("data").then((dat) =>{
    db.data = dat;
    io.emit('update', db);
  });
  bdd.get("config").then((dat) =>{
    db.config = dat;
    io.emit('config', db);
  });
})

// on change app par server
bdd.get("config").then((dat) =>{
  port = dat.port;
  host = dat.host;
  server.listen(port, () => {
    console.log(`Votre app est disponible sur http://${host}:${port}`)
  })
});