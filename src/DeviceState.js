/**
 * Created by pablo on 9/19/17.
 */
'use strict'

import CEC from './HDMI-CEC.1.4'
import Converter from './Convert'

const privates = new WeakMap()

export default class DeviceState {

  constructor(logical, osd) {
    let _logical = logical
    let _physical = -1
    let _route = ''
    let _status = CEC.PowerStatus.UNKNOWN
    let _power = CEC.PowerStatusNames[_status]
    let _osdname = osd || CEC.LogicalAddressNames[_logical]
    let _primary = false
    let _own = false
    let _vendorid = CEC.VendorId.UNKNOWN
    let _vendor = CEC.VendorIdNames[_vendorid]
    let _timestamp = Date.now()
    let _cec = -1
    let _cecversion = CEC.CECVersionNames[_cec]

    privates.set(this, {
      _logical,
      _cec,
      _cecversion,
      _osdname,
      _own,
      _physical,
      _power,
      _primary,
      _route,
      _status,
      _vendorid,
      _vendor,
      _timestamp
    })

    Object.defineProperties(this, {
      'logical': {
        enumerable: true,
        get: () => privates.get(this)._logical,
      },
      'cec': {
        enumerable: true,
        get: () => privates.get(this)._cec,
        set: (cec) => {
          const _ = privates.get(this)
          _._cec = cec
          _._cecversion = CEC.CECVersionNames[cec]
          _._timestamp = Date.now()
          return cec
        }
      },
      'cecversion': {
        enumerable: true,
        get: () => privates.get(this)._cecversion,
      },
      'osdname': {
        enumerable: true,
        get: () => privates.get(this)._osdname,
        set: osdname => {
          const _ = privates.get(this)
          _._osdname = osdname
          _._timestamp = Date.now()
          return osdname
        }
      },
      'own': {
        enumerable: true,
        get:  () => privates.get(this)._own,
        set: _own => {
          const _ = privates.get(this)
          _._own = _own
          _._timestamp = Date.now()
          return _own
        }
      },
      'physical': {
        enumerable: true,
        get: () => privates.get(this)._physical,
        set: address => {
          const _ = privates.get(this)
          _._physical = address
          _._route = Converter.physicalToRoute(address)
          _._timestamp = Date.now()
          return address
        }
      },
      'power': {
        enumerable: true,
        get:  () => privates.get(this)._power
      },
      'primary': {
        enumerable: true,
        get:  () => privates.get(this)._primary,
        set: _primary => {
          const _ = privates.get(this)
          _._primary = _primary
          _._timestamp = Date.now()
          return _primary
        }
      },
      'route': {
        enumerable: true,
        get: () => privates.get(this)._route,
        set: route => {
          const _ = privates.get(this)
          _._route = route
          _._physical = Converter.routeToPhysical(route)
          _._timestamp = Date.now()
          return route
        }
      },
      'status': {
        enumerable: true,
        get: ()  => privates.get(this)._status,
        set: status => {
          const _ = privates.get(this)
          _._status = status
          _._power = CEC.PowerStatusNames[_._status]
          _._timestamp = Date.now()
          return status
        }
      },
      'vendorid': {
        enumerable: true,
        get: () => privates.get(this)._vendorid,
        set: vendorid => {
          const _ = privates.get(this)
          _._vendorid = vendorid
          _._vendor = CEC.VendorIdNames[vendorid]
          _._timestamp = Date.now()
          return vendorid
        }
      },
      'vendor': {
        enumerable: true,
        get: () => privates.get(this)._vendor,
      },
      'timestamp': {
        enumerable: true,
        get: () => privates.get(this)._timestamp
      }
    })
  }
}