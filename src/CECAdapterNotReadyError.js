/**
 * Created by pablo on 9/12/17.
 */
'use strict'

export default class CECAdapterNotReadyError extends Error {

  constructor() {
    super('The CEC adapter is not ready to receive massages')
  }

}