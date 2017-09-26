/**
 * Created by pablo on 9/22/17.
 */
'use strict'

export default class Validate {

  /**
   * Determine if provided string matches a CEC physical address
   * @param {String} address Address to test
   * @return {Boolean} True if it matches form 0.0.0.0 otherwise false
   */
  static isRoute(address) {
    return /^\d\.\d\.\d\.\d$/gui.test(address)
  }

  /**
   * Determine if provided string matches a hexadecimal number representation
   * @param {String} address Address to test
   * @return {Boolean} True if it matches form 0.0.0.0 otherwise false
   */
  static isHexaNumber(address) {
    return /^0[xX][\da-fA-F]+$/giu.test(address)
  }
}