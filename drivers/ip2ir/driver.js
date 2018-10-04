const ITachDriver = require('../itachdriver')

class ITachIP2IRDriver extends ITachDriver {
  onInit () {
    super.onInit()
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
    return iTachDeviceName === 'iTachIP2IR' || iTachDeviceName === 'iTachWF2IR'
  }
}

module.exports = ITachIP2IRDriver
