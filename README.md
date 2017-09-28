# cec-monitor
HDMI-CEC library with a simple monitor written on ES6 to make cec enabled apps.

## Install

```bash
npm install --save @senzil/cec-monitor
```

## Examples

### Events

```javascript
import {CEC, CECMonitor} from 'cec-monitor';

//All config options are optionals
//the values are the deafults
let monitor = new CECMonitor('custom-osdname', {
  debug: false,           // enable/disabled debug events from cec-client
  hdmiport: 1,            // set inital hdmi port
  processManaged: false,  // set/unset handlers to avoid unclear process exit.
  recorder: true,         //enable cec-client as recorder device
  player: false,          //enable cec-client as player device
  tuner: false,           //enable cec-client as tuner device
  audio: false,           //enable cec-client as audio system device
  autorestart: true,      //enable autrestart cec-client to avoid some wierd conditions
  no_serial: {            //controls if the monitor restart cec-client when that stop after the usb was unplugged
    reconnect: false,       //enable reconnection attempts when usb is unplugged
    wait_time: 30,          //in seconds - time to do the attempt
    trigger_stop: false     //false to avoid trigger stop event
  },
  state_cache: 30,          //An value greater than 0 (in seconds) enable cache invalidation timeout and request new values
  command_timeout: 3       //An value greater than 0 (in secconds) meaning the timeout time for SendCommand function
});


monitor.once(CECMonitor.EVENTS._READY, function() {
  console.log( ' -- READY -- ' );
  // Low-level
  monitor.WriteMessage(CEC.LogicalAddress.BROADCAST, CEC.LogicalAddress.TV, CEC.Opcode.GIVE_DEVICE_POWER_STATUS);
  // High-level
  monitor.SendMessage(null,null,CEC.Opcode.SET_OSD_NAME,'Plex'); // Broadcast my OSD Name
  monitor.SendMessage(null, CEC.LogicalAddress.TV, CEC.Opcode.GIVE_OSD_NAME); // Ask TV for OSD Name
});

monitor.on(CECMonitor.EVENTS.REPORT_POWER_STATUS, function (packet) {
  console.log('POWER STATUS CODE:',packet.data.val);
  console.log('POWER STATUS:',packet.data.str);
});

monitor.on(CECMonitor.EVENTS.ROUTING_CHANGE, function(packet) {
  console.log( 'Routing changed from ' + packet.data.from.str + ' to ' + packet.data.to.str + '.' );
});

monitor.on(CECMonitor.EVENTS.SET_OSD_NAME, function(packet) {
  console.log( 'Logical address ' + packet.source + 'has OSD name ' + packet.data.str);
});

// Any packet with an opcode (excludes debug, notify and other message types from cec-client
monitor.on(CECMonitor.EVENTS._OPCODE, function(packet) {
  console.log(packet);
});
```

Opcode-based events emitted provide a single parameter `packet` to the callback. The value is an object of the form:

```json
{
  "type": "TRAFFIC", "number": "82784", "flow": "IN", 
  "source": 1, "target": 4, "opcode": 144, "args": [0],
  "event": "REPORT_POWER_STATUS", 
  "data": {"val": 0, "str": "ON"}
}
```

Packets containing the following opcodes that are received are parsed, with the results added to a
`data` property.

* CEC.Opcode.ACTIVE_SOURCE
* CEC.Opcode.CEC_VERSION
* CEC.Opcode.DECK_STATUS
* CEC.Opcode.DEVICE_VENDOR_ID
* CEC.Opcode.REPORT_PHYSICAL_ADDRESS
* CEC.Opcode.REPORT_POWER_STATUS
* CEC.Opcode.ROUTING_CHANGE
* CEC.Opcode.SET_OSD_NAME

The `data` property contains the raw value, and a string representation of the parsed results stored
in the `arg` property, based on the `event` type / `opcode` value.  Where multiple values are parsed
from `args`, a substructure is created in the `data` property, as shown below for `ROUTING_CHANGE`.

