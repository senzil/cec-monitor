/**
 * Created by pablo on 6/14/17.
 */

var CECMonitor = require('../index').CECMonitor.default;
var CEC = require('../index').CEC.default;

var monitor = new CECMonitor('CEC-MONITOR-TESTER', true);

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

monitor.on(CECMonitor.EVENTS._ERROR, console.error);

monitor.WriteMessage(CEC.LogicalAddress.RECORDINGDEVICE1, CEC.LogicalAddress.TV, CEC.Opcode.IMAGE_VIEW_ON);