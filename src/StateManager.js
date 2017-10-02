/**
 * Created by pablo on 9/14/17.
 */
'use strict'

import DeviceState from './DeviceState'

export default class StateManager extends Array {
  static get [Symbol.species]() { return Array }

  constructor (){
    super()
    for (let state, i = 0; i < 15; i++) { //avoid save broadcast state
      state = new DeviceState(i)
      //set TV physical address
      if (i===0) {
        state.physical = 0x0000
      }
      this.push(state)
    }
  }

  get timestamp(){
    return Math.min(...this)
  }

  GetByPhysical(address) {
    return this.find(S => S.physical === address)
  }

  GetByRoute(route) {
    return this.find(S => S.route === route)
  }
}