const prompt = require("prompt-sync")({ sigint: true });
const {args, setKeys, testSsh, logInfos} = require('./src/funcs.js');


function ask(){
  var option;
  if(parseInt(args[0])){
    option = args[0];
  }else {
    console.log("1: Launch Monit Server");
    console.log("2: Test SSH connexion");
    console.log("3: Set SSH Key");
    console.log("4: Get Infos");
    option = prompt("Choose an option ");
  }
  switch (option) {
    case "1":
      require("./src/server");
      break;
    case "2":
      testSsh();
      break;
    case "3":
      setKeys();
      break;
    case "4":
      logInfos();
      break;
  
    default:
      console.log("You must choose a number between 1 and 4 !");
      ask();
      break;
  }
}
ask();