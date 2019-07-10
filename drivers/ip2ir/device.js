const ITachDevice = require('../itachdevice')
const net = require('net')
const sem = require('semaphore')(1)

class ITachIP2IRDevice extends ITachDevice {
  onInit() {
    super.onInit()
    this._port = 4998
    this._jobid = 1
  }

  async onAutoCompleteIrDevice(query, args) {
    var mapping = super.getJsonConfig('ir')

    const devices = mapping.devices.map(device => device.device)
    const res = devices.map(v => { return { 'name': v } })
    return res
  }

  async onAutoCompleteIrFunction(query, args) {
    var mapping = super.getJsonConfig('ir')

    const selectedDevice = args.irdevice
    const irDevice = mapping.devices.find(device => device.device === selectedDevice.name)
    const irFunctions = irDevice.codes.map(code => code.name)
    const res = irFunctions.map(v => { return { 'name': v } })
    return res
  }

  async executeCommand(args) {
    var mapping = super.getJsonConfig('ir')

    const irDeviceName = args.irdevice.name
    const irFunctionName = args.irfunction.name
    const connectorAddress = args.connectoraddress.name

    const irDevice = mapping.devices.find(device => device.device === irDeviceName)
    const irCode = irDevice.codes.find(code => code.name === irFunctionName)
    await this._sendProntoCode(connectorAddress, irCode.value, 20)
  }

  async _sendProntoCode(connectorAddress, prontoString, retries = 0) {
    function sleep(ms = 0) {
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
    header.push(connectorAddress.replace('module ', '').replace(' : port ', ':'))
    header.push(this._jobid % 65535) // id (job id)
    header.push(iTachRate)
    header.push(1)
    header.push(1)

    this._jobid = this._jobid + 1

    const prontoCodes = pronto.split(' ')
    const gc100Codes = prontoCodes.map(c => parseInt(c, 16))
    const data = header.concat(gc100Codes)
    const dataStr = data.join()

    const self = this

    const client = new net.Socket()
    client.setTimeout(10000)

    client.connect(this._port, this._deviceData.ip, async () => {
      sem.take(() => {
        client.write(dataStr + '\r')
      })
    })

    client.on('close', () => {
      sem.leave()
      client.destroy()
    })

    client.on('timeout', () => {
      client.destroy()
    })

    client.on('error', () => {
      client.destroy()
    })

    client.on('data', async (data) => {
      const dataStr = data.toString()
      if (dataStr.startsWith('ERR')) {
        console.log('error', dataStr)
      }
      if (dataStr.startsWith('busyIR') && retries > 0) {
        await sleep(100)
        self._sendProntoCode(connectorAddress, prontoString, retries - 1)
      }
      client.destroy()
    })
  }
}

module.exports = ITachIP2IRDevice
