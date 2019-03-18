/**
 * Created by pablo on 3/15/19.
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


let interval = setInterval(() => {
  monitor.SendCommand(CEC.LogicalAddress.RECORDINGDEVICE1, CEC.LogicalAddress.TV, CEC.Opcode.GIVE_DEVICE_POWER_STATUS, CECMonitor.EVENTS.REPORT_POWER_STATUS)
    .then(packet => {
      console.log('TVstatus: %j', packet.data)
    })
    .catch((err) => {
      console.warn(err)
    })
}, 15000).unref()