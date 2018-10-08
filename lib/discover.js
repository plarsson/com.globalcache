const dgram = require('dgram')
const events = require('events')

const MULTICAST_IP = '239.255.250.250'
const PORT = 9131
const RE_UUID = /<-UUID=([^>]+)/
const RE_MODEL = /<-Model=([^>]+)/
const RE_URL = /<-Config-URL=([^>]+)/

class Discover extends events.EventEmitter {
  constructor () {
    super()
    this._devices = {}
    this.start()
  }

  _extractInfo (regex, msg) {
    const result = regex.exec(msg)
    if (result !== null && result.length > 1) {
      return result[1]
    }
  }

  _onServerListening () {
    this._server.addMembership(MULTICAST_IP)
  }

  _onServerMessage (msg, rinfo) {
    // console.log(`got: ${msg} from ${rinfo.address}:${rinfo.port}`)
    const uuid = this._extractInfo(RE_UUID, msg)
    const name = this._extractInfo(RE_MODEL, msg)
    const url = this._extractInfo(RE_URL, msg)
    const ip = url.replace(/(^\w+:|^)\/\//, '')

    const deviceData = { uuid, name, url, ip }

    if (this._devices[ deviceData.uuid ]) {
      return this.emit('rediscover', this._devices[ deviceData.uuid ])
    }
    this._devices[ deviceData.uuid ] = deviceData
    this.emit('device', this._devices[ deviceData.uuid ])
  }

  _onServerError (err) {
    console.log(err)
    this._server.close()
  }

  start () {
    this._server = dgram.createSocket('udp4')
    this._server
      .on('listening', this._onServerListening.bind(this))
      .on('message', this._onServerMessage.bind(this))
      .on('error', this._onServerError.bind(this))
      .bind(PORT)
  }

  stop () {
    this._server.close()
  }

  getDevices () {
    return this._devices
  }
}

module.exports = new Discover()
