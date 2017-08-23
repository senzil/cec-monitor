/**
 * Created by pablo on 6/14/17.
 */

'use strict';

let CECMonitor = require('../index').CECMonitor;
let CEC = require('../index').CEC;

let monitor = new CECMonitor('CECMONITOR', {
  debug: true,
  player: true,
  hdmiport: 2,
  no_serial: {
    reconnect: true,
    wait_time: 10
  }
});

var status = CEC.PowerStatus.UNKNOWN;

monitor.on(CECMonitor.EVENTS._DATA, console.log);

monitor.once(CECMonitor.EVENTS._READY, function() {
  console.log( ' -- READY -- ' );
  monitor.WriteMessage(CEC.LogicalAddress.RECORDINGDEVICE1, CEC.LogicalAddress.BROADCAST, CEC.Opcode.ACTIVE_SOURCE, [monitor.address.physical >> 8, monitor.address.physical & 0xFF]);
});

monitor.once(CECMonitor.EVENTS._NOTICE, function() {
  console.log( ' -- NOTICE -- ' );
});

monitor.once(CECMonitor.EVENTS._WARNING, function() {
  console.log( ' -- WARNING -- ' );
});

monitor.once(CECMonitor.EVENTS._DEBUG, function() {
  console.log( ' -- DEBUG -- ' );
});

monitor.once(CECMonitor.EVENTS._TRAFFIC, function() {
  console.log( ' -- TRAFFIC -- ' );
});

monitor.on(CECMonitor.EVENTS._NOSERIALPORT, function() {
  console.log( ' -- NO SERIAL PORT -- ' );
});

monitor.on(CECMonitor.EVENTS._STOP, function() {
  console.log( ' -- STOP -- ' );
});

monitor.on(CECMonitor.EVENTS._ERROR, console.error);

monitor.on(CECMonitor.EVENTS.REPORT_POWER_STATUS, function (packet, _status) {
  var keys = Object.keys(CEC.PowerStatus);

  for (let i = keys.length - 1; i >= 0; i--) {
    if (CEC.PowerStatus[keys[i]] === _status) {
      status = _status;
      console.log('POWER_STATUS:', keys[i], status);
      break;
    }
  }
});

monitor.on(CECMonitor.EVENTS.ROUTING_CHANGE, function(packet, from, to) {
  console.log('--ROUTING CHANGE--');
  console.log(packet, from, to);
});

monitor.on(CECMonitor.EVENTS.STANDBY, function (packet) {
  if (packet.source === CEC.LogicalAddress.TV) {
    status = CEC.PowerStatus.STANDBY;
  }
})

setInterval(function () {
  if (status !== CEC.PowerStatus.ON) {
    monitor.WriteMessage(CEC.LogicalAddress.RECORDINGDEVICE1, CEC.LogicalAddress.TV, CEC.Opcode.IMAGE_VIEW_ON);
  } else {
    monitor.WriteMessage(CEC.LogicalAddress.RECORDINGDEVICE1, CEC.LogicalAddress.TV, CEC.Opcode.STANDBY);
  }
  setTimeout(() => monitor.WriteMessage(CEC.LogicalAddress.RECORDINGDEVICE1, CEC.LogicalAddress.TV, CEC.Opcode.GIVE_DEVICE_POWER_STATUS), 5000);
}, 60000)