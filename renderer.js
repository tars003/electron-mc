let { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { ByteLengthParser } = require('@serialport/parser-byte-length');
const { ReadyParser } = require('@serialport/parser-ready');
const { DelimiterParser } = require('@serialport/parser-delimiter')
const { read } = require('original-fs');

let portsCurr = [];
let isConnected = false;
let parser;
let myPort;

let parsedStr;
let blr1Led, conf11Led, conf12Led, comp11Led, comp12Led, htr1Led;
let blr2Led, conf21Led, conf22Led, comp21Led, comp22Led, htr2Led;
let blr1Ip, conf11Ip, conf12Ip, lp11Ip, lp12Ip, hp11Ip, hp12Ip, htr1Ip, airConIp, cnp1Ip;
let blr2Ip, conf21Ip, conf22Ip, lp21Ip, lp22Ip, hp21Ip, hp22Ip, htr2Ip, v400Ip, cnp2Ip;
let rt1Val, rt2Val, st1Val, st2Val, at1Val, at2Val, rhVal;
let hp11Val, hp12Val, lp11Val, lp12Val, hp21Val, hp22Val, lp21Val, lp22Val;

let portSelect;
let portForm;
let mainBody;
let connBtn, disconnBtn;
let alertToast;
let alertToastText;
let loopTimer;

const listSerialPorts = async ()  => {
  await SerialPort.list().then((ports, err) => {
    if (err) {
      console.log('Error inside listSerialPorts', err);
      return
    }

    // POPULATE PORT SELECT OPTIONS
    populatePortSelect(ports);
    // ADD EVENT LISTNER ON SUBMIT AND CONNECT TO SELECTED PORT
    selectConnectPort();
    // LOAD ALERT TOAST HTML
    // loadToast();

    // LOAD DISCONNECT AND CONNECT BUTTON
    loadConnDisconn();
  })
}

const updateElementsLoop = async () => {
  // LOAD DISCONNECT AND CONNECT BUTTON
  loadConnDisconn();
}

const populatePortSelect = (ports) => {
  portSelect = document.getElementById("port-select");
  ports.map(port => {
    if (portsCurr.includes(port.path)) {

    }
    else {
      portsCurr.push(port.path);
      portSelect.innerHTML += `<option value=${port.path}>${port.path}</option>`;
    }
  });
}

const selectConnectPort = () => {
  portForm = document.getElementById("port-form");
  portForm.addEventListener('submit', e => {
    e.preventDefault();
    console.log('inside form submit', portSelect.value);
    if (portSelect.value == 'none') {
      alert('Please select a PORT')
    } else {
      connectPort(portSelect.value);
    }
  });
}

const loadToast = () => {
  alertToast = document.getElementsByClassName('toast');
  alertToastText = document.getElementsByClassName('toast-body');
  alertToastText.innerHTML = "Connection successful!";

  var myToast = new bootstrap.Toast(alertToast);
  myToast.show();
  // alertToast.toast('show');

}

const loadConnDisconn = () => {
  connBtn = document.getElementById('port-submit');
  disconnBtn = document.getElementById('port-disconnect');
  disconnBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isConnected = false;
    disconnectPort();
  });

  mainBody = document.getElementById('body-div');

  if (isConnected) {
    connBtn.style.display = "none";
    disconnBtn.style.display = "block";
    mainBody.style.display = "block";
  } else {
    connBtn.style.display = "block";
    disconnBtn.style.display = "none";
    mainBody.style.display = "none";
  }
}

const connectPort = (portName) => {
  console.log('Inside connectPort -> ', portName);
  myPort = new SerialPort({
    path: `\\\\.\\${portName}`,
    baudRate: 115200
  });

  parser = myPort.pipe(new ReadlineParser({ delimiter: '>' }))
  // parser = myPort.pipe(new ReadyParser({ delimiter: '<' }))  ;
  // const parser = port.pipe(new DelimiterParser({ delimiter: '>' }))
  // parser = myPort.pipe(new ByteLengthParser({ length: 300 }))

  // GET OUTPUT ELEMENTS HTML, INTO MEMORY
  getOutputElements();
  // LOAD INPUT ELEMENTS HTML INTO MEMORY
  getInputElements();
  // LOAD TEMP TABLE
  getTempElements();
  // LOAD PRESSURE TABLE
  getPressureElements();

  myPort.on('open', showPortOpen);
  parser.on('data', readSerialData);
  myPort.on('close', showPortClose);
  myPort.on('error', showError);

  isConnected = true;

  loopTimer = setTimeout(updateElementsLoop, 500);
}

