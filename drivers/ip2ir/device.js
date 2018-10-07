const ITachDevice = require('../itachdevice')
const net = require('net')

class ITachIP2IRDevice extends ITachDevice {
  onInit () {
    super.onInit()
    this._port = 4998
  }

  async onAutoCompleteIrDevice (query, args) {
    var mapping = super.getJsonConfig('ir')

    const devices = mapping.devices.map(device => device.device)
    const res = devices.map(v => { return { 'name': v } })
    return res
  }

  async onAutoCompleteIrFunction (query, args) {
    var mapping = super.getJsonConfig('ir')

    const selectedDevice = args.irdevice
    const irDevice = mapping.devices.find(device => device.device === selectedDevice.name)
    const irFunctions = irDevice.codes.map(code => code.name)
    const res = irFunctions.map(v => { return { 'name': v } })
    return res
  }

  async executeCommand (args) {
    var mapping = super.getJsonConfig('ir')

    const irDeviceName = args.irdevice.name
    const irFunctionName = args.irfunction.name
    const connectorAddress = args.connectoraddress.name

    const irDevice = mapping.devices.find(device => device.device === irDeviceName)
    const irCode = irDevice.codes.find(code => code.name === irFunctionName)
    await this._sendProntoCode(connectorAddress, irCode.value)
  }

  async _sendProntoCode (connectorAddress, prontoString) {

    function sleep (ms = 0) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }

    const regex = /^\s*[0-9A-F]{4}\s+([0-9A-F]{4})\s+[0-9A-F]{4}\s+[0-9A-F]{4}\s+(.+)/gm
    const [, rate, pronto] = regex.exec(prontoString) || []

    if (!rate || !pronto) {
      throw new Error('Invalid pronto code')
    }

    const PRONTO_PWM_HZ = 4145152 // a constant measured in Hz and is the PWM frequencyof Philip's Pronto remotes
    const iTachRate = Math.floor(PRONTO_PWM_HZ / parseInt(rate, 16))

    const header = []
    header.push('sendir')
    header.push(connectorAddress)
    header.push('1') // id (job id)
    header.push(iTachRate)
    header.push(1)
    header.push(1)

    const prontoCodes = pronto.split(' ')
    const gc100Codes = prontoCodes.map(c => parseInt(c, 16))
    const data = header.concat(gc100Codes)
    const dataStr = data.join()

    const self = this

    const client = new net.Socket()
    client.connect(this._port, this._deviceData.ip, () => {
      client.write(dataStr + '\r')
    })

    client.on('close', () => {
      client.destroy()
    })

    client.on('data', async (data) => {
      const dataStr = data.toString()
      if (dataStr.startsWith('busyIR')) {
        await sleep(100)
        self._sendProntoCode(connectorAddress, prontoString)
      }
      client.destroy()
    })
  }
}

module.exports = ITachIP2IRDevice
