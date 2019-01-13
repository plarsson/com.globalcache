const Homey = require('homey')

module.exports = [
  {
    method: 'GET',
    path: '/config',
    public: true,
    fn: async (args, callback) => {
      try {
        const val = await Homey.ManagerSettings.get('mapping')
        const result = JSON.parse(val)
        callback(null, result)
      } catch (err) {
        callback(err, null)
      }
    }
  },
  {
    method: 'POST',
    path: '/config',
    public: true,
    fn: async (args, callback) => {
      try {
        const val = JSON.stringify(args.body, null, 2)
        Homey.ManagerSettings.set('mapping', val)
        callback(null, {})
      } catch (err) {
        callback(err, null)
      }
    }
  }

]
