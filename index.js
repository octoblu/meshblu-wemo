var util = require('util');
var EventEmitter = require('events').EventEmitter;
var WeMo = require('wemo');

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    on: {
      type: 'boolean',
      required: true
    }
  }
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    friendlyName: {
      type: 'string',
      required: true
    }
  }
};

function Plugin(){
  this.options = {};
  this.messageSchema = MESSAGE_SCHEMA;
  this.optionsSchema = OPTIONS_SCHEMA;
  return this;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var payload = message.payload;
  var self = this;

  WeMo.Search(this.options.friendlyName, function(err, device) {
    if (err) {
      self.emit('error', err);
      return;
    }

    var wemoSwitch = new WeMo(device.ip, device.port);
    var binaryState = 0;
    if(payload.on){
      binaryState = 1;
    }
    wemoSwitch.setBinaryState(binaryState, function(err, result) {
      if (err){
        self.emit('error', err);
        return;
      }
    });
  });
};

Plugin.prototype.setOptions = function(options){
  this.options = options;
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
