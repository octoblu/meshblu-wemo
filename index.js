var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var WeMo         = require('wemo');
var debug        = require('debug')('meshblu-wemo:index');
var _            = require('lodash');

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
  this.updateWemo(payload);
};

Plugin.prototype.onConfig = function(device){
  this.setOptions(device.options||{});
};

Plugin.prototype.setOptions = function(options){
  this.options = options;
  this._wemo = null;
  this.getWemo();
};

var getWemoImmediate = function(callback) {
  var self = this;
  callback = callback || _.noop;

  if (self._wemo) {
    _.defer(function(){
      callback(null, self._wemo);
    });
    return;
  }

  debug('Searching for ' + self.options.friendlyName);
  WeMo.SearchTimeout = 10000;
  WeMo.Search(self.options.friendlyName, function(err, device) {
    if (err) {
      self._wemo = null;
      debug('Error: ' + err);
      callback(err);
      return;
    }

    debug('Found ' + self.options.friendlyName + ' at ' + device.ip + ':' + device.port);
    self._wemo = new WeMo(device.ip, device.port);
    callback(null, self._wemo);
  });
};

Plugin.prototype.getWemo = _.debounce(getWemoImmediate, 1000);

Plugin.prototype.updateWemo = function(payload) {
  var self = this;

  self.getWemo(function(error, wemoSwitch) {
    if (error) {
      self.emit('error', error);
      return;
    }

    var binaryState = 0;
    if(payload.on){
      binaryState = 1;
    }
    debug('Setting ' + self.options.friendlyName + ' to ' + binaryState);
    wemoSwitch.setBinaryState(binaryState, function(err, result) {
      if (err){
        self.emit('error', err);
        return;
      }
    });
  });
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
