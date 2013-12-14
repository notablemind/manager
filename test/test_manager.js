
var expect = require('expect.js')
  , Manager = require('../')

describe('Manager', function () {
  describe('with some listeners', function () {
    var m, full, attr, fc, ac
    beforeEach(function () {
      m = new Manager()
      full = []
      attr = []
      fc = function (data) {
        full.push(data)
      }
      ac = function (data) {
        attr.push(data)
      }
      m.on('2a', fc)
      m.on('2a', 'attr', ac)
      full = []
      attr = []
    })
    it('should call a full listener', function () {
      var data = {some: 'data'}
      m.got('2a', data)
      expect(full).to.eql([data])
    })
    it('should call an attr listener', function () {
      var val = 'the value'
      m.got('2a', {attr: val})
      expect(attr).to.eql([val])
    })
    describe('that were removed', function () {
      beforeEach(function () {
        m.off('2a', fc)
        m.off('2a', 'attr', ac)
        full = []
        attr = []
      })
      it('should not call the listeners', function () {
        m.got('2a', {attr: 'man'})
        expect(full).to.eql([])
        expect(attr).to.eql([])
      })
    })
  })
})

