/**
 * Created by pablo on 9/14/17.
 */
'use strict'

import DeviceState from './DeviceState'
import CEC from './HDMI-CEC.1.4'

export default class StateManager extends Array {
  static get [Symbol.species]() { return Array }

  constructor (){
    super()
    for (let state, i = 0; i < 16; i++) {
      state = new DeviceState(CEC.LogicalAddressNames[i])
      //set TV physical address
      if (i===0) {
        state.physical = 0
      }
      this.push(state)
    }
  }

  GetByPhysical(address) {
    return this.find(S => S.physical === address)
  }

  GetByRoute(route) {
    return this.find(S => S.route === route)
  }
}