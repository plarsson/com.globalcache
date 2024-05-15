const ITachDevice = require('../itachdevice')
const net = require('net')

class ITachIP2SLDevice extends ITachDevice {
  onInit () {
    super.onInit()
    this._port = 4998
    this._serialPortBase = 4999
  }

  async onAutoCompleteSerialCmd (query, args) {
    var mapping = super.getJsonConfig('serial')
    const cmds = mapping.cmds.map(code => code.name)
    const res = cmds.map(v => { return { 'name': v } })
    return res
  }

  async executeCommand (args) {
    var mapping = super.getJsonConfig('serial')
    const cmdName = args.serialcmd.name
    const connectorAddress = args.connectoraddress.name

    const header = []
    header.push('set_SERIAL')
    header.push(connectorAddress.replace('module ', '').replace(' : port ', ':'))
    header.push(mapping.baudrate)
    header.push(mapping.flowcontrol)
    header.push(mapping.parity)
    const serialConfig = header.join()

    const cmd = mapping.cmds.find(cmd => cmd.name === cmdName)
    this._sendSerial(connectorAddress, serialConfig, cmd.value)
  }

  _sendSerial (connectorAddress, serialConfig, payload) {
    const configClient = new net.Socket()
    configClient.setTimeout(10000)

    configClient.connect(this._port, this._deviceData.ip, () => {
      configClient.end(serialConfig + '\r')
    })

    configClient.on('close', () => {
      configClient.destroy()
    })

    configClient.on('timeout', () => {
      configClient.destroy()
    })

    const self = this
    configClient.on('data', (data) => {
      configClient.destroy()

      const payloadClient = new net.Socket()

      const [ , connectorLocation ] = connectorAddress.split(':')
      const ix = parseInt(connectorLocation) - 1
      const serialPort = this._serialPortBase + ix

      payloadClient.connect(serialPort, self._deviceData.ip, () => {
        payloadClient.end(payload)
      })

      payloadClient.on('data', (data) => {
        payloadClient.destroy()
      })

      payloadClient.on('close', () => {
        payloadClient.destroy()
      })
    })
  }
}

module.exports = ITachIP2SLDevice
