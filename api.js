const Homey = require('homey')

module.exports = {
  async loadConfig({ homey, query }) {
    const val = await this.homey.settings.get('mapping')
    const result = JSON.parse(val)
    return result;
  },
  async saveConfig({ homey, query }) {
    const val = JSON.stringify(query, null, 2)
    this.homey.settings.set('mapping', val)
    return {}
  }
}