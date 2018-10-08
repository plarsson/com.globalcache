'use strict'

const Homey = require('homey')

class GlobalCache extends Homey.App {
  onInit () {
    this.log('init')
  }
}

module.exports = GlobalCache
