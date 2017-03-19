// This client uses web sockets, which headless Node.js doesn't support out of the box.
// This trick pulls in a WebSocket implementation in JavaScript.
global.WebSocket = require('ws');

// The Nest API is Firebase-compatible, but different from Google's Firebase package.
// This is why the Firebase library is bundled separately from the npm modules.
const firebase = require('../lib/firebase.js');

const inherits = require('util').inherits;  
const EventEmitter = require('events').EventEmitter;

function firstChild(object) {
  for(var key in object) {
    return object[key];
  }
}

module.exports = Nest;
function Nest() {
  if (!(this instanceof Nest)) return new Nest();
  EventEmitter.call(this);
  
  this._prev_hvac_state = null;

  this.access_token = require("../config.json").access_token;
  if (!this.access_token) {
    logWithDate("No Nest access token found, exiting. Please authorize by running 'npm install'.");
    process.exit();
  }

  this.dataRef = new Firebase('wss://developer-api.nest.com');
  this.dataRef.on('value', (snapshot) => {
    const data = snapshot.val();

    // For simplicity, we only care about the first
    // thermostat in the first structure
    structure = firstChild(data.structures);
    thermostat = data.devices.thermostats[structure.thermostats[0]];
  
    if (thermostat.hvac_state != this._prev_hvac_state) {
      this._prev_hvac_state = thermostat.hvac_state;  // save state for next value update
      
      switch (this._prev_hvac_state) {
        case "heating":
          this.emit('heating');
          break;
        case "off":
          this.emit('off');
          break;
      }
    }
  });
}
inherits(Nest, EventEmitter); // must be placed before any prototypes

Nest.prototype.auth = function() {
  logWithDate("Nest authenticating...");
  this.dataRef.authWithCustomToken(this.access_token, (error, authData) => {
    if (error) {
	  logWithDate("Nest authentication failed, exiting. Please re-authorize by running 'npm install'.");
	  process.exit();
	} else {
	  logWithDate("Nest authentication successful.");
	}
  });
  return true;
};

Nest.prototype.connect = function() {
  // This callback will fire immediately, thus initiating authorization.
  this.dataRef.onAuth((authData) => {
    if (!authData) {
      logWithDate("Nest isn't authenticated.");
      this.auth();
    }
  });
  return true;
};

