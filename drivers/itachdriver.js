const Homey = require('homey')
const discover = require('../../lib/discover')

class ITachDriver extends Homey.Driver {
  onInit() {
    this.log('ITachDriver onInit called')
    this._discover = discover
      .on('device', this._onDiscoverDevice.bind(this))
      .on('rediscover', this._onDiscoverDevice.bind(this))
  }

  // overide by subclass
  isSupported(itachDeviceName) {
    return false
  }

  // overide by subclass
  supportedModuleTypes() {
    return ['']
  }

  // overide by subclass
  multiChannelDevices() {
    return []
  }

  _onDiscoverDevice(deviceData) {
    if (this.isSupported(deviceData.name)) {
      //this.log('Device found:', deviceData.name, '@', deviceData.url, ' ', deviceData.uuid)

      let homeyDevice = this.getDevice({
        id: deviceData.uuid
      })
      
      if (homeyDevice instanceof Homey.Device) {
        homeyDevice.refresh(this.supportedModuleTypes(), deviceData, this.multiChannelDevices())
      }
    }
  }

  _executeCommand(args, state) {
    return args.device.executeCommand(args)
  }

  onPair(socket) {
    this.log('onPair called')
    socket.on('list_devices', (data, callback) => {
      const devicesObj = this._discover.getDevices()
      this.log(`Devices found ${devicesObj.length}`)
      if (devicesObj.length === 0) {
        return callback(new Error(Homey.__('pair_none_found')))
      }

      let devicesArr = []

      for (let id in devicesObj) {
        let device = devicesObj[id]

        if (this.isSupported(device.name)) {
          devicesArr.push({
            data: {
              id: device.uuid
            },
            name: device.name + ` (${device.ip})`
          })
        }
      }

      if (devicesArr.length === 0) {
        return callback(new Error(Homey.__('pair_none_found')))
      }

      callback(null, devicesArr)
    })
  }
}

module.exports = ITachDriver
