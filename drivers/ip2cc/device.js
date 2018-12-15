const ITachDevice = require('../itachdevice')
const net = require('net')

const STATE_OPEN = 'open'
const STATE_CLOSED = 'closed'

class ITachIP2CCDevice extends ITachDevice {
  onInit () {
    super.onInit()
    this._port = 4998
  }

  async onAutoCompleteOutputState (query, args) {
    return [ { name: STATE_OPEN }, { name: STATE_CLOSED } ]
  }

  async executeCommand (args) {
    const outputState = args.outputstate.name
    const connectorAddress = args.connectoraddress.name
    const duration = args.duration
    this._sendState(connectorAddress, outputState, duration)
  }

  _sendState (connectorAddress, outputState, duration) {
    const cmd = []
    cmd.push('setstate')
    cmd.push(connectorAddress)
    cmd.push(outputState === STATE_CLOSED ? 1 : 0)
    const dataStr = cmd.join(',')

    const client = new net.Socket()
    client.setTimeout(10000)

    client.connect(this._port, this._deviceData.ip, () => {
      client.write(dataStr + '\r')
    })

    client.on('close', () => {
      if (duration && duration > 0) {
        setTimeout(() => { this._sendState(connectorAddress, outputState === STATE_CLOSED ? STATE_OPEN : STATE_CLOSED, null) }, duration) 
      }
      client.destroy()
    })

    client.on('data', (data) => {
      client.destroy()
    })

    client.on('timeout', () => {
      client.destroy()
    })
  }
}

module.exports = ITachIP2CCDevice