```json
{
  "type": "TRAFFIC", "number": "23553258", "flow": "IN",
  "source": 0, "target": 1 5, "opcode": 128, "args": [0, 0, 16, 0],
  "event": "ROUTING_CHANGE",
  "data": {
    "from": {"val": 0, "str": "0.0.0.0"},
    "to": {"val": 4096, "str": "1.0.0.0"}
  }
}
```

### Sending CEC Messages

There are three APIs to choose from to send a message on the bus.  This section discusses each of these
methods, with examples.  

The message used in the examples broadcasts a SET_OSD_NAME message on the bus, setting playbackdevice1 
(logical address 04) on screen name to 'Frisbee'.

#### WriteRawMessage

`WriteRawMessage(raw)`

`WriteRawMessage` writes the low-level commands to `cec-client`.  Use this method as you type commands
directly to `cec-client` itself at the command line.  

```javascript
monitor.WriteRawMessage('tx 0F:46:46:72:69:73:62:65:65');
```

#### WriteMessage

`WriteMessage(source, target, opcode, args)`

`WriteMessage` is used to write `tx` messages to `cec-client`.  These are messages containing a low-level
protocol `opcode`.  Unlike `WriteRawMessage` which takes a string, and is sent unchanged, `WriteMessage` 
has a parameter list, and constructs a raw command from these parameters to send to `cec-client`.  

```javascript
monitor.SendMessage(CEC.LogicalAddress.PLAYBACKDEVICE1, CEC.LogicalAddress.BROADCAST, CEC.Opcode.SET_OSD_NAME,[0x46,0x72,0x69,0x73,0x62,0x65,0x65]);
```

#### SendMessage

`WriteMessage(source, target, opcode, args)`

`SendMessage` is a high-level API of the same form as WriteMessage, but accepts a range of different data
types and formats as input.  This is useful when sending messages from user input.  The following examples
illustrate how to use SendMessage

```javascript
monitor.SendMessage(CEC.LogicalAddress.PLAYBACKDEVICE1, CEC.LogicalAddress.BROADCAST, CEC.Opcode.SET_OSD_NAME,[0x46,0x72,0x69,0x73,0x62,0x65,0x65]);

monitor.SendMessage(4, 15, 70, [70,114,105,115,98,101,101];

monitor.SendMessage('0x4', '0xF', '0x46', [0x46,0x72,0x69,0x73,0x62,0x65,0x65]);

monitor.SendMessage('PLAYBACKDEVICE1','BROADCAST','SET_OSD_NAME','Frisbee');

monitor.SendMessage('playbackdevice1', 'broadcast', 'set_osd_name','Frisbee');

// Can specify physical address as string, using dot notation
monitor.SendMessage(CEC.LogicalAddress.UNREGISTERED, CEC.LogicalAddress.BROADCAST, CEC.Opcode.ACTIVE_SOURCE,'2.0.0.0');

// Or as an array of bytes
monitor.SendMessage(CEC.LogicalAddress.UNREGISTERED, CEC.LogicalAddress.BROADCAST, CEC.Opcode.ACTIVE_SOURCE,[0x20,0x0]);

// Default source is the client - default destination is broadcast
monitor.SendMessage(null,null, 'set_osd_name','Frisbee');
```

### cli.js

You can experiment with how cec-monitor works and the codes generated with your HDMI connected equipment by 
experimenting with the `bin/cli.js` script. This script implements a simple readline command interface where you can 
execute instructions and see how cec-monitor responds, allowing you to adapt to your requirements. Press `TAB` for
autocompletion of commands to see what it does and how to use it.

## Roadmap

* ~~Improve constructor to improve cec-client configuration~~
* Implement more events with more context info
* Implement some user control actions as special events (combining USER_CONTROL_PRESSED and USERCONTROL RELEASE events)
* **Implement a ceclib adapter to avoid use a cec-client wrapper**

## Credits
**_nanos gigantum humeris insidentes_**

This work was based over the work of

* http://www.cec-o-matic.com/
* https://github.com/patlux/node-cec

#Contributors
*[Damien Clark](https://github.com/damoclark) (https://damos.world)

# License

The MIT License (MIT)

Copyright 2017 SENZIL SRL

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.