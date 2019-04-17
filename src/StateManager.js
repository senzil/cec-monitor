/**
 * Created by pablo on 9/14/17.
 */
'use strict'

import DeviceState from './DeviceState'
import CEC from './HDMI-CEC.1.4'

export default class StateManager extends Array {
  static get [Symbol.species]() { return Array }

  base;
  active_source;

  constructor (){
    super()
    this.base = CEC.LogicalAddress.UNKNOWN
    this.active_source = null // Default not known
    for (let state, i = CEC.LogicalAddress.TV; i <= CEC.LogicalAddress.FREEUSE; i++) { //avoid save broadcast state
      state = new DeviceState(i)
      //set TV physical address
      if (i===CEC.LogicalAddress.TV) {
        state.physical = 0x0000
      }
      this.push(state)
    }
  }

  get timestamp(){
    return Math.min(...this.map(s => s.timestamp))
  }

  GetByPhysical(address) {
    return this.find(S => S.physical === address)
  }

  GetByRoute(route) {
    return this.find(S => S.route === route)
  }

  get primary() {
    return this.find(S => S.primary === true)
  }

  set primary(logical) {
    this.forEach(S => S.primary === false)
    this[logical].primary = true
    return this[logical]
  }

  get owns() {
    return this.filter(S => S.own === true)
  }

  get hdmi() {
    return this.primary.physical >> 12
  }

  set hdmi(port) {
    const newport = (this.primary.physical & 0x0fff) + (port << 12)
    this.owns.forEach(own => own.physical = newport)
    return newport
  }
}