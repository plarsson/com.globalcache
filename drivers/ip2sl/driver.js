const Homey = require('homey')
const ITachDriver = require('../itachdriver')

class ITachIP2SLDriver extends ITachDriver {
  onInit () {
    super.onInit()

    this.actionSendCmd = new Homey.FlowCardAction('send_serial_command')
    this.actionSendCmd
      .register()
      .registerRunListener(this._executeCommand.bind(this))
      .getArgument('connectoraddress')
      .registerAutocompleteListener((query, args) => { return args.device.onAutoCompleteConnectorAddress(query, args) })

    this.actionSendCmd
      .register()
      .registerRunListener(this._executeCommand.bind(this))
      .getArgument('serialcmd')
      .registerAutocompleteListener((query, args) => { return args.device.onAutoCompleteSerialCmd(query, args) })
  }

  supportedModuleType () {
    return 'SERIAL'
  }

  isSupported (iTachDeviceName) {
    return iTachDeviceName === 'iTachIP2SL' || iTachDeviceName === 'GC-100-06' || iTachDeviceName === 'GC-100-12'
  }
}

module.exports = ITachIP2SLDriver
