/**
 * Created by pablo on 6/14/17.
 */

"use strict";

var CECMonitor = require('../index').CECMonitor;
var CEC = require('../index').CEC;

var monitor = new CECMonitor('CEC-MONITOR-TESTER', {debug: true});

var status = CEC.PowerStatus.UNKNOWN;

monitor.on(CECMonitor.EVENTS._DATA, console.log);

monitor.once(CECMonitor.EVENTS._READY, function() {
  console.log( ' -- READY -- ' );
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

setInterval(function(){
  console.log('%d, %d, %s', status, CEC.PowerStatus.STANDBY, status === CEC.PowerStatus.STANDBY);
  if(status === CEC.PowerStatus.STANDBY) {
    monitor.WriteMessage(CEC.LogicalAddress.RECORDINGDEVICE1, CEC.LogicalAddress.TV, CEC.Opcode.IMAGE_VIEW_ON);
  } else {
    monitor.WriteMessage(CEC.LogicalAddress.RECORDINGDEVICE1, CEC.LogicalAddress.TV, CEC.Opcode.STANDBY);
  }
  setTimeout(() => monitor.WriteMessage(CEC.LogicalAddress.RECORDINGDEVICE1, CEC.LogicalAddress.TV, CEC.Opcode.GIVE_DEVICE_POWER_STATUS), 1000);
}, 60000);