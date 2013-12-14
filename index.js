
module.exports = Manager

function Manager() {
  this._pending = {}
  this._map = {}
  this._on = {}
}

Manager.prototype = {
  defaultNode: {},
  newNode: function (data) {
    var id = this.genId()
    this._map[id] = _.extend({}, data, this.defaultNode)
    return id
  },
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
    this.setter(id, attr, data, function (err, data) {
      this.got(id, data)
    }.bind(this))
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
    this._map[id] = data
    if (!this._on[id]) return
    for (var i=0; i<this._on[id].length; i++) {
      if (Array.isArray(this._on[id][i])) {
        this._on[id][i][0](data[this._on[id][i][1]])
      } else {
        this._on[id][i](data)
      }
    }
  },
  setter: function (id, attr, data, done) {
    if (data === undefined) {
      data = attr
      attr = null
      this._map[id] = data
    } else {
      if (!this._map[id]) this._map[id] = {}
      this._map[id][attr] = data
    }
    done(null, this._map[id])
  },
  getter: function (id, done) {
    done(null, {})
  },
  handleError: function (err, id) {
    console.error('Failed to fetch', id, err, err.message)
  }
}


