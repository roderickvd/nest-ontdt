"use strict";

const crypto = require("crypto");
const fs = require("fs");
const https = require("https");
const querystring = require("querystring");
const readline = require("readline-sync");

const CONFIG_FILE = __dirname + "/../config.json";
var config = require(CONFIG_FILE);

console.log("Please authorize this product at the following URL:");

// The state parameter doesn't require a random token,
// but let's be a good CSRF-combating netizen anyway.
console.log("https://home.nest.com/login/oauth2?client_id=" + config.productID
  + "&state=" + crypto.randomBytes(8).toString('base64') + "\n");

var body = querystring.stringify({
  code:          readline.question('Pincode: '),
  client_id:     config.productID,
  client_secret: config.productSecret,
  grant_type:    'authorization_code'
});

var options = {
  "method":   "POST",
  "hostname": "api.home.nest.com",
  "port":     443,
  "path":     "/oauth2/access_token",

  // Contrary to the code sample provided by Nest, Content-Type
  // and Content-Length must be provided or the request will fail.
  headers : {
     'Content-Type':   'application/x-www-form-urlencoded',
     'Content-Length': body.length
  }
};

var req = https.request(options, (res) => {
	if (res.statusCode != 200) {
	  console.error("Authorization failed! (" + res.statusCode + ")");
    process.exit();
	}
	
  var chunks = [];

  res.on("data", (chunk) => {
    chunks.push(chunk);
  });

  res.on("end", () => {
    config.access_token = JSON.parse(chunks).access_token;
    fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), (error) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Authorized.");
      }
    });
  });
});

req.write(body);
req.end();
