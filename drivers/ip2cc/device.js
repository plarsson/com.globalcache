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
    this._sendProntoCode(connectorAddress, outputState)
  }

  _sendState (connectorAddress, outputState) {
    const cmd = []
    cmd.push('setstate')
    cmd.push(connectorAddress)
    cmd.push(outputState === STATE_CLOSED ? 1 : 0)
    const dataStr = cmd.join(',')

    const client = new net.Socket()
    client.connect(this._port, this._deviceData.ip, function () {
      client.write(dataStr + '\r')
    })

    client.on('data', function (data) {
      client.destroy()
    })
  }
}

module.exports = ITachIP2CCDevice
