nest-ontdt
==========
With your Nest thermostat, On This Do That.

This is Node.js console script uses the Firebase API to subscribe to state changes of your [Nest Thermostat](https://nest.com/thermostat/). Currently, it toggles a [ [WeMo Switch](http://www.belkin.com/us/F7C027-Belkin/p/P-F7C027/) for the electric floor heating system depending on whether the Nest is heating or off, but you can make it do anything you want.

Setup
-----

1. Copy `config.sample.json` to `config.json`
2. Edit `config.json` and fill out your Nest API keys. Get your Nest Product ID and secret here: https://developers.nest.com/products.
3. Run `npm install` to authorize the script with Nest.
4. Run nest-ontdt using `node index.js start`

Running headlessly
------------------

I recommend running nest-ontdt from something like [Monit](https://mmonit.com/monit/) or [upstart](http://upstart.ubuntu.com/) to respawn it whenever necessary. I run nest-ontdt on my Synology NAS using the following `upstart` configuration file:
```
start on runlevel [2345]
stop on runlevel [06]
setuid YOUR_USER
respawn
respawn limit 10 5
exec /usr/local/bin/node /PATH/TO/nest-ontdt/index.js start
```
