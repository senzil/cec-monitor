#!/usr/bin/env node

/**
 * cli.js
 *
 * cec-monitor
 *
 * 12/8/17
 *
 * Created by Damien Clark (damo.clarky@gmail.com)
 */

var c = require('../index');

var CEC = c.CEC;
var CECMonitor = c.CECMonitor;
var readline = require('readline');

///////////////////////////////////////////////////////////////////////////////
// cli commands - see man cec-client
///////////////////////////////////////////////////////////////////////////////
var commands = [
  // cli.js commands
  "active", // Output state on current active source
  "quit", // Quit cli.js
  "physical", // Give physical address of given logical address
  "logical", // Give primary logical address of given physical address
  "address", // Give state of cli.js logical and physical address
  "addresses", // Output current state information for all logical addresses
  "osdname", // Output state of name for logical or physical address
  "power", // Output state of power for logical or physical address
  // cec-client commands
  "ad",
  "as",
  "at",
  "bl",
  "is",
  "la",
  "lad",
  "lang",
  "log",
  "mon",
  "mute",
  "name",
  "on",
  "osd",
  "p",
  "pa",
  "ping",
  "poll",
  "pow",
  "scan",
  "self",
  "sp",
  "spl",
  "standby",
  "tx",
  "txn",
  "ven",
  "ver",
  "voldown",
  "volup"
];
///////////////////////////////////////////////////////////////////////////////
// cli.js local functions
///////////////////////////////////////////////////////////////////////////////
var functions = {
  addresses: function () {
    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14].forEach(function (t) {
      var output = [
        lpad(t,2,'0'),
        rpad(monitor.GetOSDName(t),14),
        rpad(monitor.Logical2Physical(t),7),
        rpad('power: '+monitor.GetPowerStatusName(t),35)
      ];
      console.log('['+output.join(']  [')+']');
    });
  },
  address: function () {
    console.log('My address:');
    console.log(lpad('logical addresses: ',19)+monitor.GetLogicalAddresses().join(', '));
    console.log(lpad('primary logical: ',19)+monitor.GetLogicalAddress());
    console.log(lpad('physical: ',19)+monitor.GetPhysicalAddress());
  },
  active: function () {
    console.log('active source: '+monitor.GetActiveSource());
  },
  logical: function (physical) {
    console.log('primary logical address: '+monitor.Physical2Logical(physical));
  },
  physical: function (logical) {
    console.log('physical address: '+monitor.Logical2Physical(logical));
  },
  power: function (address) {
    console.log('power status: '+monitor.GetPowerStatusName(address)+' ('+monitor.GetPowerStatus(address)+')');
  },
  osdname: function (address) {
    console.log('OSD name: '+monitor.GetOSDName(address));
  },
  quit: function () {
    monitor.Stop();
    process.exit(0);
  }
};

///////////////////////////////////////////////////////////////////////////////
// instantiate cec-monitor
///////////////////////////////////////////////////////////////////////////////

//All config options are optionals
var monitor = new CECMonitor('cec-mon-cli', {
  debug: false,           // enable/disabled debug events from cec-client
  hdmiport: 1,            // set inital hdmi port
  processManaged: false,  // set/unset handlers to avoid unclear process exit.
  recorder: false,         //enable cec-client as recorder device
  player: true,          //enable cec-client as player device
  tuner: false,           //enable cec-client as tuner device
  audio: false,           //enable cec-client as audio system device
  autorestart: true,      //enable autrestart cec-client to avoid some wierd conditions
  no_serial: {            //controls if the monitor restart cec-client when that stop after the usb was unplugged
    reconnect: true,       //enable reconnection attempts when usb is unplugged
    wait_time: 30,          //in seconds - time to do the attempt
    trigger_stop: false     //avoid trigger stop event
  }
});


