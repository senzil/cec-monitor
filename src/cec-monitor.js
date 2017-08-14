/**
 * Created by pablo on 6/13/17.
 */

import {spawn} from 'child_process';
import {EventEmitter} from 'events';
import es from 'event-stream';
import CEC from './HDMI-CEC.1.4';
import ON_DEATH from 'death';

export default class CECMonitor extends EventEmitter {

  OSDName;
  debug;
  client;
  ready;
  address;
  no_serial;
  autorestart;
  autorestarting;
  recconnect_intent;
  params;

  constructor(OSDName, options) {
    super();
    this.ready = false;
    this.autorestarting = false;
    this.OSDName = OSDName || 'cec-monitor';
    this.autorestart = options.autorestart ? options.autorestart : true;
    this.address = {
      primary: CEC.LogicalAddress.UNKNOWN,
      physical: 0xFFFF,
      base: CEC.LogicalAddress.UNKNOWN,
      hdmi: options.hdmiport || 1
    };
    this.no_serial = {
      reconnect: false,
      wait_time: 30, //in seconds
      trigger_stop: false
    };
    this.no_serial = Object.assign(this.no_serial, options.no_serial);
    this.recconnect_intent = false;
    this.debug = options.debug;

    process.on('beforeExit', this.Stop);
    process.on('exit',this.Stop);

    if(!options.processManaged) {
      ON_DEATH({uncaughtException: true})((signal, err) => {
        if(err){
          console.error(err);
        }
        process.exit();
      });
    }

    this.params = [];
    if(options.recorder !== false){
      this.params.push('-t', 'r');
    }

    if(options.player === true){
      this.params.push('-t', 'p');
    }

    if(options.tuner === true){
      this.params.push('-t', 't');
    }

    if(options.audio === true){
      this.params.push('-t', 'a');
    }

    this.params.push('-o', this.OSDName, '-d', '31', '-p', this.address.hdmi.toString());

    this._initCecClient();
  }

