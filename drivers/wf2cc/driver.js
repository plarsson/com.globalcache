const ITachIP2CCDriver = require('../ip2cc/driver')

class ITachWF2CCDriver extends ITachIP2CCDriver {
  isSupported (iTachDeviceName) {
    return iTachDeviceName === 'iTachWF2CC'
  }
}

module.exports = ITachWF2CCDriver