const disconnectPort = () => {
  myPort.close();
  updateElementsLoop();
  clearTimeout(loopTimer);
  // resetOutputValues();
}

function showPortOpen() {
  console.log('port open. Data rate: ' + myPort.baudRate);
}

const readSerialData = (data) => {
  parsedStr = data;
  if(data.substring(0,1)  == '<') {
    // CHANGE OUTPUTS AND SOON AS NEW DATA RECEIVED
    changeOutput(data);
    changeInput(data);
    changeTemp(data);
    changePressure(data);
  }
  
  console.log(data);
}

const changeOutput = (data) => {
  // UNIT 1
  if (parsedStr.substring(164, 165) == '1') {
    blr1Led.style = "background-color: rgb(88, 206, 88); color: white;";
    blr1Led.innerHTML = "ON";
  } else {
    blr1Led.style = "background-color: rgb(228, 58, 58); color: white;";
    blr1Led.innerHTML = "OFF";
  }

  if (parsedStr.substring(168, 169) == '1') {
    conf11Led.style = "background-color: rgb(88, 206, 88); color: white;";
    conf11Led.innerHTML = "ON";
  } else {
    conf11Led.style = "background-color: rgb(228, 58, 58); color: white;";
    conf11Led.innerHTML = "OFF";
  }

  if (parsedStr.substring(170, 171) == '1') {
    conf12Led.style = "background-color: rgb(88, 206, 88); color: white;";
    conf12Led.innerHTML = "ON";
  } else {
    conf12Led.style = "background-color: rgb(228, 58, 58); color: white;";
    conf12Led.innerHTML = "OFF";
  }

  if (parsedStr.substring(176, 177) == '1') {
    comp11Led.style = "background-color: rgb(88, 206, 88); color: white;";
    comp11Led.innerHTML = "ON";
  } else {
    comp11Led.style = "background-color: rgb(228, 58, 58); color: white;";
    comp11Led.innerHTML = "OFF";
  }

  if (parsedStr.substring(178, 179) == '1') {
    comp12Led.style = "background-color: rgb(88, 206, 88); color: white;";
    comp12Led.innerHTML = "ON";
  } else {
    comp12Led.style = "background-color: rgb(228, 58, 58); color: white;";
    comp12Led.innerHTML = "OFF";
  }

  if (parsedStr.substring(160, 161) == '1') {
    htr1Led.style = "background-color: rgb(88, 206, 88); color: white;";
    htr1Led.innerHTML = "ON";
  } else {
    htr1Led.style = "background-color: rgb(228, 58, 58); color: white;";
    htr1Led.innerHTML = "OFF";
  }
  // UNIT 2
  if (parsedStr.substring(166, 167) == '1') {
    blr2Led.style = "background-color: rgb(88, 206, 88); color: white;";
    blr2Led.innerHTML = "ON";
  } else {
    blr2Led.style = "background-color: rgb(228, 58, 58); color: white;";
    blr2Led.innerHTML = "OFF";
  }

  if (parsedStr.substring(172, 173) == '1') {
    conf21Led.style = "background-color: rgb(88, 206, 88); color: white;";
    conf21Led.innerHTML = "ON";
  } else {
    conf21Led.style = "background-color: rgb(228, 58, 58); color: white;";
    conf21Led.innerHTML = "OFF";
  }

  if (parsedStr.substring(174, 175) == '1') {
    conf22Led.style = "background-color: rgb(88, 206, 88); color: white;";
    conf22Led.innerHTML = "ON";
  } else {
    conf22Led.style = "background-color: rgb(228, 58, 58); color: white;";
    conf22Led.innerHTML = "OFF";
  }

  if (parsedStr.substring(180, 181) == '1') {
    comp21Led.style = "background-color: rgb(88, 206, 88); color: white;";
    comp21Led.innerHTML = "ON";
  } else {
    comp21Led.style = "background-color: rgb(228, 58, 58); color: white;";
    comp21Led.innerHTML = "OFF";
  }

  if (parsedStr.substring(182, 183) == '1') {
    comp22Led.style = "background-color: rgb(88, 206, 88); color: white;";
    comp22Led.innerHTML = "ON";
  } else {
    comp22Led.style = "background-color: rgb(228, 58, 58); color: white;";
    comp22Led.innerHTML = "OFF";
  }

  if (parsedStr.substring(162, 163) == '1') {
    htr2Led.style = "background-color: rgb(88, 206, 88); color: white;";
    htr2Led.innerHTML = "ON";
  } else {
    htr2Led.style = "background-color: rgb(228, 58, 58); color: white;";
    htr2Led.innerHTML = "OFF";
  }
}

