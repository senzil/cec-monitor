/**
 * Created by pablo on 6/13/17.
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  VendorId: {
    TOSHIBA: 0x000039,
    SAMSUNG: 0x0000F0,
    DENON: 0x0005CD,
    MARANTZ: 0x000678,
    LOEWE: 0x000982,
    ONKYO: 0x0009B0,
    MEDION: 0x000CB8,
    TOSHIBA2: 0x000CE7,
    PULSE_EIGHT: 0x001582,
    HARMAN_KARDON2: 0x001950,
    GOOGLE: 0x001A11,
    AKAI: 0x0020C7,
    AOC: 0x002467,
    PANASONIC: 0x008045,
    PHILIPS: 0x00903E,
    DAEWOO: 0x009053,
    YAMAHA: 0x00A0DE,
    GRUNDIG: 0x00D0D5,
    PIONEER: 0x00E036,
    LG: 0x00E091,
    SHARP: 0x08001F,
    SONY: 0x080046,
    BROADCOM: 0x18C086,
    VIZIO: 0x6B746D,
    BENQ: 0x8065E9,
    HARMAN_KARDON: 0x9C645E,
    UNKNOWN: 0
  },

  LogicalAddress: {
    UNKNOWN: -1,
    TV: 0,
    RECORDINGDEVICE1: 1,
    RECORDINGDEVICE2: 2,
    TUNER1: 3,
    PLAYBACKDEVICE1: 4,
    AUDIOSYSTEM: 5,
    TUNER2: 6,
    TUNER3: 7,
    PLAYBACKDEVICE2: 8,
    RECORDINGDEVICE3: 9,
    TUNER4: 10,
    PLAYBACKDEVICE3: 11,
    RESERVED1: 12,
    RESERVED2: 13,
    FREEUSE: 14,
    UNREGISTERED: 15,
    BROADCAST: 15
  },

  Opcode: {
    //Used by a new source to indicate that it has started to transmit a stream OR used in response to a "Request Active Source" (Brodcast). This message is used in several features : One Touch Play,Routing Control
    ACTIVE_SOURCE: 0x82,
    //Sent by a source device to the TV whenever it enters the active state (alternatively it may send "Text View On") (Directly addressed)
    IMAGE_VIEW_ON: 0x04,
    //As "Image View On", but should also remove any text, menus and PIP windows from the TV’s display (Directly addressed)
    TEXT_VIEW_ON: 0x0D,

    //Used by the currently active source to inform the TV that it has no video to be presented to the user, or is going into standby as the result of a local user command on the device (Directly addressed)
    INACTIVE_SOURCE: 0x9D,
    //Used by a new device to discover the status of the system (Broadcast)
    REQUEST_ACTIVE_SOURCE: 0x85,
    //Sent by a CEC Switch when it is manually switched to inform all other devices on the network that the active route below the switch has changed (Broadcast)
    ROUTING_CHANGE: 0x80,
    //Sent by a CEC Switch to indicate the active route below the switch (Broadcast)
    ROUTING_INFORMATION: 0x81,
    //Used by the TV to request a streaming path from the specified address (Broadcast)
    SET_STREAM_PATH: 0x86,

    //Switches on or all devices into standby mode. Can be used a broadcast message or be addressed to a specific device (Broadcast or Directly addressed)
    STANDBY: 0x36,

    //Requests a device to stop a recording (Directly addressed)
    RECORD_OFF: 0x0B,
    //Attempt to record the specified source (Directly addressed). This message is used in several features : One Touch Record,Tuner Control
    RECORD_ON: 0x09,
    //Used by a Recording Device to inform the initiator of the message "Record On" about its status (Directly addressed)
    RECORD_STATUS: 0x0A,
    //Request by the Recording Device to record the presently displayed source (Directly addressed)
    RECORD_TV_SCREEN: 0x0F,

    //Used to clear an Analogue timer block of a device (Directly addressed)
    CLEAR_ANALOGUE_TIMER: 0x33,
    //Used to clear a Digital timer block of a device (Directly addressed)
    CLEAR_DIGITAL_TIMER: 0x99,
    //Used to clear an External timer block of a device (Directly addressed)
    CLEAR_EXTERNAL_TIMER: 0xA1,
    //Used to set a single timer block on an Analogue Recording Device (Directly addressed)
    SET_ANALOGUE_TIMER: 0x34,
    //Used to set a single timer block on a Digital Recording Device (Directly addressed)
    SET_DIGITAL_TIMER: 0x97,
    //Used to set a single timer block to record from an external device (Directly addressed)
    SET_EXTERNAL_TIMER: 0xA2,
    //Used to set the name of a program associated with a timer block. Sent directly after sending a "Set Analogue Timer" or "Set Digital Timer" message. The name is then associated with that timer block (Directly addressed)
    SET_TIMER_PROGRAM_TITLE: 0x67,
    //Used to give the status of a "Clear Analogue Timer", "Clear Digital Timer" or "Clear External Timer" message (Directly addressed)
    TIMER_CLEARED_STATUS: 0x43,
    //Used to send timer status to the initiator of a "Status Timer" message (Directly addressed)
    TIMER_STATUS: 0x35,

    //Used to indicate the supported CEC version, in response to a "Get CEC Version" (Directly addressed)
    CEC_VERSION: 0x9E,
    //Used by a device to enquire which version of CEC the target supports (Directly addressed)
    GET_CEC_VERSION: 0x9F,
    //A request to a device to return its physical address. (Directly addressed)
    GIVE_PHYSICAL_ADDRESS: 0x83,
    //Sent by a device capable of character generation (for OSD and Menus) to a TV in order to discover the currently selected Menu language. Also used by a TV during installation to discover the currently set menu language from other devices (Directly addressed)
    GET_MENU_LANGUAGE: 0x91,
    //Used to inform all other devices of the mapping between physical and logical address of the initiator (Broadcast)
    REPORT_PHYSICAL_ADDRESS: 0x84,
    //Used by a TV or another device to indicate the menu language (Broadcast)
    SET_MENU_LANGUAGE: 0x32,

    //Used to control a device’s media functions (Directly addressed)
    DECK_CONTROL: 0x42,
    //Used to provide a deck’s status to the initiator of the "Give Deck Status" message (Directly addressed)
    DECK_STATUS: 0x1B,
    //Used to request the status of a device, regardless of whether or not it is the current active source (Directly addressed)
    GIVE_DECK_STATUS: 0x1A,
    //Used to control the playback behaviour of a source device (Directly addressed)
    PLAY: 0x41,

    //Used to request the status of a tuner device (Directly addressed)
    GIVE_TUNER_DEVICE_STATUS: 0x08,
    //Directly selects an Analogue TV service (Directly addressed)
    SELECT_ANALOGUE_SERVICE: 0x92,
    //Directly selects a Digital TV, Radio or Data Broadcast Service (Directly addressed)
    SELECT_DIGITAL_SERVICE: 0x93,
    //Used by a tuner device to provide its status to the initiator of the "Give Tuner Device Status" message (Directly addressed)
    TUNER_DEVICE_STATUS: 0x07,
    //Used to tune to next lowest service in a tuner’s service list. Can be used for PIP (Directly addressed)
    TUNER_STEP_DECREMENT: 0x06,
    //Used to tune to next highest service in a tuner’s service list. Can be used for PIP (Directly addressed)
    TUNER_STEP_INCREMENT: 0x05,

    //Reports the Vendor ID of this device (Broadcast)
    DEVICE_VENDOR_ID: 0x87,
    //Requests the Vendor ID from a device (Directly addressed)
    GIVE_DEVICE_VENDOR_ID: 0x8C,
    //Allows vendor specific commands to be sent between two devices (Directly addressed)
    VENDOR_COMMAND: 0x89,
    //Allows vendor specific commands to be sent between two devices or broadcast (Directly addressed or Broadcast)
    VENDOR_COMMAND_WITH_ID: 0xA0,
    //Indicates that a remote control button has been depressed (Directly addressed or Broadcast)
    VENDOR_REMOTE_BUTTON_DOWN: 0x8A,
    //Indicates that a remote control button (the last button pressed indicated by the "Vendor Remote Button Down" message) has been released (Directly addressed or Broadcast)
    VENDOR_REMOTE_BUTTON_UP: 0x8B,

    //Used to send a text message to output on a TV (Directly addressed)
    SET_OSD_STRING: 0x64,
    //Used to request the preferred OSD name of a device for use in menus associated with that device (Directly addressed)
    GIVE_OSD_NAME: 0x46,
    //Used to set the preferred OSD name of a device for use in menus associated with that device (Directly addressed)
    SET_OSD_NAME: 0x47,

    //A request from the TV for a device to show/remove a menu or to query if a device is currently showing a menu (Directly addressed)
    MENU_REQUEST: 0x8D,
    //Used to indicate to the TV that the device is showing/has removed a menu and requests the remote control keys to be passed though (Directly addressed)
    MENU_STATUS: 0x8E,

    //Used to indicate that the user pressed a remote control button or switched from one remote control button to another (Directly addressed). This message is used in several features : Device Menu Control,System Audio Control,Remote Control Pass Through
    USER_CONTROL_PRESSED: 0x44,
    //Indicates that user released a remote control button (the last one indicated by the "User Control Pressed" message) (Directly addressed). This message is used in several features : Device Menu Control,System Audio Control,Remote Control Pass Through
    USER_CONTROL_RELEASE: 0x45,

    //Used to determine the current power status of a target device (Directly addressed)
    GIVE_DEVICE_POWER_STATUS: 0x8F,
    //Used to inform a requesting device of the current power status (Directly addressed)
    REPORT_POWER_STATUS: 0x90,

    //Used as a response to indicate that the device does not support the requested message type, or that it cannot execute it at the present time (Directly addressed)
    FEATURE_ABORT: 0x00,
    //This message is reserved for testing purposes (Directly addressed)
    ABORT: 0xFF,

    //Requests an amplifier to send its volume and mute status (Directly addressed)
    GIVE_AUDIO_STATUS: 0x71,
    //Requests the status of the System Audio Mode (Directly addressed)
    GIVE_SYSTEM_AUDIO_MODE_STATUS: 0x7D,
    //Reports an amplifier’s volume and mute status (Directly addressed)
    REPORT_AUDIO_STATUS: 0x7A,
    //Turns the System Audio Mode On or Off (Directly addressed or Broadcast)
    SET_SYSTEM_AUDIO_MODE: 0x72,
    //A device implementing System Audio Control and which has volume control RC buttons (eg TV or STB) requests to use System Audio Mode to the amplifier (Directly addressed)
    SYSTEM_AUDIO_MODE_REQUEST: 0x70,
    //Reports the current status of the System Audio Mode (Directly addressed)
    SYSTEM_AUDIO_MODE_STATUS: 0x7E,

    //Used to control audio rate from Source Device (Directly addressed)
    SET_AUDIO_RATE: 0x9A,

    //ARC 1.4 support
    START_ARC: 0xC0,
    REPORT_ARC_STARTED: 0xC1,
    REPORT_ARC_ENDED: 0xC2,
    REQUEST_ARC_START: 0xC3,
    REQUEST_ARC_END: 0xC4,
    END_ARC: 0xC5,

    CDC: 0xF8,
    NONE: 0xFD
  },

  UserControlCode: {
    SELECT: 0x00,
    UP: 0x01,
    DOWN: 0x02,
    LEFT: 0x03,
    RIGHT: 0x04,
    RIGHT_UP: 0x05,
    RIGHT_DOWN: 0x06,
    LEFT_UP: 0x07,
    LEFT_DOWN: 0x08,
    ROOT_MENU: 0x09,
    SETUP_MENU: 0x0A,
    CONTENTS_MENU: 0x0B,
    FAVORITE_MENU: 0x0C,
    EXIT: 0x0D,
    TOP_MENU: 0x10,
    DVD_MENU: 0x11,
    NUMBER_ENTRY_MODE: 0x1D,
    NUMBER11: 0x1E,
    NUMBER12: 0x1F,
    NUMBER0: 0x20,
    NUMBER1: 0x21,
    NUMBER2: 0x22,
    NUMBER3: 0x23,
    NUMBER4: 0x24,
    NUMBER5: 0x25,
    NUMBER6: 0x26,
    NUMBER7: 0x27,
    NUMBER8: 0x28,
    NUMBER9: 0x29,
    DOT: 0x2A,
    ENTER: 0x2B,
    CLEAR: 0x2C,
    NEXT_FAVORITE: 0x2F,
    CHANNEL_UP: 0x30,
    CHANNEL_DOWN: 0x31,
    PREVIOUS_CHANNEL: 0x32,
    SOUND_SELECT: 0x33,
    INPUT_SELECT: 0x34,
    DISPLAY_INFORMATION: 0x35,
    HELP: 0x36,
    PAGE_UP: 0x37,
    PAGE_DOWN: 0x38,
    POWER: 0x40,
    VOLUME_UP: 0x41,
    VOLUME_DOWN: 0x42,
    MUTE: 0x43,
    PLAY: 0x44,
    STOP: 0x45,
    PAUSE: 0x46,
    RECORD: 0x47,
    REWIND: 0x48,
    FAST_FORWARD: 0x49,
    EJECT: 0x4A,
    FORWARD: 0x4B,
    BACKWARD: 0x4C,
    STOP_RECORD: 0x4D,
    PAUSE_RECORD: 0x4E,
    ANGLE: 0x50,
    SUB_PICTURE: 0x51,
    VIDEO_ON_DEMAND: 0x52,
    ELECTRONIC_PROGRAM_GUIDE: 0x53,
    TIMER_PROGRAMMING: 0x54,
    INITIAL_CONFIGURATION: 0x55,
    SELECT_BROADCAST_TYPE: 0x56,
    SELECT_SOUND_PRESENTATION: 0x57,
    PLAY_FUNCTION: 0x60,
    PAUSE_PLAY_FUNCTION: 0x61,
    RECORD_FUNCTION: 0x62,
    PAUSE_RECORD_FUNCTION: 0x63,
    STOP_FUNCTION: 0x64,
    MUTE_FUNCTION: 0x65,
    RESTORE_VOLUME_FUNCTION: 0x66,
    TUNE_FUNCTION: 0x67,
    SELECT_MEDIA_FUNCTION: 0x68,
    SELECT_AV_INPUT_FUNCTION: 0x69,
    SELECT_AUDIO_INPUT_FUNCTION: 0x6A,
    POWER_TOGGLE_FUNCTION: 0x6B,
    POWER_OFF_FUNCTION: 0x6C,
    POWER_ON_FUNCTION: 0x6D,
    F1_BLUE: 0x71,
    F2_RED: 0x72,
    F3_GREEN: 0x73,
    F4_YELLOW: 0x74,
    F5: 0x75,
    DATA: 0x76,
    AN_RETURN: 0x91,
    AN_CHANNELS_LIST: 0x96,
    MAX: 0x96,
    UNKNOWN: 0xFF
  },

  //Used to control a device’s media functions (Directly addressed)
  DeckControl: {
    SKIP_FORWARD_WIND: 0x01,
    SKIP_REVERSE_REWIND: 0x02,
    STOP: 0X03,
    EJECT: 0X04
  },

  //Used to provide a deck’s status to the initiator of the "Give Deck Status" message (Directly addressed)
  DeckStatus: {
    PLAY: 0x11,
    RECORD: 0x12,
    PLAY_REVERSE: 0x13,
    STILL: 0x14,
    SLOW: 0x15,
    SLOW_REVERSE: 0x16,
    FAST_FOWARD: 0x17,
    FAST_REVERSE: 0x18,
    NO_MEDIA: 0x19,
    STOP: 0x1A,
    SKIP_FOWARD: 0x1B,
    SKIP_REVERSE: 0x1C,
    INDEX_SEARCH_FOWARD: 0x1D,
    INDEX_SEARCH_REVERSE: 0x1E,
    OTHER_STATUS: 0x1F
  },

  //Used to request the status of a device, regardless of whether or not it is the current active source (Directly addressed)
  //Used to request the status of a tuner device (Directly addressed)
  GiveStatus: {
    ON: 0x01,
    OFF: 0x02,
    ONCE: 0x03
  },

  AnalogueBroadcastType: {
    CABLE: 0x00,
    SATELLITE: 0x01,
    TERRESTRIAL: 0x02
  },

  BroadcastSystem: {
    PAL_B_G: 0x00,
    SECAM_L_APOSTROPHE: 0x01,
    PAL_M: 0X02,
    NTSC_M: 0X03,
    PAL_I: 0X04,
    SECAM_DK: 0X05,
    SECAM_B_G: 0X06,
    SECAM_L: 0X07,
    PAL_DK: 0X08,
    OTHER_SYSTEM: 0X1F
  },

  ServiceIdentificationMethod: {
    SERVICE_IDENTIFIED_BY_DIGITAL_IDS: 0x00,
    SERVICE_IDENTIFIED_BY_CHANNEL: 0x01
  },

  DigitalBroadcastSystem: {
    ARIB_GENERIC: 0x00,
    ATSC_GENERIC: 0X01,
    DVB_GENERIC: 0X02,
    ARIB_BS: 0x08,
    ARIB_CS: 0x09,
    ARIB_T: 0x0A,
    ATSC_CABLE: 0x10,
    ATSC_SATELLITE: 0x11,
    ATSC_TERRESTRIAL: 0x12,
    DVB_C: 0x18,
    DVB_S: 0x19,
    DVB_S2: 0x1A,
    DVB_T: 0x1B
  },

  ChannelNumberFormat: {
    ONE_PART_CHANNEL_NUMBER: 0x01,
    TWO_PART_CHANNEL_NUMBER: 0x02
  },

  //Used to control the playback behaviour of a source device (Directly addressed
  Play: {
    FAST_FORWARD_MIN_SPEED: 0x05,
    FAST_FORWARD_MEDIUM_SPEED: 0X06,
    FAST_FORWARD_MAX_SPEED: 0X07,
    FAST_REVERSE_MIN_SPEED: 0X09,
    FAST_REVERSE_MEDIUM_SPEED: 0x0A,
    FAST_REVERSE_MAX_SPEED: 0x0B,
    SLOW_FORWARD_MIN_SPEED: 0x15,
    SLOW_FORWARD_MEDIUM_SPEED: 0x16,
    SLOW_FORWARD_MAX_SPEED: 0x17,
    SLOW_REVERSE_MIN_SPEED: 0x19,
    SLOW_REVERSE_MEDIUM_SPEED: 0x1A,
    SLOW_REVERSE_MAX_SPEED: 0x1B,
    PLAY_REVERSE: 0x20,
    PLAY_FORWARD: 0x24,
    PLAY_STILL: 0x25
  },

  PowerStatus: {
    ON: 0x00,
    STANDBY: 0x01,
    IN_TRANSITION_STANDBY_TO_ON: 0x02,
    IN_TRANSITION_ON_TO_STANDBY: 0x03,
    UNKNOWN: 0x99
  },

  //Used by a Recording Device to inform the initiator of the message "Record On" about its status (Directly addressed)
  RecordStatus: {
    RECORDING_CURRENTLY_SELECTED_SOURCE: 0x01,
    RECORDING_DIGITAL_SERVICE: 0x02,
    RECORDING_ANALOGUE_SERVICE: 0x03,
    RECORDING_EXTERNAL_INPUT: 0x04,
    NO_RECORDING_UNABLE_TO_RECORD_DIGITAL_SERVICE: 0x05,
    NO_RECORDING_UNABLE_TO_RECORD_ANALOGUE_SERVICE: 0x06,
    NO_RECORDING_UNABLE_TO_RECORD_REQUIRED_SERVICE: 0x07,
    NO_RECORDING_INVALID_EXTERNAL_PLUG_NUMBER: 0x09,
    NO_RECORDING_INVALID_EXTERNAL_PHYSICAL_ADDRESS: 0X0A,
    NO_RECORDING_CA_SYSTEM_NOT_SUPPORTED: 0X0B,
    NO_RECORDING_NO_OR_INSUFFICIENT_CA_ENTITLEMENTS: 0X0C,
    NO_RECORDING_NOT_ALLOWED_TO_COPY_SOURCE: 0X0D,
    NO_RECORDING_NO_FURTHER_COPIES_ALLOWED: 0X0E,
    NO_RECORDING_NO_MEDIA: 0X10,
    NO_RECORDING_PLAYING: 0X11,
    NO_RECORDING_ALREADY_RECORDING: 0X12,
    NO_RECORDING_MEDIA_PROTECTED: 0X13,
    NO_RECORDING_NO_SOURCE_SIGNAL: 0X14,
    NO_RECORDING_MEDIA_PROBLEM: 0X15,
    NO_RECORDING_NOT_ENOUGH_SPACE_AVAILABLE: 0X16,
    NO_RECORDING_PARENTAL_LOCK_ON: 0X17,
    RECORDING_TERMINATED_NORMALLY: 0X1A,
    RECORDING_HAS_ALREADY_TERMINATED: 0X1B,
    NO_RECORDING_OTHER_REASON: 0X1F
  },

  AudioMute: {
    OFF: 0x00,
    ON: 0x01
  },

  SystemAudioStatus: {
    OFF: 0x00,
    ON: 0x01
  },

  MenuRequestType: {
    ACTIVATE: 0x00,
    DEACTIVATE: 0x01,
    QUERY: 0x02
  },

  MenuStatus: {
    ACTIVATE: 0x00,
    DEACTIVATE: 0x01
  },

  RecordingSequence: {
    ONCE_ONLY: 0x00,
    SUNDAY: 0x01,
    MONDAY: 0x02,
    TUESDAY: 0x04,
    WEDNESDAY: 0x08,
    THURSDAY: 0x10,
    FRIDAY: 0x20,
    SATURDAY: 0x40
  },

  ExternalSourceSpecifier: {
    EXTERNAL_PLUG: 0x04,
    EXTERNAL_PHYSICAL_ADDRESS: 0x05
  },

  TimerClearedStatusData: {
    TIMER_NOT_CLEARED_RECORDING: 0x00,
    TIMER_NOT_CLEARED_NO_MATCHING: 0x01,
    TIMER_NOT_CLEARED_NO_INFO_AVAILABLE: 0x02,
    TIMER_CLEARED: 0x80
  },

  CECVersion: {
    VERSION_1_1: 0x00,
    VERSION_1_2: 0x01,
    VERSION_1_2A: 0x02,
    VERSION_1_3: 0x03,
    VERSION_1_3A: 0x04
  },

  DeviceType: {
    TV: 0x00,
    RECORDING_DEVICE: 0x01,
    RESERVED: 0x02,
    TUNER: 0x03,
    PLAYBACK_DEVICE: 0x04,
    AUDIO_SYSTEM: 0x05
  },

  DisplayControl: {
    DISPLAY_FOR_DEFAULT_TIME: 0x00,
    DISPLAY_UNTIL_CLEARED: 0x40,
    CLEAR_PREVIOUS_MESSAGE: 0x80,
    RESERVED_FOR_FUTURE_USE: 0xC0
  },

  AudioRate: {
    RATE_CONTROL_OFF: 0x00,
    WRC_STANDARD_RATE_100: 0x01,
    WRC_FAST_RATE_MAX_101: 0x02,
    WRC_SLOW_RATE_MIN_99: 0x03,
    NRC_STANDARD_RATE_100_0: 0x04,
    NRC_FAST_RATE_MAX_100_1: 0x05,
    NRC_SLOW_RATE_MIN_99_9: 0x06
  },

  AbortReason: {
    UNRECOGNIZED_OPCODE: 0x00,
    NOT_IN_CORRECT_MODE_TO_RESPOND: 0x01,
    CANNOT_PROVIDE_SOURCE: 0x02,
    INVALID_OPERAND: 0x03,
    REFUSED: 0x04
  }
};