# cec-monitor
HDMI-CEC library with a simple monitor written on ES6 to make cec enabled apps.

## Install

```bash
npm install --save @senzil/cec-monitor
```

## Example

#### Source

```javascript
import {CEC, CECMonitor} from 'cec-monitor';

//All config options are optionals
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
    trigger_stop: false     //avoid trigger stop event
  }
});


monitor.once(CECMonitor.EVENTS._READY, function() {
  console.log( ' -- READY -- ' );
  monitor.WriteMessage(CEC.LogicalAddress.BROADCAST, CEC.LogicalAddress.TV, CEC.Opcode.GIVE_DEVICE_POWER_STATUS);
});

monitor.on(CECMonitor.EVENTS.REPORT_POWER_STATUS, function (packet, status) {
  let keys = Object.keys( CEC.PowerStatus );

  for (let i = keys.length - 1; i >= 0; i--) {
    if (CEC.PowerStatus[keys[i]] === status) {
      console.log('POWER_STATUS:', keys[i]);
      break;
    }
  }

});

monitor.on(CECMonitor.EVENTS.ROUTING_CHANGE, function(packet, fromSource, toSource) {
  console.log( 'Routing changed from ' + fromSource + ' to ' + toSource + '.' );
});
```

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

# License

The MIT License (MIT)

Copyright 2017 SENZIL SRL

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.