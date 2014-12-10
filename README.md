Meshblu Wemo Plugin
===================

A plugin for connecting your [Belkin Wemo](http://www.belkin.com/us/Products/home-automation/c/wemo-home-automation/) to [Meshblu](https://developer.octoblu.com).

It's intended to be used with [Gateblu](https://meshblu.octoblu.com), but works great
as a standalone application as well.

The options schema and the message schema
is auto published to the meshblu device when
the plugin starts.

Installation
------------

It's recommend to be used with Gateblu, but if you want
to run it by itself, you'll need to register a device with
Meshblu and create a `meshblu.json` in the root of the
meshblu-wemo directory that looks like the following:

``` json
{
  "uuid":   "<your meshblu-wemo uuid>",
  "token":  "<your meshblu-wemo token>",
  "server": "meshblu.octoblu.com",
  "port":   "3000"
}
```

Then run:

``` bash
npm install
npm start
```

Options Schema
--------------

``` json
{
  "type": "object",
  "properties": {
    "friendlyName": {
      "type": "string",
      "required": true
    }
  }
}
```

Message Schema
--------------

``` javascript
{
  "type": "object",
  "properties": {
    "on": {
      "type": "boolean",
      "required": true
    }
  }
}
```

Which means a message will look like:

``` json
{
  "devices": ["<uuid of meshblu-wemo>"],
  "payload": {
    "on": true
  }
}
```
