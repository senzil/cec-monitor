/**
 * Created by pablo on 9/21/17.
 */
'use strict'

export default class Convert {

  /**
   * Convert array of values from CEC into Number formatted physical address
   * @param {number[]} args An array of byte values
   * @return {Number} Physical address in integer CEC protocol notation
   */
  static argsToPhysical(args) {
    return args[0] << 8 | args[1]
  }

  /**
   * Convert integer CEC protocol notation into string formatted physical address
   * @param {Number} address An array of byte values
   * @return {string} Physical address in . notation ie 0.0.0.0
   */
  static physicalToRoute(address) {
    return (`0000${address.toString(16)}`).slice(-4).split('').join('.')
  }

  /**
   * Convert array of values from CEC into string formatted physical address
   * @param {number[]} args An array of byte values
   * @return {string} Physical address in . notation ie 0.0.0.0
   */
  static argsToRoute(args) {
    return Converter.physicalToRoute(Converter.argsToPhysical(args))
  }

  /**
   * Convert string formatted physical address into integer CEC protocol notation
   * @param {String} address Physical address in . notation ie 0.0.0.0
   * @return {Number} Physical address in integer CEC protocol notation
   */
  static routeToPhysical(address) {
    return Number.parseInt(address.split('.').join(''), 16)
  }

  /**
   * Convert array of values from CEC into VendorId Integer CEC Protocol notation
   * @param {Number[]} args An array of byte values
   * @return {Number} VendorId Integer CEC Protocol notation
   */
  static argsToVendorID(args) {
    return args[0] << 16 | args[1] << 8 | args[2]
  }

  /**
   * Convert array of values from CEC into OSD Name
   * @param {Number[]} args An array of byte values
   * @return {String} OSD Name
   */
  static argsToOSDName(args) {
    return String.fromCharCode.apply(null, args)
  }

  /**
   * Convert a Number formatted physical address into array of values to CEC
   * @param {Number} address a Physical address in integer CEC protocol notation
   * @return {Number[]} An array of byte values
   */
  static physicalToArgs(address) {
    return [address >> 8, address & 0xFF]
  }

  /**
   * Convert string formatted phyiscal address of form 0.0.0.0 to two-byte array
   *
   * @param {string} address Physical address to convert
   * @return {number[]} A two-byte encoded verstion represented as an array
   */
  static routeToArgs(address) {
    return Converter.physicalToArgs(Converter.routeToPhysical(address))
  }
}