  static get EVENTS() {
    return {
      _DATA: '_data',
      _DEBUG: '_debug',
      _ERROR: '_error',
      _NOTICE: '_notice',
      _PACKET: '_packet',
      _READY: '_ready',
      _RECEIVED: '_received',
      _SENDED: '_sended',
      _STOP: '_stop',
      _TRAFFIC: '_traffic',
      _OPCODE: '_opcode',
      _WARNING: '_warning',
      _NOSERIALPORT: '_no_serial_port',
      _NOHDMICORD: '_no_hdmi_cord',

      ABORT: 'ABORT',
      ACTIVE_SOURCE: 'ACTIVE_SOURCE',
      CEC_VERSION: 'CEC_VERSION',
      CLEAR_ANALOGUE_TIMER: 'CLEAR_ANALOGUE_TIMER',
      CLEAR_DIGITAL_TIMER: 'CLEAR_ANALOGUE_TIMER',
      CLEAR_EXTERNAL_TIMER: 'CLEAR_EXTERNAL_TIMER',
      DECK_CONTROL: 'DECK_CONTROL',
      DECK_STATUS: 'DECK_STATUS',
      DEVICE_VENDOR_ID: 'DEVICE_VENDOR_ID',
      FEATURE_ABORT: 'FEATURE_ABORT',
      GET_CEC_VERSION: 'GET_CEC_VERSION',
      GET_MENU_LANGUAGE: 'GET_MENU_LANGUAGE',
      GIVE_AUDIO_STATUS: 'GIVE_AUDIO_STATUS',
      GIVE_DECK_STATUS: 'GIVE_DECK_STATUS',
      GIVE_DEVICE_POWER_STATUS: 'GIVE_DEVICE_POWER_STATUS',
      GIVE_DEVICE_VENDOR_ID: 'GIVE_DEVICE_VENDOR_ID',
      GIVE_OSD_NAME: 'GIVE_OSD_NAME',
      GIVE_PHYSICAL_ADDRESS: 'GIVE_PHYSICAL_ADDRESS',
      GIVE_SYSTEM_AUDIO_MODE_STATUS: 'GIVE_SYSTEM_AUDIO_MODE_STATUS',
      GIVE_TUNER_DEVICE_STATUS: 'GIVE_TUNER_DEVICE_STATUS',
      IMAGE_VIEW_ON: 'IMAGE_VIEW_ON',
      INACTIVE_SOURCE: 'INACTIVE_SOURCE',
      MENU_REQUEST: 'MENU_REQUEST',
      MENU_STATUS: 'MENU_STATUS',
      PLAY: 'PLAY',
      POLLING_MESSAGE: 'POLLING_MESSAGE',
      RECORD_OFF: 'RECORD_OFF',
      RECORD_ON: 'RECORD_ON',
      RECORD_STATUS: 'RECORD_STATUS',
      RECORD_TV_SCREEN: 'RECORD_TV_SCREEN',
      REPORT_AUDIO_STATUS: 'REPORT_AUDIO_STATUS',
      REPORT_PHYSICAL_ADDRESS: 'REPORT_PHYSICAL_ADDRESS',
      REPORT_POWER_STATUS: 'REPORT_POWER_STATUS',
      REQUEST_ACTIVE_SOURCE: 'REQUEST_ACTIVE_SOURCE',
      ROUTING_CHANGE: 'ROUTING_CHANGE',
      ROUTING_INFORMATION: 'ROUTING_INFORMATION',
      SELECT_ANALOGUE_SERVICE: 'SELECT_ANALOGUE_SERVICE',
      SELECT_DIGITAL_SERVICE: 'SELECT_DIGITAL_SERVICE',
      SET_ANALOGUE_TIMER: 'SET_ANALOGUE_TIMER',
      SET_AUDIO_RATE: 'SET_AUDIO_RATE',
      SET_DIGITAL_TIMER: 'SET_DIGITAL_TIMER',
      SET_EXTERNAL_TIMER: 'SET_EXTERNAL_TIMER',
      SET_MENU_LANGUAGE: 'SET_MENU_LANGUAGE',
      SET_OSD_NAME: 'SET_OSD_NAME',
      SET_OSD_STRING: 'SET_OSD_STRING',
      SET_STREAM_PATH: 'SET_STREAM_PATH',
      SET_SYSTEM_AUDIO_MODE: 'SET_SYSTEM_AUDIO_MODE',
      SET_TIMER_PROGRAM_TITLE: 'SET_TIMER_PROGRAM_TITLE',
      STANDBY: 'STANDBY',
      SYSTEM_AUDIO_MODE_REQUEST: 'SYSTEM_AUDIO_MODE_REQUEST',
      SYSTEM_AUDIO_MODE_STATUS: 'SYSTEM_AUDIO_MODE_STATUS',
      TEXT_VIEW_ON: 'TEXT_VIEW_ON',
      TIMER_CLEARED_STATUS: 'TIMER_CLEARED_STATUS',
      TIMER_STATUS: 'TIMER_STATUS',
      TUNER_DEVICE_STATUS: 'TUNER_DEVICE_STATUS',
      TUNER_STEP_DECREMENT: 'TUNER_STEP_DECREMENT',
      TUNER_STEP_INCREMENT: 'TUNER_STEP_INCREMENT',
      USER_CONTROL_PRESSED: 'USER_CONTROL_PRESSED',
      USER_CONTROL_RELEASE: 'USER_CONTROL_RELEASE',
      VENDOR_COMMAND: 'VENDOR_COMMAND',
      VENDOR_COMMAND_WITH_ID: 'VENDOR_COMMAND_WITH_ID',
      VENDOR_REMOTE_BUTTON_DOWN: 'VENDOR_REMOTE_BUTTON_DOWN',
      VENDOR_REMOTE_BUTTON_UP: 'VENDOR_REMOTE_BUTTON_UP'
    }
  }

  get isReady() {
    return new Promise(this._checkReady);
  }

  WriteRawMessage = function(raw) {
    return this.isReady
      .then(() => this.client.stdin.write(raw + '\n'))
      .catch(e => {
        console.log('the cec adapter is not ready');
        console.log(e);
      });
  }.bind(this);

  WriteMessage = function(source, target, opcode, args) {
    if(typeof args === 'string') {
      // If a phyiscal address
      if(args.match(/^(?:\d+\.){3}\d+$/)) {
        args = physical2args(args) ;
      }
      // Otherwise treat as string argument
      else {
        args = args.split('').map(s => s.charCodeAt(0)) ;
      }
    }
    // todo: Create classes for complex operations (EG. SELECT_DIGITAL_SERVICE), that can be provided and generate their own arguments array
    // else if(typeof args === 'object' && args instanceof Command)
    let msg = `tx ${[((source << 4) + target), opcode].concat(args || []).map(h => `0${h.toString(16)}`.substr(-2)).join(':')}`;
    return this.WriteRawMessage(msg);
  }.bind(this);

  Stop = function() {
    if(this.client) {
      this.client.kill('SIGINT');
      this._onClose();
    }
  }.bind(this);

  _initCecClient = function(){
    this.client = spawn('cec-client', this.params);
    this.client.stdout
      .pipe(es.split())
      .pipe(es.map(this._processStdOut));
    this.client.on('close', this._onClose);
  }.bind(this);

