
var _ = require('lodash')

  , utils = require('./utils')
  , BaseManager = require('./base')

module.exports = Manager

function newId(ln) {
  var chars = 'abcdef01245689'
    , id = ''
  ln = ln || 8
  for (var i=0; i<chars.length; i++) {
    id += chars[parseInt(chars.length * Math.random())]
  }
  return id
}

function Manager(data) {
  BaseManager.call(this)
  if (data) this.dump(data)
}

Manager.prototype = _.extend(BaseManager.prototype, {
  models: ['children', 'data'],
  newNode: function (data, children) {
    var id = newId(16)
    this._map['children'][id] = children || []
    this._map['data'][id] = data || {}
    return id
  },
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

