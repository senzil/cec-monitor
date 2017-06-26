'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _child_process = require('child_process');

var _events = require('events');

var _eventStream = require('event-stream');

var _eventStream2 = _interopRequireDefault(_eventStream);

var _HDMICEC = require('./HDMI-CEC.1.4');

var _HDMICEC2 = _interopRequireDefault(_HDMICEC);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by pablo on 6/13/17.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var CECMonitor = function (_EventEmitter) {
  _inherits(CECMonitor, _EventEmitter);

  function CECMonitor(OSDName, debug, HDMIport) {
    _classCallCheck(this, CECMonitor);

    var _this = _possibleConstructorReturn(this, (CECMonitor.__proto__ || Object.getPrototypeOf(CECMonitor)).call(this));

    _this._onClose = function _onClose() {
      return this.emit(CECMonitor.EVENTS._STOP);
    }.bind(_this);

    _this._checkReady = function _checkReady(resolve) {
      var _this2 = this;

      if (this.ready) {
        return resolve();
      }

      setTimeout(function () {
        return _this2._checkReady(resolve);
      }, 1000);
    }.bind(_this);

    _this._processStdOut = function _processStdOut(data, cb) {
      if (/^TRAFFIC:.*/g.test(data)) {
        this._processTraffic(data);
      } else if (this.debug && /^DEBUG:.*/g.test(data)) {
        this._processDebug(data);
      } else if (/^NOTICE:.*/g.test(data)) {
        this._processNotice(data);
      } else if (/^waiting for input.*/g.test(data)) {
        this.ready = true;
        this.emit(CECMonitor.EVENTS._READY);
      } else if (/^WARNING:.*/g.test(data)) {
        this._processWarning(data);
      } else if (/^ERROR:.*/g.test(data)) {
        this._processError(data);
      }

      this.emit(CECMonitor.EVENTS._DATA, data);
      cb(null, data);
    }.bind(_this);

    _this._readPacket = function _readPacket(plain) {
      var regex = /^(TRAFFIC|DEBUG):[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]\[[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*([0-9]*)\][\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF](<<|>>)[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF](([0-9A-Z_a-z]{2}:?)+)$/g;
      var match = regex.exec(plain);
      if (match) {

        var tokens = match[3].split(':').map(function (h) {
          return parseInt(h, 16);
        });

        var packet = {
          type: match[0],
          number: match[1],
          flow: match[2] === '<<' ? 'IN' : 'OUT',
          source: (tokens[0] & 0xF0) >> 4,
          target: tokens[0] & 0x0F,
          opcode: tokens[1],
          args: tokens.slice(2)
        };

        this.emit(CECMonitor.EVENTS._PACKET, packet);
        return packet;
      }

      return null;
    }.bind(_this);

    _this._processTraffic = function _processTraffic(data) {

      this.emit(CECMonitor.EVENTS._TRAFFIC, data);

      var packet = this._readPacket(data);

      if (packet) {
        if (packet.flow === 'IN') {
          this.emit(CECMonitor.EVENTS._RECEIVED, packet);
        } else {
          this.emit(CECMonitor.EVENTS._SENDED, packet);
        }
        if (!packet.opcode) {
          this.emit(CECMonitor.EVENTS.POLLING_MESSAGE, packet);
        } else {
          this._precessEvents(packet);
        }
      }
    }.bind(_this);

    _this._precessEvents = function _precessEvents(packet) {

      var source = void 0,
          version = void 0,
          status = void 0,
          id = void 0,
          vendor = void 0,
          from = void 0,
          to = void 0,
          osdname = void 0;

      switch (packet.opcode) {
        case _HDMICEC2.default.Opcode.ACTIVE_SOURCE:
          if (packet.args.length !== 2) {
            return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command ACTIVE_SOURCE with bad formated address');
          }
          //todo: to add or to change to strings
          source = packet.args[0] << 8 | packet.args[1];
          return this.emit(CECMonitor.EVENTS.ACTIVE_SOURCE, packet, source);

        case _HDMICEC2.default.Opcode.CEC_VERSION:
          if (packet.args.length !== 2) {
            return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command CEC_VERSION without version');
          }
          version = packet.args[0] << 8 | packet.args[1];
          return this.emit(CECMonitor.EVENTS.CEC_VERSION, packet, version);

        case _HDMICEC2.default.Opcode.DECK_STATUS:
          if (packet.args.length !== 2) {
            return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command DECK_STATUS without Deck Info');
          }
          status = packet.args[0] << 8 | packet.args[1];
          return this.emit(CECMonitor.EVENTS.DECK_STATUS, packet, status);

        case _HDMICEC2.default.Opcode.DEVICE_VENDOR_ID:
          if (packet.args.length !== 3) {
            return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command DEVICE_VENDOR_ID with bad arguments');
          }
          id = packet.args[0] << 16 | packet.args[1] << 8 | packet.args[2];
          vendor = '';
          switch (id) {
            case _HDMICEC2.default.VendorId.TOSHIBA:
              vendor = 'TOSHIBA';
              break;
            case _HDMICEC2.default.VendorId.SAMSUNG:
              vendor = 'SAMSUNG';
              break;
            case _HDMICEC2.default.VendorId.DENON:
              vendor = 'DENON';
              break;
            case _HDMICEC2.default.VendorId.MARANTZ:
              vendor = 'MARANTZ';
              break;
            case _HDMICEC2.default.VendorId.LOEWE:
              vendor = 'LOEWE';
              break;
            case _HDMICEC2.default.VendorId.ONKYO:
              vendor = 'ONKYO';
              break;
            case _HDMICEC2.default.VendorId.MEDION:
              vendor = 'MEDION';
              break;
            case _HDMICEC2.default.VendorId.TOSHIBA2:
              vendor = 'TOSHIBA2';
              break;
            case _HDMICEC2.default.VendorId.PULSE_EIGHT:
              vendor = 'PULSE_EIGHT';
              break;
            case _HDMICEC2.default.VendorId.HARMAN_KARDON2:
              vendor = 'HARMAN_KARDON2';
              break;
            case _HDMICEC2.default.VendorId.GOOGLE:
              vendor = 'GOOGLE';
              break;
            case _HDMICEC2.default.VendorId.AKAI:
              vendor = 'AKAI';
              break;
            case _HDMICEC2.default.VendorId.AOC:
              vendor = 'AOC';
              break;
            case _HDMICEC2.default.VendorId.PANASONIC:
              vendor = 'PANASONIC';
              break;
            case _HDMICEC2.default.VendorId.PHILIPS:
              vendor = 'PHILIPS';
              break;
            case _HDMICEC2.default.VendorId.DAEWOO:
              vendor = 'DAEWOO';
              break;
            case _HDMICEC2.default.VendorId.YAMAHA:
              vendor = 'YAMAHA';
              break;
            case _HDMICEC2.default.VendorId.GRUNDIG:
              vendor = 'GRUNDIG';
              break;
            case _HDMICEC2.default.VendorId.PIONEER:
              vendor = 'PIONEER';
              break;
            case _HDMICEC2.default.VendorId.LG:
              vendor = 'LG';
              break;
            case _HDMICEC2.default.VendorId.SHARP:
              vendor = 'SHARP';
              break;
            case _HDMICEC2.default.VendorId.SONY:
              vendor = 'SONY';
              break;
            case _HDMICEC2.default.VendorId.BROADCOM:
              vendor = 'BROADCOM';
              break;
            case _HDMICEC2.default.VendorId.VIZIO:
              vendor = 'VIZIO';
              break;
            case _HDMICEC2.default.VendorId.BENQ:
              vendor = 'BENQ';
              break;
            default:
              vendor: 'UNKNOWN';
          }
          return this.emit(CECMonitor.EVENTS.DEVICE_VENDOR_ID, packet, id, vendor);

        case _HDMICEC2.default.Opcode.REPORT_PHYSICAL_ADDRESS:
          if (packet.args.length !== 3) {
            return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command REPORT_PHYSICAL_ADDRESS with bad formated address or device type');
          }
          source = packet.args[0] << 8 | packet.args[1];
          return this.emit(CECMonitor.EVENTS.REPORT_PHYSICAL_ADDRESS, packet, source, packet.args[2]);

        case _HDMICEC2.default.Opcode.REPORT_POWER_STATUS:
          if (packet.args.length !== 1) {
            return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command REPORT_POWER_STATUS with bad formated power status');
          }
          status = packet.args[0];
          return this.emit(CECMonitor.EVENTS.REPORT_POWER_STATUS, packet, status);

        case _HDMICEC2.default.Opcode.ROUTING_CHANGE:
          if (packet.args.length !== 4) {
            return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command ROUTING_CHANGE with bad formated addresses');
          }
          //todo: to add or to change to strings
          from = packet.args[0] << 8 | packet.args[1];
          to = packet.args[2] << 8 | packet.args[3];
          return this.emit(CECMonitor.EVENTS.ROUTING_CHANGE, packet, from, to);

        case _HDMICEC2.default.Opcode.SET_OSD_NAME:
          if (!packet.args.length) {
            return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command SET_OSD_NAME without OSD NAME');
          }
          osdname = String.fromCharCode.apply(null, packet.args);
          return this.emit(CECMonitor.EVENTS.SET_OSD_NAME, packet, osdname);

        case _HDMICEC2.default.Opcode.STANDBY:
          if (packet.args.length !== 0) {
            return this.emit(CECMonitor.EVENTS._ERROR, 'opcode command STANDBY with bad args');
          }
          return this.emit(CECMonitor.EVENTS.STANDBY);

        default:
          for (key in _HDMICEC2.default.Opcode) {
            if (opcodes[key] === packet.opcode) {
              return this.emit(CECMonitor.EVENTS[key], packet);
            }
          }
      }
    };

    _this._processNotice = function _processNotice(data) {
      var regex = /(Recorder[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF][0-9][\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]|Playback[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF][0-9][\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]|Tuner[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF][0-9][\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]|Audio[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])\(?([0-9])\)/g;
      var match = regex.exec(data);
      if (match) {
        this.address.primary = parseInt(match[2], 10);
        while (match) {
          this.address[match[2]] = true;
          match = regex.exec(data);
        }

        var regextra = /base[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]device:[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF][0-9A-Z_a-z]+[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]\(([0-9]{1,2})\),[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]HDMI[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]port[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]number:[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]([0-9]{1,2}),[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]physical[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]address:[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]([\.0-9A-Z_a-z]+)/g;
        match = regextra.exec(data);

        this.address.physical = match[3];
        this.address.base = parseInt(match[1], 10);
        this.address.hdmi = parseInt(match[2], 10);
      }

      return this.emit(CECMonitor.EVENTS._NOTICE, data);
    }.bind(_this);

    _this._processDebug = function _processDebug(data) {
      return this.emit(CECMonitor.EVENTS._DEBUG, data);
    }.bind(_this);

    _this._processWarning = function _processWarning(data) {
      return this.emit(CECMonitor.EVENTS._WARNING, data);
    }.bind(_this);

    _this._processError = function _processError(data) {
      return this.emit(CECMonitor.EVENTS._ERROR, data);
    }.bind(_this);

    _this.ready = false;
    _this.address = {
      primary: _HDMICEC2.default.LogicalAddress.UNKNOWN,
      physical: 'f.f.f.f',
      base: _HDMICEC2.default.LogicalAddress.UNKNOWN,
      hdmi: -1
    };
    _this.OSDName = OSDName || 'cec-monitor';
    _this.debug = debug;

    process.on('exit', _this.Stop);
    process.on('SIGINT', _this.Stop);

    _this.client = (0, _child_process.spawn)('cec-client', ['-t', 'r', '-t', 'p', '-t', 't', '-t', 'a', '-d', !_this.debug ? '12' : '32']);
    _this.client.stdout.pipe(_eventStream2.default.split()).pipe(_eventStream2.default.map(_this._processStdOut));
    _this.client.on('close', _this._onClose);
    return _this;
  }

  _createClass(CECMonitor, [{
    key: 'WriteRawMessage',
    value: function WriteRawMessage(raw) {
      var _this3 = this;

      return this.isReady.then(function () {
        return _this3.client.stdin.write(raw + '\n');
      });
    }
  }, {
    key: 'WriteMessage',
    value: function WriteMessage(source, target, opcode, args) {
      var msg = 'tx ' + [(source << 4) + target, opcode].concat(args || []).map(function (h) {
        return ('0' + h.toString(16)).substr(-2);
      }).join(':');
      return this.WriteRawMessage(msg);
    }
  }, {
    key: 'Stop',
    value: function Stop() {
      this.emit(CECMonitor.EVENTS._STOP);
      if (this.client) {
        this.client.kill('SIGINT');
      }
    }
  }, {
    key: 'isReady',
    get: function get() {
      return new Promise(this._checkReady);
    }
  }], [{
    key: 'EVENTS',
    get: function get() {
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
        _WARNING: '_warning',

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
      };
    }
  }]);

  return CECMonitor;
}(_events.EventEmitter);

exports.default = CECMonitor;