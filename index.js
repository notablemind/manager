
var _ = require('lodash')

  , utils = require('./utils')
  , BaseManager = require('./base')

module.exports = Manager

function Manager(data) {
  BaseManager.call(this)
  if (data) this.dump(data)
}

Manager.prototype = _.extend(BaseManager.prototype, {
  models: ['children', 'data'],
  dump: function (data) {
    var map = utils.toMap(data)
    for (var id in map) {
      this.got('children', id, map[id].children)
      this.got('data', id, map[id].data)
    }
  },
  getters: {
    children: function (id, done) {
      done(null, [])
    },
    data: function (id, done) {
      done(null, {})
    }
  },
  setters: {
    children: function (id, children, done) {
      done(null, children)
    },
    data: function (id, data, done) {
      done(null, data)
    }
  }
})

