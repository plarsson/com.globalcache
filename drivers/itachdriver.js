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

      try {
        let homeyDevice = this.getDevice({
          id: deviceData.uuid
        })
        
        if (homeyDevice instanceof Homey.Device) {
          homeyDevice.refresh(this.supportedModuleTypes(), deviceData, this.multiChannelDevices())
        }
      } catch (error) {
        // ignore
      }
    }
  }

  _executeCommand(args, state) {
    return args.device.executeCommand(args)
  }

  onPair(session) {
    this.log('onPair called')
    session.setHandler('list_devices', async () => {
      const devicesObj = this._discover.getDevices();
      this.log(`Devices found ${devicesObj.length}`);
  
      if (devicesObj.length === 0) {
        throw new Error(this.homey.__('pair_none_found'));
      }
  
      let devicesArr = [];
  
      for (let id in devicesObj) {
        let device = devicesObj[id];
  
        if (this.isSupported(device.name)) {
          devicesArr.push({
            data: {
              id: device.uuid,
            },
            name: `${device.name} (${device.ip})`,
          });
        }
      }
  
      if (devicesArr.length === 0) {
        throw new Error(this.homey.__('pair_none_found'));
      }
  
      return devicesArr;
    });
  }
}

module.exports = ITachDriver
