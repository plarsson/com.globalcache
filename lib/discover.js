const dgram = require('dgram')
const events = require('events')

const MULTICAST_IP = '239.255.250.250'
const PORT = 9131
const RE_UUID = /<-UUID=([^>]+)/
const RE_MODEL = /<-Model=([^>]+)/
const RE_URL = /<-Config-URL=([^>]+)/
const GC_100_RE_URL = /<Config-URL=([^>]+)/

class Discover extends events.EventEmitter {
  constructor() {
    super()
    this._devices = {}
    this.start()
  }

  _extractInfo(regex, msg) {
    const result = regex.exec(msg)
    if (result !== null && result.length > 1) {
      return result[1]
    }
    return undefined
  }

  _onServerListening() {
    this._server.addMembership(MULTICAST_IP)
  }

  _onServerMessage(msg, rinfo) {
    const uuid = this._extractInfo(RE_UUID, msg)
    const name = this._extractInfo(RE_MODEL, msg)
    let url = this._extractInfo(RE_URL, msg)
    if (!url) {
      url = this._extractInfo(GC_100_RE_URL, msg)
    }

    if (!uuid || !name || !url) {
      console.log('Invalid (not supported) beacon msg', msg.toString())
      return
    }

    const ip = url.replace(/(^\w+:|^)\/\//, '')
    const deviceData = { uuid, name, url, ip }
    if (this._devices[deviceData.uuid]) {
      return this.emit('rediscover', this._devices[deviceData.uuid])
    }
    this._devices[deviceData.uuid] = deviceData
    this.emit('device', this._devices[deviceData.uuid])
  }

  _onServerError(err) {
    console.log(err)
    this._server.close()
  }

  start() {
    this._server = dgram.createSocket('udp4')
    this._server
      .on('listening', this._onServerListening.bind(this))
      .on('message', this._onServerMessage.bind(this))
      .on('error', this._onServerError.bind(this))
      .bind(PORT)
  }

  stop() {
    this._server.close()
  }

  getDevices() {
    return this._devices
  }
}

module.exports = new Discover()
