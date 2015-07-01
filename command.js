'use strict';
var config = require('./meshblu.json');
var Connector = require('./connector');

var connector = new Connector(config);
connector.run();

connector.on('error', function(error){
  console.error(error.message);
});
