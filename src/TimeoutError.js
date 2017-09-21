/**
 * Created by pablo on 9/12/17.
 */
'use strict'

export default class CECTimeoutError extends Error {

  constructor(target, timeout) {
    super('CEC monitor hasn\'t gotten response in some time (%d ms) from %s', timeout, target)
  }

}