  _restart = function() {
    this._initCecClient();
  }.bind(this);

  _onClose = function() {
    this.client = null;
    if(this.autorestarting) {
      setTimeout(this._initCecClient, 15000);
    }
    else if(this.no_serial.trigger_stop || !this.recconnect_intent) {
      return this.emit(CECMonitor.EVENTS._STOP);
    } else if(this.recconnect_intent) {
      setTimeout(this._initCecClient, this.no_serial.wait_time * 1000)
    }
  }.bind(this);

  _checkReady = function(resolve) {
    if(this.ready) {
      return resolve();
    }

    setTimeout(() => this._checkReady(resolve),1000);
  }.bind(this);

  _processStdOut = function(data, cb) {
    if(/^TRAFFIC:.*/g.test(data)){
      this._processTraffic(data);
    } else if(/^DEBUG:.*/g.test(data)) {
      this._processDebug(data);
    } else if(/^NOTICE:.*/g.test(data)){
      this._processNotice(data);
    } else if(/^waiting for input.*/g.test(data)) {
      this.autorestarting = false;
      this.recconnect_intent = false;
      this.ready = true;
      this.emit(CECMonitor.EVENTS._READY);
    } else if(/^WARNING:.*/g.test(data)){
      this._processWarning(data);
    } else if(/^ERROR:.*/g.test(data)){
      this._processError(data);
    } else if(/(^no\sserial\sport\sgiven)|(^Connection\slost)/gu.test(data)){
      if(this.no_serial.reconnect) {
        this.recconnect_intent = true;
        this.ready = false;
      }
      this.emit(CECMonitor.EVENTS._NOSERIALPORT);
    }

    this.emit(CECMonitor.EVENTS._DATA, data);
    cb(null, data);
  }.bind(this);

  _readPacket = function(plain) {
    const regex = /^(TRAFFIC|DEBUG):\s\[\s*(\d*)\]\s(<<|>>)\s(([\d\w]{2}[:]?)+)$/gu;
    let match = regex.exec(plain);
    if(match) {

      let tokens = match[4].split(':').map(h => parseInt(h, 16));

      let packet = {
        type: match[1],
        number: match[2],
        flow: match[3] === '>>' ? 'IN' : 'OUT',
        source: (tokens[0] & 0xF0) >> 4,
        target: tokens[0] & 0x0F,
        opcode: tokens[1],
        args: tokens.slice(2)
      };

      this.emit(CECMonitor.EVENTS._PACKET, packet);
      return packet;
    }

    return null;
  }.bind(this);

  _processTraffic = function(data){

    this.emit(CECMonitor.EVENTS._TRAFFIC, data);

    let packet = this._readPacket(data);

    if(packet) {
      if(packet.flow === 'IN') {
        this.emit(CECMonitor.EVENTS._RECEIVED, packet);
      } else {
        this.emit(CECMonitor.EVENTS._SENDED, packet);
      }
      if(!packet.opcode){
        this.emit(CECMonitor.EVENTS.POLLING_MESSAGE, packet);
      } else {
        this._processEvents(packet);
      }
    }
  }.bind(this);

