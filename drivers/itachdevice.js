const Homey = require('homey')
var net = require('net')

// https://www.globalcache.com/files/docs/API-iTach.pdf

class ITachDevice extends Homey.Device {
  onInit () {
    this.log('device init')
    this.log('name:', this.getName())
    this.log('class:', this.getClass())
    this._deviceData = null
    this._moduleAddresses = null

  }

  onAdded () {
    this.log('device added')
  }

  onDeleted () {
    this.log('device deleted')
  }

  async onAutoCompleteConnectorAddress (query, args) {
    const res = this._moduleAddresses.map(v => { return { 'name': v } })
    return res
  }

  refresh (supportedModuleType, deviceData) {
    this._deviceData = deviceData
    // console.log('deviceData refreshed', this._deviceData)
    if (!this._moduleAddresses) {
      this._getModuleAddresses(supportedModuleType)
    }
  }

  _getModuleAddresses (moduleName) {
    const self = this
    const client = new net.Socket()
    client.connect(this._port, this._deviceData.ip, function () {
      client.write('getdevices' + '\r')
    })

    client.on('data', function (data) {
      const lines = data.toString().split('\r')
      const modules = lines.reduce((acc, line) => {
        const [spec, name] = line.split(' ')
        if (name) {
          const [, moduleNumber, count] = spec.split(',')
          acc.push({ name, moduleNumber, count })
        }
        return acc
      }, [])

      const irModule = modules.find(module => module.name === moduleName)
      if (!irModule) {
        throw new Error('No ' + moduleName + ' module(s) found on this device')
      }
      const res = []
      const moduleNumber = parseInt(irModule.moduleNumber)
      const count = parseInt(irModule.count)
      for (let i = 1; i <= count; i++) {
        res.push(moduleNumber + ':' + i)
      }
      self._moduleAddresses = res
      client.destroy()
    })
  }
}

module.exports = ITachDevice
