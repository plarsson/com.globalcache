const { Driver } = require('homey');
const ITachDriver = require('../itachdriver');

class ITachIP2SLDriver extends ITachDriver {
  async onInit() {
    super.onInit();

    this.actionSendCmd = this.homey.flow.getActionCard('send_serial_command');

    this.actionSendCmd.registerRunListener(async (args, state) => {
      return this._executeCommand(args, state);
    });

    this.actionSendCmd.getArgument('connectoraddress').registerAutocompleteListener(async (query, args) => {
      return args.device.onAutoCompleteConnectorAddress(query, args);
    });

    this.actionSendCmd.getArgument('serialcmd').registerAutocompleteListener(async (query, args) => {
      return args.device.onAutoCompleteSerialCmd(query, args);
    });
  }

  supportedModuleTypes() {
    return ['SERIAL'];
  }

  isSupported(iTachDeviceName) {
    return iTachDeviceName === 'iTachIP2SL' || iTachDeviceName === 'GC-100-06' || iTachDeviceName === 'GC-100-12';
  }
}

module.exports = ITachIP2SLDriver;