  _processEvents = function(packet) {

    let data = {} ;
    let source, version, status, id, vendor, from, to, osdname;

    // Store opcode name as event property
    packet.event = CEC.OpcodeNames[packet.opcode] ;

    switch (packet.opcode) {
      case CEC.Opcode.ACTIVE_SOURCE:
        if (packet.args.length !== 2) {
          return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command ACTIVE_SOURCE with bad formated address');
        }
        source = packet.args[0] << 8 | packet.args[1];
        data = {
          val: source,
          str: args2physical(packet.args)
        } ;
        break ;

      case CEC.Opcode.CEC_VERSION:
        if (packet.args.length !==1) {
          return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command CEC_VERSION without version');
        }
        version = packet.args[0] ;
        data = {
          val: version,
          str: CEC.CECVersionNames[version]
        } ;
        break ;

      // todo: untested
      case CEC.Opcode.DECK_STATUS:
        if (packet.args.length !== 2) {
          return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command DECK_STATUS without Deck Info');
        }
        status = packet.args[0] << 8 | packet.args[1] ;
        data = {
          val: status,
          str: CEC.DeckStatusNames[status]
        } ;
        break ;

      case CEC.Opcode.DEVICE_VENDOR_ID:
        if (packet.args.length !== 3) {
          return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command DEVICE_VENDOR_ID with bad arguments');
        }
        id = packet.args[0] << 16 | packet.args[1] << 8 | packet.args[2];
        vendor = CEC.VendorIdNames[id] ;
        data = {
          val: id,
          str: vendor
        } ;
        break ;

      case CEC.Opcode.REPORT_PHYSICAL_ADDRESS:
        if (packet.args.length !== 3) {
          return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command REPORT_PHYSICAL_ADDRESS with bad formated address or device type');
        }
        source = packet.args[0] << 8 | packet.args[1];
        data = {
          val: source,
          str: args2physical(packet.args)
        } ;
        break ;

      case CEC.Opcode.REPORT_POWER_STATUS:
        if (packet.args.length !== 1) {
          return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command REPORT_POWER_STATUS with bad formated power status');
        }
        status = packet.args[0];
        data = {
          val: status,
          str: CEC.PowerStatusNames[status]
        } ;
        break ;

      case CEC.Opcode.ROUTING_CHANGE:
        if (packet.args.length !== 4) {
          return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command ROUTING_CHANGE with bad formated addresses')
        }
        from = packet.args[0] << 8 | packet.args[1];
        to = packet.args[2] << 8 | packet.args[3];
        data = {
          from: {
            val: from,
            str: args2physical(packet.args.slice(0,2))
          },
          to: {
            val: to,
            str: args2physical(packet.args.slice(2,4))
          }
        } ;
        break ;

      case CEC.Opcode.SET_OSD_NAME:
        if (!packet.args.length) {
          return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command SET_OSD_NAME without OSD NAME')
        }
        osdname = String.fromCharCode.apply(null, packet.args);
        data = {
          val: osdname,
          str: osdname
        } ;
        break ;

      case CEC.Opcode.STANDBY:
        if (packet.args.length !== 0) {
          return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command STANDBY with bad args');
        }
        break ;
    }

    packet.data = data ;
    if(packet.event !== null) {
      // Emit all OPCODE events to '_opcode' event
      this.emit(CECMonitor.EVENTS._OPCODE,packet) ;

      return this.emit(packet.event,packet) ;
    }
  };

  _processNotice = function(data) {
    const regexLogical = /logical\saddress\(es\)\s=\s(Recorder\s\d\s|Playback\s\d\s|Tuner\s\d\s|Audio\s)\(?(\d)\)/gu;
    let match = regexLogical.exec(data);
    if(match) {
      this.address.primary = parseInt(match[2], 10);
      while(match){
        this.address[match[2]] = true;
        match = regexLogical.exec(data);
      }
    }

    const regexDevice = /base\sdevice:\s\w+\s\((\d{1,2})\),\sHDMI\sport\snumber:\s(\d{1,2}),/gu ;
    match = regexDevice.exec(data);
    if(match) {
      this.address.base = parseInt(match[1], 10);
      this.address.hdmi = parseInt(match[2], 10);
    }

    const regexPhysical = /physical\saddress:\s([\w\.]+)/gu ;
    match = regexPhysical.exec(data);
    if(match) {
      this.address.physical = match[1].split('.').map(n => parseInt(n, 16)).reduce((a, b) => a = a << 4 | b, 0);
    }

    return this.emit(CECMonitor.EVENTS._NOTICE, data);
  }.bind(this);

  _processDebug = function(data){
    if(/TRANSMIT_FAILED_ACK/gu.test(data)){
      return this.emit(CECMonitor.EVENTS._NOHDMICORD);
    }
    if(this.debug) {
      return this.emit(CECMonitor.EVENTS._DEBUG, data);
    }
    return;
  }.bind(this);

  _processWarning = function(data){
    if(/COMMAND_REJECTED/gu.test(data)){
      this.ready = false;
      this.autorestarting = true;
      this.Stop();
    }
    return this.emit(CECMonitor.EVENTS._WARNING, data);
  }.bind(this);

  _processError = function(data){
    return this.emit(CECMonitor.EVENTS._ERROR, data);
  }.bind(this);
}

/**
 * Convert array of values from CEC into string formatted physical address
 * @param {number[]} value An array of byte values
 * @return {string} Physical address in . notation ie 0.0.0.0
 */
function args2physical(value) {
  var v = value[0] << 8 | value[1] ;

  return ['0','0','0','0'].concat(v.toString(16).toLocaleUpperCase().split('')).slice(-4).join('.') ;
}

/**
 * Convert string formatted phyiscal address of form 0.0.0.0 to two-byte array
 *
 * @param {string} address Physical address to convert
 * @return {number[]} A two-byte encoded verstion represented as an array
 */
function physical2args(address) {
  var s = address.split('.').join('') ;
  var v = parseInt(s,16) ;
  var arr = [] ;

  arr.unshift(v & 0xFF) ;
  v >>= 8 ;
  arr.unshift(v & 0xFF) ;
  return arr ;
}
