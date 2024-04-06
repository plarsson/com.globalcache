const { Driver } = require('homey');
const ITachDriver = require('../itachdriver');

class ITachIP2IRDriver extends ITachDriver {
  async onInit() {
    super.onInit();

    this.actionSendCmd = this.homey.flow.getActionCard('send_ir_command');

    this.actionSendCmd.registerRunListener(async (args, state) => {
      return this._executeCommand(args, state);
    });

    this.actionSendCmd.getArgument('connectoraddress').registerAutocompleteListener(async (query, args) => {
      return args.device.onAutoCompleteConnectorAddress(query, args);
    });

    this.actionSendCmd.getArgument('irdevice').registerAutocompleteListener(async (query, args) => {
      return args.device.onAutoCompleteIrDevice(query, args);
    });

    this.actionSendCmd.getArgument('irfunction').registerAutocompleteListener(async (query, args) => {
      return args.device.onAutoCompleteIrFunction(query, args);
    });
  }

  supportedModuleTypes() {
    return ['IR'];
  }

  isSupported(iTachDeviceName) {
    return iTachDeviceName === 'iTachIP2IR' || iTachDeviceName === 'GC-100-12' || iTachDeviceName === 'GC-100-06';
  }
}

module.exports = ITachIP2IRDriver;