monitor.once(CECMonitor.EVENTS._READY, function() {
  functions.address();
  console.log( ' -- READY -- ' );
  // cec-client commands
  // monitor.WriteRawMessage('on 0');
  // monitor.WriteRawMessage('scan');
  // monitor.WriteRawMessage('standby 0');

  // cec-client tx commands
  // monitor.SendMessage('0x4', '0xF', CEC.Opcode.SET_OSD_NAME,'Frisbee');
  // monitor.SendMessage('playbackdevice1', 'broadcast', 'set_osd_name','Frisbee');
  // monitor.SendMessage('PLAYBACKDEVICE1', 'BROADCAST', 'SET_OSD_NAME','Frisbee');
  // monitor.SendMessage(null,null, 'set_osd_name','Frisbee');
  // monitor.SendMessage(monitor.GetLogicalAddress(), CEC.LogicalAddress.BROADCAST, CEC.Opcode.SET_OSD_NAME,'Frisbee');
  // monitor.SendMessage(CEC.LogicalAddress.PLAYBACKDEVICE1, CEC.LogicalAddress.BROADCAST, CEC.Opcode.SET_OSD_NAME,[70,114,105,115,98,101,101]);
  // monitor.SendMessage(CEC.LogicalAddress.PLAYBACKDEVICE1, CEC.LogicalAddress.BROADCAST, CEC.Opcode.SET_OSD_NAME,[0x46,0x72,0x69,0x73,0x62,0x65,0x65]);

  // monitor.SendMessage(CEC.LogicalAddress.UNREGISTERED, CEC.LogicalAddress.BROADCAST, CEC.Opcode.ACTIVE_SOURCE,'2.0.0.0');
  // monitor.SendMessage(CEC.LogicalAddress.UNREGISTERED, CEC.LogicalAddress.BROADCAST, CEC.Opcode.ACTIVE_SOURCE,[0x20,0x0);

  rl.prompt();
});

function displayPayload(packet) {
  console.log(JSON.stringify(packet));
  rl.prompt();
}

// Any Traffic containing an opcode
monitor.on(CECMonitor.EVENTS._OPCODE,displayPayload);

// If the cec-client pipe is closed
monitor.on(CECMonitor.EVENTS._STOP,function () {
  console.log('cec-client exit')
  rl.prompt();
});

// Debug messages from cec-client
monitor.on(CECMonitor.EVENTS._DEBUG, function(data) {
  // set 'debug: true' on new CECMonitor
  console.log( '[DEBUG] '+JSON.stringify(data));
  rl.prompt();
});


// monitor.on(CECMonitor.EVENTS.ACTIVE_SOURCE,displayPayload);
//
// monitor.on(CECMonitor.EVENTS.CEC_VERSION,displayPayload);
//
// monitor.on(CECMonitor.EVENTS.DECK_STATUS,displayPayload);
//
// monitor.on(CECMonitor.EVENTS.DEVICE_VENDOR_ID,displayPayload);
//
// monitor.on(CECMonitor.EVENTS.REPORT_PHYSICAL_ADDRESS,displayPayload);
//
// monitor.on(CECMonitor.EVENTS.REPORT_POWER_STATUS,displayPayload);
//
// monitor.on(CECMonitor.EVENTS.ROUTING_CHANGE,displayPayload);
//
// monitor.on(CECMonitor.EVENTS.STANDBY,displayPayload);
//
// monitor.on(CECMonitor.EVENTS.SET_OSD_NAME,displayPayload);
//
// monitor.on(CECMonitor.EVENTS.ROUTING_INFORMATION,displayPayload);
//
// monitor.on(CECMonitor.EVENTS.IMAGE_VIEW_ON,displayPayload);


// Capture lowercase labels for opcodes
const opcode = toLowerObject(CEC.Opcode);
// Capture lowercase labels for addresses
const logicaladdress = toLowerObject(CEC.LogicalAddress);