const getOutputElements = () => {
  blr1Led = document.getElementById('blr1-led');
  conf11Led = document.getElementById('conf11-led');
  conf12Led = document.getElementById('conf12-led');
  comp11Led = document.getElementById('comp11-led');
  comp12Led = document.getElementById('comp12-led');
  htr1Led = document.getElementById('htr1-led');

  blr2Led = document.getElementById('blr2-led');
  conf21Led = document.getElementById('conf21-led');
  conf22Led = document.getElementById('conf22-led');
  comp21Led = document.getElementById('comp21-led');
  comp22Led = document.getElementById('comp22-led');
  htr2Led = document.getElementById('htr2-led');
}

const changeInput = (data) => {
  // UNIT 1
  if (parsedStr.substring(128, 129) == '1') {
    blr1Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    blr1Ip.innerHTML = "OK";
  } else {
    blr1Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    blr1Ip.innerHTML = "NOT OK";
  }

  if (parsedStr.substring(116, 117) == '1') {
    conf11Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    conf11Ip.innerHTML = "OK";
  } else {
    conf11Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    conf11Ip.innerHTML = "NOT OK";
  }

  if (parsedStr.substring(118, 119) == '1') {
    conf12Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    conf12Ip.innerHTML = "OK";
  } else {
    conf12Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    conf12Ip.innerHTML = "NOT OK";
  }

  if (parsedStr.substring(108, 109) == '1') {
    lp11Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    lp11Ip.innerHTML = "OK";
  } else {
    lp11Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    lp11Ip.innerHTML = "NOT OK";
  }

  if (parsedStr.substring(110, 111) == '1') {
    lp12Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    lp12Ip.innerHTML = "OK";
  } else {
    lp12Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    lp12Ip.innerHTML = "NOT OK";
  }

  if (parsedStr.substring(100, 101) == '1') {
    hp11Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    hp11Ip.innerHTML = "OK";
  } else {
    hp11Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    hp11Ip.innerHTML = "NOT OK";
  }

  if (parsedStr.substring(102, 103) == '1') {
    hp12Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    hp12Ip.innerHTML = "OK";
  } else {
    hp12Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    hp12Ip.innerHTML = "NOT OK";
  }

  if (parsedStr.substring(124, 125) == '1') {
    htr1Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    htr1Ip.innerHTML = "OK";
  } else {
    htr1Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    htr1Ip.innerHTML = "NOT OK";
  }
  if (parsedStr.substring(1, 4) == 'NOR') {
    airConIp.style = "background-color: rgb(88, 206, 88); color: white;";
    airConIp.innerHTML = "ON";
  } else {
    airConIp.style = "background-color: rgb(228, 58, 58); color: white;";
    airConIp.innerHTML = "OFF";
  }
  if (parsedStr.substring(148, 149) == '1') {
    cnp1Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    cnp1Ip.innerHTML = "ON";
  } else {
    cnp1Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    cnp1Ip.innerHTML = "OFF";
  }
  // UNIT 2
  if (parsedStr.substring(130, 131) == '1') {
    blr2Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    blr2Ip.innerHTML = "OK";
  } else {
    blr2Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    blr2Ip.innerHTML = "NOT OK";
  }

  if (parsedStr.substring(120, 121) == '1') {
    conf21Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    conf21Ip.innerHTML = "OK";
  } else {
    conf21Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    conf21Ip.innerHTML = "NOT OK";
  }

  if (parsedStr.substring(122, 123) == '1') {
    conf22Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    conf22Ip.innerHTML = "OK";
  } else {
    conf22Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    conf22Ip.innerHTML = "NOT OK";
  }

  if (parsedStr.substring(112, 113) == '1') {
    lp21Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    lp21Ip.innerHTML = "OK";
  } else {
    lp21Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    lp21Ip.innerHTML = "NOT OK";
  }

  if (parsedStr.substring(114, 115) == '1') {
    lp22Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    lp22Ip.innerHTML = "OK";
  } else {
    lp22Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    lp22Ip.innerHTML = "NOT OK";
  }

  if (parsedStr.substring(104, 105) == '1') {
    hp21Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    hp21Ip.innerHTML = "OK";
  } else {
    hp21Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    hp21Ip.innerHTML = "NOT OK";
  }

  if (parsedStr.substring(106, 107) == '1') {
    hp22Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    hp22Ip.innerHTML = "OK";
  } else {
    hp22Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    hp22Ip.innerHTML = "NOT OK";
  }

  if (parsedStr.substring(126, 127) == '1') {
    htr2Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    htr2Ip.innerHTML = "OK";
  } else {
    htr2Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    htr2Ip.innerHTML = "NOT OK";
  }
  if (parsedStr.substring(132, 133) == '1') {
    v400Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    v400Ip.innerHTML = "OK";
  } else {
    v400Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    v400Ip.innerHTML = "NOT OK";
  }
  if (parsedStr.substring(150, 151) == '1') {
    cnp2Ip.style = "background-color: rgb(88, 206, 88); color: white;";
    cnp2Ip.innerHTML = "ON";
  } else {
    cnp2Ip.style = "background-color: rgb(228, 58, 58); color: white;";
    cnp2Ip.innerHTML = "OFF";
  }
}

