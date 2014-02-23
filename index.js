
var _ = require('lodash')

module.exports = Manager

function Manager(options) {
  this._pending = {}
  this._map = {}
  this._on = {}
  options = options || {}
  if (options.genId) this.genId = options.genId
  if (options.defaultNode) this.defaultNode = options.defaultNode
  if (options.handleError) this.handleError = options.handleError
}

Manager.prototype = {
  // Override these to make an actual backend, not just a cache
  defaultNode: {},
  genId: function () {
    throw new Error('genId must be overridden')
  },
  newNode: function (data) {
    var id = this.genId()
    this._map[id] = _.extend({}, this.defaultNode, data)
    return id
  },
  setAttr: function (id, attr, data, done) {
    if (!this._map[id]) this._map[id] = {}
    this._map[id][attr] = data
    done && done(null, this._map[id])
  },
  setter: function (id, data, done) {
    this._map[id] = data
    done(null, this._map[id])
  },
  getter: function (id, done) {
    done(null, {})
  },
  handleError: function (err, id) {
    console.error('Failed to fetch', id, err, err.message)
  },
  // this stuff is good
  on: function (id, attr, handler) {
    if (handler === undefined) {
      handler = attr
      attr = null
    }
    if (!this._on[id]) {
      this._on[id] = []
    }
    if (attr) {
      this._on[id].push([handler, attr])
    } else {
      this._on[id].push(handler)
    }
    if (this._map[id]) return handler(attr ? this._map[id][attr] : this._map[id])
    if (this._pending[id]) return
    this.fetch(id)
  },
  off: function (id, attr, handler) {
    if (!this._on[id]) return false
    if (handler === undefined) {
      handler = attr
      attr = null
    }
    var idx
    if (!attr) {
      idx = this._on[id].indexOf(handler)
      if (idx === -1) return false
      this._on[id].splice(idx, 1)
      return true
    }
    for (var i=0; i<this._on[id].length; i++) {
      if (this._on[id][i][0] === handler && this._on[id][i][1] === attr) {
        this._on[id].splice(i, 1)
        return true
      }
    }
    return false
  },
  set: function (id, attr, data) {
    // both will return the full object
    var doattr = arguments.length === 3
    var done = function (err, ndata) {
      if (err) return this.handleError(err, id)
      if (doattr) {
        if (_.isEqual(data, ndata[attr])) return
      } else if (_.isEqual(data, ndata)) {
        return
      }
      this.got(id, ndata)
    }.bind(this)
    if (doattr) {
      this.setAttr(id, attr, data, done)
    } else {
      this.setter(id, attr, done)
    }
  },
  fetch: function (id) {
    this._pending[id] = true
    this.getter(id, function (err, data) {
      this._pending[id] = false
      if (err) return this.handleError(err, id)
      this.got(id, data)
    }.bind(this))
  },
  got: function (id, data) {
    if (undefined === data) return console.warn('item not found', id)
    if (this._map[id]) {
      _.extend(this._map[id], data)
      data = _.extend({}, this._map[id])
    } else {
      this._map[id] = data
    }
    if (!this._on[id]) return
    for (var i=0; i<this._on[id].length; i++) {
      if (Array.isArray(this._on[id][i])) {
        this._on[id][i][0](data[this._on[id][i][1]])
      } else {
        this._on[id][i](data)
      }
    }
  },
}


