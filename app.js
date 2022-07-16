// place your const, vars, functions or classes here

// clear the screen
g.clear();

class State {
  constructor(param) {
    this.busy = param.busy
    this.isConnected = param.isConnected;
    this.gatt = param.gatt;
  }
}

const initState = new State({
  busy: false,
  isConnected: false,
  gatt: undefined
});

function setState(updater) {
  state = updater.call(this, state);
  draw();
}

var state = initState;
var service, characteristic;


// redraw the screen
function draw() {
  g.reset().clearRect(Bangle.appRect);

  var title = "idle";
  if (state.isConnected) title = "GoPro";
  if (state.busy) title = "...";

  // g.setFont("6x8").setFontAlign(0,0)
  //   .drawString(title,g.getWidth()/2,g.getHeight()/2 - 20);
  g.setFont("Vector",42).setFontAlign(0,0)
    .drawString(title,g.getWidth()/2,g.getHeight()/2);
}

function onDisconnect(reason) {
  setState((state) => {
    state.isConnected = false;
    return state;
  });
}


function connect() {
  if (state.busy) {
    console.log("Device busy");
    return;
  }
  setState(state => {
    state.busy = true;
    return state;
  });
  var gatt;
  if (!state.isConnected) {
    // search for GoPro Device
    NRF.requestDevice({ filters: [{ service: ['fea6'] }] })
      .then(device => {
        console.log("Found GoPro: " + JSON.stringify(device));
        return device.gatt.connect();
      })
      .then(g => {
        gatt = g;
        setState(state => {
          state.isConnected = true;
          return state;
        });
        return service||gatt.getPrimaryService("b5f9fea6-aa8d-11e3-9046-0002a5d5c51b");
      })
      .then(s => {
        service = s;
        console.log("Service", s);
        return characteristic||s.getCharacteristic();
      })
      .then(c => {
        characteristic = c;
        // TODO: writeValue, startNotification, ...
        return c;
      })
      .then(() => {
        gatt.disconnect();
        setState(state => {
          state.isConnected = false;
          state.busy = false;
          return state;
        });
      })
      .catch(err => {
        console.log("Error: " + err);
        setState(state => {
          state.busy = false;
          return state;
        });
      });
  }
}
setInterval(connect, 3000);


function findDevices() {
  deviceCounter  = -1;
  if (!state.isConnected && !state.busy) {
    NRF.findDevices(function(devices) {
      deviceCounter = devices.length;
      console.log(devices);
    }, {timeout: 3000, filters: [{service: ['fea6']}]});
  }
}
setInterval(findDevices, 4000);




// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
