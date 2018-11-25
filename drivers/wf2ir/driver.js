const ITachIP2IRDriver = require('../ip2ir/driver')

class ITachWF2IRDriver extends ITachIP2IRDriver {
  isSupported (iTachDeviceName) {
    return iTachDeviceName === 'iTachWF2IR' || iTachDeviceName === 'iTachFlexWiFi'
  }
}

module.exports = ITachWF2IRDriver
