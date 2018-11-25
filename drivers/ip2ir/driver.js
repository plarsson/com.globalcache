
const Homey = require('homey')
const ITachDriver = require('../itachdriver')

class ITachIP2IRDriver extends ITachDriver {
  onInit () {
    super.onInit()

    this.actionSendCmd = new Homey.FlowCardAction('send_ir_command')
    this.actionSendCmd
      .register()
      .registerRunListener(this._executeCommand.bind(this))
      .getArgument('connectoraddress')
      .registerAutocompleteListener((query, args) => { return args.device.onAutoCompleteConnectorAddress(query, args) })

    this.actionSendCmd
      .register()
      .registerRunListener(this._executeCommand.bind(this))
      .getArgument('irdevice')
      .registerAutocompleteListener((query, args) => { return args.device.onAutoCompleteIrDevice(query, args) })
    this.actionSendCmd
      .register()
      .registerRunListener(this._executeCommand.bind(this))
      .getArgument('irfunction')
      .registerAutocompleteListener((query, args) => { return args.device.onAutoCompleteIrFunction(query, args) })
  }

  supportedModuleType () {
    return 'IR'
  }

  isSupported (iTachDeviceName) {
    return iTachDeviceName === 'iTachIP2IR' || iTachDeviceName === 'GC-100-12' || iTachDeviceName === 'GC-100-06' ||
      iTachDeviceName === 'iTachFlexEthernet'
  }
}

module.exports = ITachIP2IRDriver
