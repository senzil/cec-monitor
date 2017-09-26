/**
 * Created by pablo on 6/13/17.
 */

'use strict'

// eslint-disable-next-line no-unused-vars
import regeneratorRuntime from 'regenerator-runtime'

import {spawn} from 'child_process'
import {EventEmitter} from 'events'
import es from 'event-stream'
import CEC from './HDMI-CEC.1.4'
import ON_DEATH from 'death'
import CECTimeoutError from './TimeoutError'
import StateManager from './StateManager'
import Convert from './Convert'
import Validate from './Validate'

export default class CECMonitor extends EventEmitter {

  OSDName;
  debug;
  client;
  ready;
  address;
  no_serial;
  auto_restart;
  auto_restarting;
  reconnect_intent;
  params;
  state_manager;
  status_cache_timeout;
  auto_update_status_interval;
  active_source;

  constructor(OSDName, options) {
    super()
    this.ready = false
    this.auto_restarting = false
    this.OSDName = OSDName || 'cec-monitor'
    this.auto_restart = options.auto_restart ? options.auto_restart : true
    this.address = {
      physical: 0xFFFF,
      primary: CEC.LogicalAddress.UNKNOWN,
      base: CEC.LogicalAddress.UNKNOWN,
      hdmi: options.hdmiport || 1
    }
    this.no_serial = {
      reconnect: false,
      wait_time: 30, //in seconds
      trigger_stop: false
    }
    this.no_serial = Object.assign(this.no_serial, options.no_serial)
    this.reconnect_intent = false
    this.debug = options.debug

    // Cache of data about logical addresses
    this.state_manager = new StateManager()

    this.active_source = null // Default not known

    process.on('beforeExit', this.Stop)
    process.on('exit', this.Stop)

    if (!options.processManaged) {
      ON_DEATH({uncaughtException: true})((signal, err) => {
        if (err){
          console.error(err)
        }
        return process.exit()
      })
    }

    this.params = []
    if (options.recorder !== false){
      this.params.push('-t', 'r')
    }

    if (options.player === true){
      this.params.push('-t', 'p')
    }

    if (options.tuner === true){
      this.params.push('-t', 't')
    }

    if (options.audio === true){
      this.params.push('-t', 'a')
    }

    this.params.push('-o', this.OSDName, '-d', '31', '-p', this.address.hdmi.toString())

    _initCecClient.call(this)
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

  /**
   * Resolves promise when ready cec-client for commands
   * @return {Promise} Resolves when ready
   */
  get isReady() {
    return new Promise(_checkReady.bind(this))
  }

  /**
   * Get copy of internal state information on CEC bus
   *
   * @param {number|string} [address] Optional address to request state for.
   * (physical, logical or CEC.LogicalAddress names)
   * If omitted, return an array of all addresses indexed by logical address
   *
   * @return {object|array[object]} An object or array of objects
   * @see WriteMessage
   * with index as the logical device address and/or values an object
   * representing state of the logical address
   */
  GetState = function(address) {
    address = _parseAddress.call(this, address, undefined)

    // Return copy of our state information
    if (address === undefined) {
      return JSON.parse(JSON.stringify(this.state_manager))
    }
    return JSON.parse(JSON.stringify(this.state_manager[address]))
    //return JSON.parse(JSON.stringify(_getUpdatedCache.call(this, address)))
  }.bind(this)

  /**
   * Get physical address of this instance
   * @return {string} Physical address used by this instance
   */
  GetPhysicalAddress = function() {
    return this.address.physical
  }.bind(this)

  /**
   * Get first logical address of this device
   * @return {number} First logical address used by this instance
   */
  GetLogicalAddress = function() {
    return this.address.primary
  }.bind(this)

  /**
   * Get all logical addresses of this device
   * @return {array[number]} Primary logical address used by this instance
   */
  GetLogicalAddresses = function() {
    return [].concat(Object.keys(this.address.logical))
  }.bind(this)

  /**
   * Get the physical address from logical address
   * @param {number} logical
   * @return {string|null}
   */
  Logical2Physical = function (logical) {
    logical = _parseAddress.call(this, logical, null)

    if (logical === null) {
      return null
    }
    return this.state_manager[logical].route
  }.bind(this)

  /**
   * Get logical address from physical address
   * @param {string} physical
   * @return {number|null}
   */
  Physical2Logical = function (physical) {
    physical = _parseAddress.call(this, physical, null)
    return physical
  }.bind(this)

  /**
   * Get OSD name for given address
   * @param {string|number} address (physical, logical or CEC.LogicalAddress names)
   * @see WriteMessage
   * @return {string}
   */
  GetOSDName = function(address) {
    address = _parseAddress.call(this, address, null)

    if (address === null) {
      return ''
    }
    return this.state_manager[address].osdname
  }.bind(this)

  /**
   * Get power status for given address
   * @param {string|number} address (physical, logical or CEC.LogicalAddress names)
   * @see WriteMessage
   * @return {number|null}
   */
  GetPowerStatus = function(address) {
    address = _parseAddress.call(this, address, null)

    if (address === null) {
      return null
    }
    return this.state_manager[address].status
  }.bind(this)

  /**
   * Get power status for given address as string
   * @param {string|number} address (physical, logical or CEC.LogicalAddress names)
   * @see WriteMessage
   * @return {string|null}
   */
  GetPowerStatusName = function(address) {
    address = _parseAddress.call(this, address, null)

    if (address === null) {
      return null
    }
    return this.state_manager[address].power
  }.bind(this)

  /**
   * Retrieve physical address of currently selected source
   *
   * @return {string} Physical address of the source currently selected
   */
  GetActiveSource = function() {
    return this.active_source
  }.bind(this)

  WriteRawMessage = function(raw) {
    return this.isReady
      .then(() => this.client.stdin.write(raw + '\n'))
      .catch(e => {
        console.log('the cec adapter is not ready')
        console.log(e)
      })
  }.bind(this)

  WriteMessage = function(source, target, opcode, args) {
    let msg = `tx ${[((source << 4) + target), opcode].concat(args || []).map(h => `0${h.toString(16)}`.substr(-2)).join(':')}`
    return this.WriteRawMessage(msg)
  }.bind(this);

  /**
   * Send a 'tx' message on CEC bus
   *
   * @param {string|number|null} source Logical address for source of message (defaults to own address if null)
   * @param {string|number} target Logical address for target of message (defaults to broadcast if null)
   * @param {string|number} opcode Opcode for message expressed as a byte value or STRING label
   * @param {string|number|array[number]} [args] Optional arguments for opcode, type depending on opcode
   * @example
   * monitor.SendMessage(CEC.LogicalAddress.PLAYBACKDEVICE1, CEC.LogicalAddress.BROADCAST, CEC.Opcode.SET_OSD_NAME,[0x46,0x72,0x69,0x73,0x62,0x65,0x65]);
   * @example
   * monitor.SendMessage(4, 15, 70, [70,114,105,115,98,101,101];
   * @example
   * monitor.SendMessage('0x4', '0xF', '0x46', [0x46,0x72,0x69,0x73,0x62,0x65,0x65]);
   * @example
   * monitor.SendMessage('PLAYBACKDEVICE1','BROADCAST','SET_OSD_NAME','Frisbee');
   * @example
   * monitor.SendMessage('playbackdevice1', 'broadcast', 'set_osd_name','Frisbee');
   * @example
   * // Can specify physical address as string, using dot notation
   * monitor.SendMessage(CEC.LogicalAddress.UNREGISTERED, CEC.LogicalAddress.BROADCAST, CEC.Opcode.ACTIVE_SOURCE,'2.0.0.0');
   * // Or as an array of bytes
   * monitor.SendMessage(CEC.LogicalAddress.UNREGISTERED, CEC.LogicalAddress.BROADCAST, CEC.Opcode.ACTIVE_SOURCE,[0x20,0x0]);
   * @example
   * // Default source is the client - default destination is broadcast
   * monitor.SendMessage(null,null, 'set_osd_name','Frisbee');
   * @see cec
   * @see WriteMessage
   * @return {Promise} When promise is resolved, the message is sent, otherwise if rejected, the cec adapter is not ready
   */
  SendMessage = function(source, target, opcode, args) {
    source = _parseAddress.call(this, source, this.GetLogicalAddress())

    target = _parseAddress.call(this, target, CEC.LogicalAddress.BROADCAST)

    if (typeof opcode === 'string') {
      if (Validate.isHexaNumber(opcode)){
        opcode = Number.parseInt(opcode, 16)
      }
      else if (CEC.Opcode.hasOwnProperty(opcode.toLocaleUpperCase())) {
        opcode = CEC.Opcode[opcode.toLocaleUpperCase()]
      }
    }

    if (typeof args === 'string') {
      // If a phyiscal address
      if (Validate.isRoute(args)) {
        args = Convert.routeToArgs(args)
      }
      else if (Validate.isHexaNumber(args)){
        args = Number.parseInt(args, 16)
      }
      // Otherwise treat as string argument
      else {
        args = args.split('').map(s => s.charCodeAt(0))
      }
    }
    // todo: Create classes for complex operations (EG. SELECT_DIGITAL_SERVICE), that can be provided and generate their own arguments array
    // else if(typeof args === 'object' && args instanceof Command)
    return this.WriteMessage(source, target, opcode, args)
  };

  Stop = function() {
    if (this.client) {
      this.client.kill('SIGINT')
      _onClose.call(this)
    }
  }.bind(this);
}

/*** BEGIN INTERNAL FUNCTIONS
 *
 * THEY SHOULD NOT BE USED BY END USERS AND SHOULD NOT BE EXPORTED
 *
 * ***/
// eslint-disable-next-line no-unused-vars
const _getUpdatedCache = async function(address) {
  return await _sendCommand.call(this, address, CEC.Opcode.GIVE_DEVICE_POWER_STATUS, CEC.Opcode.REPORT_POWER_STATUS)
    .then(() => this.state_manager[address])
}

const _sendCommand = function(target, message, event) {
  const response = _eventPromise.call(this, event)

  return this.SendMessage(null, target, message)
    .then(() => new Promise.race([
      response,
      _timeoutReject.call(this, target, 5000)
    ]))
}

const _eventPromise = function(target, event) {
  return new Promise((resolve) => {
    this.once(event, packet => {
      if (packet.target === target){
        return resolve(packet)
      }
      return _eventPromise.call(this, target, event)
    })
  })
}

const _timeoutReject = function(target, milisecondsToWait) {
  return new Promise((resolve, reject) =>
    setTimeout(() => reject(new CECTimeoutError(target, milisecondsToWait)), milisecondsToWait).unref()
  )
}

/**
 * Start the cec-client process in monitor mode.
 * @returns {spawn} cec-client process
 * @private
 */
const _initCecClient = function() {
  this.client = spawn('cec-client', this.params)
  this.client.stdout
    .pipe(es.split())
    .pipe(es.map(_processStdOut.bind(this)))
  this.client.on('close', _onClose.bind(this))
  return this.client
}

/**
 * On Close time. Prepare restart cec-client and/or launch _STOP event
 * @type {function(this:CECMonitor)}
 * @private
 */
const _onClose = function() {
  this.client = null
  if (this.auto_restarting) {
    setTimeout(_initCecClient.bind(this), 15000)
  }
  else if (this.no_serial.trigger_stop || !this.reconnect_intent) {
    return this.emit(CECMonitor.EVENTS._STOP)
  } else if (this.reconnect_intent) {
    setTimeout(_initCecClient.bind(this), this.no_serial.wait_time * 1000)
  }
}

/**
 * Promise what resolve only when the adapter is ready to receive messages
 * @param {function} resolve
 * @returns {Number|Promise} Resolved promise or timer id
 * @private
 */
const _checkReady = function(resolve) {
  if (this.ready) {
    return resolve()
  }

  return setTimeout(function () {return _checkReady.call(this, resolve)}.bind(this), 1000).unref()
}

/**
 * Process the standard out of cec-client
 * @type {function(this:CECMonitor)}
 * @private
 */
const _processStdOut = function(data, cb) {
  if (/^TRAFFIC:.*/g.test(data)){
    _processTraffic.call(this, data)
  } else if (/^DEBUG:.*/g.test(data)) {
    _processDebug.call(this, data)
  } else if (/^NOTICE:.*/g.test(data)){
    _processNotice.call(this, data)
  } else if (/^waiting for input.*/g.test(data)) {
    this.auto_restarting = false
    this.reconnect_intent = false
    this.ready = true
    this.emit(CECMonitor.EVENTS._READY)
  } else if (/^WARNING:.*/g.test(data)){
    _processWarning.call(this, data)
  } else if (/^ERROR:.*/g.test(data)){
    _processError.call(this, data)
  } else if (/(^no serial port given\. trying autodetect: FAILED)|(^Connection lost)/gu.test(data)) {
    if (this.no_serial.reconnect) {
      this.reconnect_intent = true
      this.ready = false
    }
    this.emit(CECMonitor.EVENTS._NOSERIALPORT)
  }

  this.emit(CECMonitor.EVENTS._DATA, data)
  cb(null, data)
}

/**
 * Parse the packet info from stdout
 * @type {function(this:CECMonitor)}
 * @param {String} plain stdout text
 * @private
 */
const _readPacket = function(plain) {
  const regex = /^(TRAFFIC|DEBUG):\s\[\s*(\d*)\]\s(<<|>>)\s(([\d\w]{2}[:]?)+)$/gu
  let match = regex.exec(plain)
  if (match) {

    let tokens = match[4].split(':').map(h => parseInt(h, 16))

    let packet = {
      type: match[1],
      number: match[2],
      flow: match[3] === '>>' ? 'IN' : 'OUT',
      source: (tokens[0] & 0xF0) >> 4,
      target: tokens[0] & 0x0F,
      opcode: tokens[1],
      args: tokens.slice(2)
    }

    this.emit(CECMonitor.EVENTS._PACKET, packet)
    return packet
  }

  return null
}

/**
 *
 * @type {function(this:CECMonitor)}
 * @param {String} plain stdout text
 * @private
 */
const _processTraffic = function(plain){

  this.emit(CECMonitor.EVENTS._TRAFFIC, plain)

  let packet = _readPacket.call(this, plain)

  if (packet) {
    if (packet.flow === 'IN') {
      this.emit(CECMonitor.EVENTS._RECEIVED, packet)
    } else {
      this.emit(CECMonitor.EVENTS._SENDED, packet)
    }
    if (!packet.opcode){
      this.emit(CECMonitor.EVENTS.POLLING_MESSAGE, packet)
    } else {
      _processEvents.call(this, packet)
    }
  }
}

/**
 * Process all received events
 * @type {function(this:CECMonitor)}
 * @param {Object} packet
 * @private
 */
const _processEvents = function(packet) {

  let data = {}
  let physical, source, status, from, to

  // Store opcode name as event property
  packet.event = CEC.OpcodeNames[packet.opcode]

  switch (packet.opcode) {
  case CEC.Opcode.ACTIVE_SOURCE:
    if (packet.args.length !== 2) {
      return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command ACTIVE_SOURCE with bad formated address')
    }

    source = Convert.argsToPhysical(packet.args)
    physical = Convert.physicalToRoute(source)
    // Update our records
    this.active_source = physical
    data = {
      val: source,
      str: physical
    }
    break

  case CEC.Opcode.CEC_VERSION:
    if (packet.args.length !==1) {
      return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command CEC_VERSION without version')
    }
    this.state_manager[packet.source].cec = packet.args[0]
    data = {
      val: this.state_manager[packet.source].cec,
      str: this.state_manager[packet.source].cecversion
    }
    break

  case CEC.Opcode.DECK_STATUS:
    if (packet.args.length !== 2) {
      return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command DECK_STATUS without Deck Info')
    }
    status = packet.args[0] << 8 | packet.args[1]
    data = {
      val: status,
      str: CEC.DeckStatusNames[status]
    }
    break

  case CEC.Opcode.DEVICE_VENDOR_ID:
    if (packet.args.length !== 3) {
      return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command DEVICE_VENDOR_ID with bad arguments')
    }
    this.state_manager[packet.source].vendorid = Convert.argsToVendorID(packet.args)
    data = {
      val: this.state_manager[packet.source].vendorid,
      str: this.state_manager[packet.source].vendor
    }
    break

  case CEC.Opcode.REPORT_PHYSICAL_ADDRESS:
    if (packet.args.length !== 3) {
      return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command REPORT_PHYSICAL_ADDRESS with bad formated address or device type')
    }
    // Update our records
    this.state_manager[packet.source].physical = Convert.argsToPhysical(packet.args)
    data = {
      val: this.state_manager[packet.source].physical,
      str: this.state_manager[packet.source].route
    }
    break

  case CEC.Opcode.REPORT_POWER_STATUS:
    if (packet.args.length !== 1) {
      return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command REPORT_POWER_STATUS with bad formated power status')
    }
    // Update our records
    this.state_manager[packet.source].status = packet.args[0]
    data = {
      val: this.state_manager[packet.source].status,
      str: this.state_manager[packet.source].power
    }
    break

  case CEC.Opcode.ROUTING_CHANGE:
    if (packet.args.length !== 4) {
      return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command ROUTING_CHANGE with bad formated addresses')
    }
    from = Convert.argsToPhysical(packet.args.slice(0, 2))
    to = Convert.argsToPhysical(packet.args.slice(2, 4))
    physical = Convert.physicalToRoute(to)
    // Update our records
    this.active_source = physical
    data = {
      from: {
        val: from,
        str: Convert.physicalToRoute(from)
      },
      to: {
        val: to,
        str: physical
      }
    }
    break

  case CEC.Opcode.SET_OSD_NAME:
    if (!packet.args.length) {
      return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command SET_OSD_NAME without OSD NAME')
    }
    // Update our records
    this.state_manager[packet.source].osdname = Convert.argsToOSDName(packet.args)
    data = {
      val: this.state_manager[packet.source].osdname,
      str: this.state_manager[packet.source].osdname
    }
    break

  case CEC.Opcode.STANDBY:
    if (packet.args.length !== 0) {
      return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command STANDBY with bad args')
    }

    break

  case CEC.Opcode.IMAGE_VIEW_ON:
  case CEC.Opcode.TEXT_VIEW_ON:
    if (packet.args.length !== 0) {
      return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command IMAGE_VIEW_ON with bad args')
    }
    break
  }

  packet.data = data
  if (packet.event !== null) {
    // Emit all OPCODE events to '_opcode' event
    this.emit(CECMonitor.EVENTS._OPCODE, packet)

    return this.emit(packet.event, packet)
  }
}

/**
 * Process notice text from cec-client
 * @type {function(this:CECMonitor)}
 * @param {String} data:  notice stdout text
 * @private
 */
const _processNotice = function(data) {
  const regexLogical = /logical\saddress\(es\)\s=\s(Recorder\s\d\s|Playback\s\d\s|Tuner\s\d\s|Audio\s)\(?(\d)\)/gu
  let match = regexLogical.exec(data)
  if (match) {
    this.address.primary = parseInt(match[2], 10)
    this.state_manager[this.address.primary].osdname = this.OSDName
    this.address.logical = {}
    while (match){
      this.address.logical[match[2]] = true
      this.state_manager[match[2]].osdname = this.OSDName
      match = regexLogical.exec(data)
    }
  }

  const regexDevice = /base\sdevice:\s\w+\s\((\d{1,2})\),\sHDMI\sport\snumber:\s(\d{1,2}),/gu
  match = regexDevice.exec(data)
  if (match) {
    this.address.base = parseInt(match[1], 10)
    this.address.hdmi = parseInt(match[2], 10)
  }

  const regexPhysical = /physical\saddress:\s([\w.]+)/gu
  match = regexPhysical.exec(data)
  if (match) {
    this.address.physical = match[1]
    Object.keys(this.address.logical).forEach( s => {
      this.state_manager[s].route = this.address.physical
    })
  }

  return this.emit(CECMonitor.EVENTS._NOTICE, data)
}

/**
 * Process debug text from cec-client
 * @type {function(this:CECMonitor)}
 * @param {String} data:  debug stdout text
 * @private
 */
const _processDebug = function(data){
  if (/TRANSMIT_FAILED_ACK/gu.test(data)){
    return this.emit(CECMonitor.EVENTS._NOHDMICORD)
  }
  if (this.debug) {
    return this.emit(CECMonitor.EVENTS._DEBUG, data)
  }
}

/**
 * Process warning text from cec-client
 * @type {function(this:CECMonitor)}
 * @param {String} data:  warning stdout text
 * @private
 */
const _processWarning = function(data){
  if (/COMMAND_REJECTED/gu.test(data)){
    this.ready = false
    this.auto_restarting = true
    this.Stop()
  }
  return this.emit(CECMonitor.EVENTS._WARNING, data)
}

/**
 * Process error text from cec-client
 * @type {function(this:CECMonitor)}
 * @param {String} data:  error stdout text
 * @private
 */
const _processError = function(data){
  return this.emit(CECMonitor.EVENTS._ERROR, data)
}

/**
 * Parse any address format and convert to logical address
 * @param {number|string} address Address to parse/convert to logical address
 * @param {number} def Default logical address if address invalid
 */
const _parseAddress = function(address, def) {
  if (typeof address === 'string') {
    if (address.indexOf('0x') === 0){
      address = parseInt(address, 16)

    }
    else if (Validate.isRoute(address)) {
      const state = this.state_manager.GetByRoute(address);
      address = state ? state.logical : def
    }
    else if (CEC.LogicalAddress.hasOwnProperty(address.toLocaleUpperCase())) {
      address = CEC.LogicalAddress[address.toLocaleUpperCase()]
    }
  }

  if (isNaN(address) || address === null) {
    address = def
  }
  else if (address > 15 || address < 0) {
    address = def
  }
  return address
}

/*** END INTERNAL FUNCTIONS***/
