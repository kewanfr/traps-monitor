

// ------------------------ NAVBAR ------------------------
let pages = [
  {
    l: "Tableau de Bord",
    n: "Dashboard",
    v: "dashboard"
  },
  {
    l: "Paramètres",
    n: "Configuration",
    v: "config"
  },
]

let splithref = window.location.href.split("/?");
var pageUrl = pages.find((a) => a.v == splithref[1]) ? splithref[1] : "dashboard";
var UrlArguments = pages.find((a) => a.v == splithref[1]) ? splithref[2] : splithref[1] || undefined;
var actPage = pages.find((a) => a.v == pageUrl);

let navbar = document.getElementById("navbar");
function reloadNavbar() {
  navbar.innerHTML = "";
  for (let i in pages) {
    const page = pages[i];
    let navItem = `<li><a href="/?${page.v}" ${pageUrl == page.v ? 'class="active"' : ''} id="${page.v}-nav">${page.n}</a></li>`;
    navbar.insertAdjacentHTML("beforeend", navItem);

    let pageDiv = document.getElementById(`${page.v}-div`);
    if (pageUrl == page.v) { pageDiv.style.display = ""; } else { pageDiv.style.display = "none"; }

  }
}
reloadNavbar();


let pageName = document.getElementById("page-name");
let pageTitle = document.getElementById("page-title");

function setPageName() {
  pageName.innerHTML = actPage.l;
  pageTitle.innerHTML = `TRAPS - ${actPage.l}`;
}

setPageName()


// ------------------------ NAVBAR ------------------------


const db = {};
db.datas = {};
db.devices = {};
db.config = {};
db.flash = [];
const socket = io();
socket.on('update', function (msg) {
  db.datas = msg.data;
  db.devices = msg.devices;
  if (pageUrl == "dashboard") refreshDatas();
});
socket.on('devices', function (msg) {
  db.devices = msg.devices;
  if (pageUrl == "config") refreshDevices();
});
socket.on('config', function (msg) {
  db.config = msg.config;
  if (pageUrl == "config") refreshConfig();
});
var baseUrl = window.location.origin;
// var baseUrl = 'http://localhost:8000';
async function getData(url = '') {
  const response = await fetch(`${baseUrl}${url}`, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

async function postData(url = '', dat) {
  let options = {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    body: JSON.stringify(dat),
    params: JSON.stringify(dat),
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const response = await fetch(`${baseUrl}${url}`, options);
  return response.json(); // parses JSON response into native JavaScript objects
}

async function postReq(url = '', dat) {
  let options = {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    body: JSON.stringify(dat),
    // params: JSON.stringify(dat),
    headers: {
      'Content-Type': 'application/json',
    },
  };
  await fetch(`${baseUrl}${url}`, options);
  return true;
}

function updateValOne(id) {
  console.log(`Update Values Device N°${id}`);
  getData("/updateval/" + id);
}

function updateValDevices() {
  console.log("Update Values all devices");
  getData("/updateval/");
}


// ------------------------ DASHBOARD ------------------------
let box = document.querySelector("#flexbox-dashboard");

if(UrlArguments && UrlArguments.includes("hostupdated")){
  updateFlashMsg("Adresse de connexion mise à jour avec succès !");
}

async function refreshDatas() {
  box.innerHTML = "";
  if(Object.keys(db.datas).length <= 0){
    if(Object.keys(db.devices).length <= 0){
      box.innerHTML = "Aucune Donnée";
      return window.location.href = "/?config/?firstconfig";
    }else {
      updateValDevices();
    }
  }
  for (let d in db.datas) {
    const device = db.datas[d];
    var baticon, batcolor;
    if (device.battLevel < 20) {
      baticon = "empty";
      batcolor = "danger";
    } else if (device.battLevel < 50) {
      baticon = "quarter";
      batcolor = "warning";
    } else if (device.battLevel < 70) {
      baticon = "half";
      batcolor = "dark";
    } else if (device.battLevel <= 80) {
      baticon = "three-quarters";
      batcolor = "success";
    } else if (device.battLevel <= 100) {
      baticon = "full";
      batcolor = "success";
    }
    let update = new Date(device.lastUpdate);
    let updateF = `${update.getHours()}h${update.getMinutes()} ${update.getSeconds()}s `;
    let card = `
        <div class="box">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">${device.name}</h5>
              <h6 class="card-subtitle mb-2 text-${device.status == "online" ? "success" : device.disabled == true ? "muted" : "danger"}">${device.status == "online" ? "En ligne" : device.disabled == true ? "Désactivé" : device.status == "error" ? "Erreur" : "Hors Ligne"}</h6>
              
              <p class="card-text">
              ${device.status == "error" && device.errormsg ? `<div class="text-danger">${device.errormsg}</div>` : ""}
              ${device.status == "online" ? `
                Batterie: ${device.battLevel}% <i class="fa-solid fa-battery-${baticon} text-${batcolor}"></i> <br>
                Wifi: ${device.wifiLevel}dBm <i class="fad fa-wifi-2"></i></i> <br>
                Maj: ${updateF}
                ` : ""}
              </p>
              <a href="" class="card-link" onclick="updateValOne(${device.id})">Mise à jour</a>
            </div>
          </div>
        </div>
        `;
    box.insertAdjacentHTML("beforeend", card);
  }
}
// ------------------------ DASHBOARD ------------------------

