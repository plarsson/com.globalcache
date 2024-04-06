const { Driver } = require('homey');
const ITachDriver = require('../itachdriver');

class ITachIP2CCDriver extends ITachDriver {
  async onInit() {
    super.onInit();

    this.actionSendCmd = this.homey.flow.getActionCard('send_relay_command');
    this.actionSendCmdWithDuration = this.homey.flow.getActionCard('send_relay_command_with_duration');

    this.actionSendCmd.registerRunListener(async (args, state) => {
      return this._executeCommand(args, state);
    });

    this.actionSendCmd.getArgument('connectoraddress').registerAutocompleteListener(async (query, args) => {
      return args.device.onAutoCompleteConnectorAddress(query, args);
    });

    this.actionSendCmd.getArgument('outputstate').registerAutocompleteListener(async (query, args) => {
      return args.device.onAutoCompleteOutputState(query, args);
    });

    this.actionSendCmdWithDuration.registerRunListener(async (args, state) => {
      return this._executeCommand(args, state);
    });

    this.actionSendCmdWithDuration.getArgument('connectoraddress').registerAutocompleteListener(async (query, args) => {
      return args.device.onAutoCompleteConnectorAddress(query, args);
    });

    this.actionSendCmdWithDuration.getArgument('outputstate').registerAutocompleteListener(async (query, args) => {
      return args.device.onAutoCompleteOutputState(query, args);
    });
  }

  supportedModuleTypes() {
    return ['RELAY'];
  }

  isSupported(iTachDeviceName) {
    return iTachDeviceName === 'iTachIP2CC' || iTachDeviceName === 'GC-100-12' || iTachDeviceName === 'iTachFlexEthernet';
  }
}

module.exports = ITachIP2CCDriver;
