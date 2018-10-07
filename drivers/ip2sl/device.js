const ITachDevice = require('../itachdevice')
const net = require('net')

class ITachIP2SLDevice extends ITachDevice {
  onInit () {
    super.onInit()
    this._port = 4998
    this._serialPort = 4999
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
    header.push(connectorAddress)
    header.push(mapping.baudrate)
    header.push(mapping.flowcontrol)
    header.push(mapping.parity)
    const serialConfig = header.join()

    const cmd = mapping.cmds.find(cmd => cmd.name === cmdName)
    this._sendSerial(connectorAddress, serialConfig, cmd.value)
  }

  _sendSerial (connectorAddress, serialConfig, payload) {
    const configClient = new net.Socket()
    configClient.connect(this._port, this._deviceData.ip, function () {
      console.log('sending config ' + serialConfig)
      configClient.write(serialConfig + '\r')
    })

    configClient.on('data', function (data) {
      configClient.destroy()

      const payloadClient = new net.Socket()
      // TODO assign serial port according to module pos
      payloadClient.connect(this._serialPort, this._deviceData.ip, function () {
        console.log('sending payload ' + payload)
        payloadClient.write(payload)
      })

      payloadClient.on('data', function (data) {
        payloadClient.destroy()
      })
    })
  }
}

module.exports = ITachIP2SLDevice
