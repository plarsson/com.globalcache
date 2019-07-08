const ITachIP2IRDriver = require('../ip2ir/driver')

class iTachFlexEthernetDriver extends ITachIP2IRDriver {
  isSupported(iTachDeviceName) {
    return iTachDeviceName === 'iTachFlexEthernet'
  }

  multiChannelDevices() {
    return [{name: 'IRTRIPORT', channels: 3},{name:'IRTRIPORT_BLASTER', channels: 3}]
  }
  supportedModuleTypes() {
    return ['IR','IR_BLASTER','IRTRIPORT','IRTRIPORT_BLASTER','SERIAL','RELAYSENSOR','SENSOR','SENSOR_NOTIFY']
  }
}
module.exports = iTachFlexEthernetDriver