const getInputElements = () => {
  blr1Ip = document.getElementById('blr1-ip');
  conf11Ip = document.getElementById('conf11-ip');
  conf12Ip = document.getElementById('conf12-ip');
  lp11Ip = document.getElementById('lp11-ip');
  lp12Ip = document.getElementById('lp12-ip');
  hp11Ip = document.getElementById('hp11-ip');
  hp12Ip = document.getElementById('hp12-ip');
  htr1Ip = document.getElementById('htr1-ip');
  cnp1Ip = document.getElementById('cnp1-ip');
  airConIp = document.getElementById('aircon-ip');

  blr2Ip = document.getElementById('blr2-ip');
  conf21Ip = document.getElementById('conf21-ip');
  conf22Ip = document.getElementById('conf22-ip');
  lp21Ip = document.getElementById('lp21-ip');
  lp22Ip = document.getElementById('lp22-ip');
  hp21Ip = document.getElementById('hp21-ip');
  hp22Ip = document.getElementById('hp22-ip');
  htr2Ip = document.getElementById('htr2-ip');
  cnp2Ip = document.getElementById('cnp2-ip');
  v400Ip = document.getElementById('400v-ip');
}

const changeTemp = (data) => {
  rt1Val.innerHTML = data.substring(25, 29);
  rt2Val.innerHTML = data.substring(30, 34);
  at1Val.innerHTML = data.substring(35, 39);
  at2Val.innerHTML = data.substring(40, 44);
  st1Val.innerHTML = data.substring(45, 49);
  st2Val.innerHTML = data.substring(50, 54);
  rhVal.innerHTML = data.substring(55, 59);
}

const getTempElements = () => {
  rt1Val = document.getElementById('rt1Temp');
  rt2Val = document.getElementById('rt2Temp');
  at1Val = document.getElementById('at1Temp');
  at2Val = document.getElementById('at2Temp');
  st1Val = document.getElementById('st1Temp');
  st2Val = document.getElementById('st2Temp');
  rhVal = document.getElementById('rh-value');
}

const changePressure = (data) => {
  hp11Val.innerHTML = data.substring(55, 59);
  hp12Val.innerHTML = data.substring(60, 64);
  hp21Val.innerHTML = data.substring(65, 69);
  hp22Val.innerHTML = data.substring(70, 74);

  lp11Val.innerHTML = data.substring(75, 79);
  lp12Val.innerHTML = data.substring(80, 84);
  lp21Val.innerHTML = data.substring(85, 89);
  lp22Val.innerHTML = data.substring(90, 94);
}

const getPressureElements = () => {
  hp11Val = document.getElementById('hp11-value');
  hp12Val = document.getElementById('hp12-value');
  hp21Val = document.getElementById('hp21-value');
  hp22Val = document.getElementById('hp22-value');

  lp11Val = document.getElementById('lp11-value');
  lp12Val = document.getElementById('lp12-value');
  lp21Val = document.getElementById('lp21-value');
  lp22Val = document.getElementById('lp22-value');
}


const resetOutputValues = () => {
  location.reload();
}

function showPortClose() {
  console.log('port closed.');
}

function showError(error) {
  console.log('Serial port error: ' + error);
}

// Set a timeout that will check for new serialPorts every 2 seconds.
// This timeout reschedules itself.
// setTimeout(listPorts, 2000);

listSerialPorts()
