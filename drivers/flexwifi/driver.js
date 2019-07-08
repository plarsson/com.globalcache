const ITachWF2IRDriver = require('../wf2ir/driver')

class iTachFlexWiFiDriver extends ITachWF2IRDriver {
  isSupported(iTachDeviceName) {
    return iTachDeviceName === 'iTachFlexWiFi'
  }

  multiChannelDevices() {
    return [{name: 'IRTRIPORT', channels: 3},{name:'IRTRIPORT_BLASTER', channels: 3}]
  }
  supportedModuleTypes() {
    return ['IR','IR_BLASTER','IRTRIPORT','IRTRIPORT_BLASTER','SERIAL','RELAYSENSOR','SENSOR','SENSOR_NOTIFY']
  }
}
module.exports = iTachFlexWiFiDriver
