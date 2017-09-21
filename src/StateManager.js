/**
 * Created by pablo on 9/14/17.
 */
'use strict'

import DeviceState from './DeviceState'

export default class StateManager extends Array {
  static get [Symbol.species]() { return Array }

  constructor (){
    super()
    for (let i = 0; i < 16; i++) {
      this.push(new DeviceState())
    }
  }

  GetByPhysical(address) {
    return this.find(S => S.physical === address)
  }

  GetByRoute(route) {
    return this.find(S => S.route === route)
  }
}