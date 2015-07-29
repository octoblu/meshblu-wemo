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
    },
    searchTimeout: {
      type: 'number',
      required: true,
      default: 10000
    }
  }
};

function Plugin(){
  var self = this;
  self.options = {};
  self.messageSchema = MESSAGE_SCHEMA;
  self.optionsSchema = OPTIONS_SCHEMA;
  return self;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var self = this;
  var payload = message.payload || {};
  self.updateWemo(payload);
};

Plugin.prototype.onConfig = function(device){
  var self = this;
  self.setOptions(device.options||{});
};

Plugin.prototype.setOptions = function(options){
  var self = this;
  self.options = _.defaults(options, {friendlyName: '', searchTimeout: 10000});
  self.options.friendlyName = self.options.friendlyName.trim();
  self.getWemo();
};

var getWemoImmediate = function(callback) {
  var self = this;
  callback = callback || _.noop;

  if (self._wemo && self._wemoName === self.options.friendlyName) {
    _.defer(callback, null, self._wemo);
    return;
  }

  debug('Searching for ' + self.options.friendlyName);
  WeMo.SearchTimeout = self.options.searchTimeout || 10000;
  WeMo.Search(self.options.friendlyName, function(error, device) {
    if (error) {
      self._wemo = null;
      self._wemoName = null;
      console.error(error);
      self.sendError(error);
      return;
    }

    debug('Found ' + self.options.friendlyName + ' at ' + device.ip + ':' + device.port);
    self._wemo = new WeMo(device.ip, device.port);
    self._wemoName = self.options.friendlyName;
    callback(null, self._wemo);
  });
};

Plugin.prototype.getWemo = _.debounce(getWemoImmediate, 1000);

Plugin.prototype.sendError = function(error){
  var self = this;
  self.emit('message', {
    devices: ['*'],
    topic: 'error',
    payload: {
      error: error
    }
  });
}

Plugin.prototype.updateWemo = function(payload) {
  var self = this;
  payload = _.defaults(payload, {on: true});
  self.getWemo(function(error, wemoSwitch) {
    if (error) {
      console.error(error);
      self.sendError(error);
      return;
    }

    var binaryState = 0;
    if(payload.on){
      binaryState = 1;
    }
    debug('Setting ' + self.options.friendlyName + ' to ' + binaryState);
    wemoSwitch.setBinaryState(binaryState, function(error, result) {
      if (error){
        console.error(error);
        self.sendError(error);
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
