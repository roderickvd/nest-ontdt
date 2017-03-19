global.logWithDate = function(msg) {
  console.log('[' + new Date().toISOString() + '] ' + msg);
}

logWithDate('nest-ontdt started.');

const Nest = require('./src/nest.js');
const nest = new Nest();

const Wemo = require('wemo-client');
const wemo = new Wemo();

const friendlyName = require("./config.json").friendlyName;

var found = false;

function rediscover() {
  wemo.discover( (device) => {
    if (device.friendlyName == friendlyName) {
      logWithDate('Found electric floor heating switch.');
      found = true;

      nest.connect();
      
      const client = wemo.client(device);
      client.on('error', (error) => {
	    // Bail out and have something like monit or upstart take care of reconnecting.
        logWithDate('Lost connection to electric floor heating switch.');
        process.exit();
      });

      nest.on("heating", () => {
        logWithDate('Nest is heating, turning switch on.');
        client.setBinaryState(1);
      });

      nest.on("off", () => {
        logWithDate("Nest isn't heating, turning switch off.");
        client.setBinaryState(0);
      });
    }
  });
}

// Discovery until the switch is found. It may be offline at first,
// or not be picked up on UPnP on the first go.
setInterval(function() {
  if (!found) {
    logWithDate("Discovering electric floor heating switch...");
    rediscover();
  }
}, 5000);
