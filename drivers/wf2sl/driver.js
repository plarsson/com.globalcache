const ITachIP2SLDriver = require('../ip2sl/driver')

class ITachWF2SLDriver extends ITachIP2SLDriver {
  isSupported (iTachDeviceName) {
    return iTachDeviceName === 'iTachWF2SL' || iTachDeviceName === 'iTachFlexWiFi'
  }
}

module.exports = ITachWF2SLDriver
