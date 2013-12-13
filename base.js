
module.exports = BaseManager

function BaseManager() {
  this._pending = {}
  this._map = {}
  this._on = {}
  for (var i=0; i<this.models.length; i++) {
    this._pending[this.models[i]] = {}
    this._map[this.models[i]] = {}
    this._on[this.models[i]] = {}
  }
}

BaseManager.prototype = {
  models: [],
  on: function (model, id, handler) {
    if (!this._on[model][id]) {
      this._on[model][id] = []
    }
    this._on[model][id].push(handler)
    if (this._map[model][id]) return handler(this._map[model][id])
    if (this._pending[model][id]) return
    this.fetch(model, id)
  },
  off: function (model, id, handler) {
    if (!this._on[model][id]) return false
    var idx = this._on[model][id].indexOf(handler)
    if (idx === -1) return false
    this._on[model][id].splice(idx, 1)
    return true
  },
  set: function (model, id, data) {
    this.setters[model].call(this, id, data, function (err, data) {
      this.got(model, id, data)
    }.bind(this))
  },
  fetch: function (model, id) {
    this._pending[model][id] = true
    this.getters[model].call(this, id, function (err, data) {
      this._pending[model][id] = false
      if (err) return this.handleError(err, model, id)
      this.got(model, id, data)
    }.bind(this))
  },
  got: function (model, id, data) {
    this._map[model][id] = data
    if (!this._on[model][id]) return
    for (var i=0; i<this._on[model][id].length; i++) {
      this._on[model][id][i](data)
    }
  },
  handleError: function (err, model, id) {
    console.error('Failed to fetch', model, id, err, err.message)
  }
}


