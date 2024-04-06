'use strict'
const Homey = require('homey')
var net = require('net')

// https://www.globalcache.com/files/docs/API-iTach.pdf

class ITachDevice extends Homey.Device {
  onInit() {
    this.log('device init')
    this.log('name:', this.getName())
    this.log('class:', this.getClass())
    this._deviceData = null
    this._moduleAddresses = null
  }

  onAdded() {
    this.log('device added')
  }

  onDeleted() {
    this.log('device deleted')
  }

  async onAutoCompleteConnectorAddress(query, args) {
    const res = this._moduleAddresses.map(v => { return { 'name': v } })
    return res
  }

  refresh(supportedModuleTypes, deviceData, multiChannelDevices) {
    this._deviceData = deviceData
    if (!this._moduleAddresses) {
      this._getModuleAddresses(supportedModuleTypes, multiChannelDevices)
    }
  }

  getJsonConfig(section) {
    var json = this.homey.settings.get('mapping')

    if (!json) {
      return []
    }
    const mapping = JSON.parse(json)
    return mapping[section]
  }

  _getModuleAddresses(moduleNames, multiChannelDevices) {
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
      const foundModules = modules.filter(module => module != undefined && moduleNames.includes(module.name));

      if (!foundModules) {
        throw new Error(`None of the specified module(s) (${moduleNames.join(', ')}) were found on this device`)
      }
      const res = []
      foundModules.forEach(foundModule => {
        const moduleNumber = parseInt(foundModule.moduleNumber)
        const count = multiChannelDevices !== undefined && multiChannelDevices.map(device => device.name).includes(foundModule.name)
          ? multiChannelDevices.filter(device => device.name === foundModule.name)[0].channels
          : parseInt(foundModule.count)

        for (let i = 1; i <= count; i++) {
          res.push(`module ${moduleNumber} : port ${i}`)
        }
      })
      self._moduleAddresses = res
      client.destroy()
    })
  }
}

module.exports = ITachDevice