// Use readline to provide cli interface, with tab autocompletion
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'CEC-MON> ',
  completer: function(line) {
    var tokens = line.split(/\s+/); // /(?<!\\)\s+/
    const level = tokens.length;
    if(level === 1) { // complete top-level commands
      // test for matching commands
      var hits = commands.filter(function(c) { return c.startsWith(tokens[0].toLocaleLowerCase());});
      // Advance a space so user can continue with next option
      if(hits.length === 1) hits[0] += ' ';
      return [hits.length ? hits : commands, tokens[level-1]];
    }
    if((level === 2 || level === 3) && tokens[0] === 'tx') { // complete logical addresses for tx command
      // test for matching logical address names
      var hits = Object.keys(logicaladdress).filter(function(c) {
        return c.startsWith(tokens[level-1].toLocaleLowerCase());
      });
      if(hits.length === 1) hits[0] += ' ';
      return [hits.length ? hits.sort() : Object.keys(logicaladdress).sort(), tokens[level-1]];
    }
    if(level === 4 && tokens[0] === 'tx') { // complete opcode for tx command
      // test for matching opcodes
      var hits = Object.keys(opcode).filter(function (c) { return c.startsWith(tokens[level-1].toLocaleLowerCase()); });
      // Advance a space so user can continue with next option
      if(hits.length === 1) hits[0] += ' ';
      return [hits.length ? hits.sort() : Object.keys(opcode).sort(), tokens[level-1]];
    }
    return [[],''];
  }
});

rl.prompt();

// Process entered command
rl.on('line', function(line) {
  line = line.trim();
  if(line === '') {
    rl.prompt();
    return;
  }

  // Split commands by whitespace
  var tokens = line.split(/\s+/);
  if(tokens.length > 2 && tokens[0] === 'tx') { // If tx, then resolve text labels for addresses and opcodes to bytes
    tokens.shift(); //Throw away tx

    if(logicaladdress.hasOwnProperty(tokens[0])) { // src
      tokens[0] = logicaladdress[tokens[0]];
    }
    // else {
    //   tokens[0] = parseInt(tokens[0],16);
    // }

    if(logicaladdress.hasOwnProperty(tokens[1])) { // dest
      tokens[1] = logicaladdress[tokens[1]];
    }
    // else {
    //   tokens[1] = parseInt(tokens[1],16);
    // }

    if(opcode.hasOwnProperty(tokens[2])) { // opcode - minimum required params for tx - we are going to send
      tokens[2] = CEC.Opcode[tokens[2].toLocaleUpperCase()];
    }
    // else {
    //   tokens[2] = parseInt(tokens[2],16);
    // }

    var args = tokens.slice(3); // Capture remaining tokens as args for opcode
    // If only one arg and not numeric, then assume its not a literal code byte and don't store as array
    // let cec-monitor process
    if(args.length === 1 && !args[0].toString(10).match(/^\d+$/)) {
      args = args[0];
    }
    tokens = tokens.slice(0,3); // Strip args from tokens array
    tokens.push(args); // Append args as a single value or an array reference
    console.log('Calling: monitor.SendMessage('+JSON.stringify(tokens)+')');
    monitor.SendMessage.apply(monitor,tokens);
    rl.prompt();
    return;
  }
  if (functions.hasOwnProperty(tokens[0])) { // not cec-client commands
    functions[tokens[0]].apply(null,tokens.slice(1));
    rl.prompt();
    return;
  }
  console.log('Sending to cec-client: "'+line+'"');
  monitor.WriteRawMessage(line);
  rl.prompt();
}).on('close', function() {
  console.log('cli.js terminating');
});

function toLowerObject(obj) {
  var data = {};
  Object.keys(obj).forEach(function (k) {
    data[k.toLocaleLowerCase()] = obj[k];
  });
  return data;
}

function rpad(str, size, pad) {
  var s = padding(size, str, pad);
  return str+s;
}

function padding(size, str, pad) {
  if(pad === undefined)
    pad = ' ';
  if(str === null)
    str = 'null';
  else if(str === undefined)
    str = 'undefined';
  var s = new Array(size - str.toString().length).fill(pad).join('');
  return s;
}

function lpad(str, size, pad) {
  var s = padding(size, str, pad);
  return s+str;
}




