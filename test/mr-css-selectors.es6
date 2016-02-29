import assert   from 'assert'
import Selector from '../src/selector.es6'

function assertSame(a, b) {
  return assert.equal(JSON.stringify(a),   JSON.stringify(b))
}

describe('Selector', () => {
  describe('find', () => {
    it('matches an exact path', () => {
      let path     = ['p', 'a', 'span']
      let selector = new Selector().add(path,  'thingy')
      assertSame(selector.find(path), ['thingy'])
    })

    it('matches a if the selector is a suffix', () => {
      let selector = new Selector().add(['a', 'span'],  'thingy')
      assertSame(selector.find(['div', 'a', 'span']), ['thingy'])
      assertSame(selector.find(['div', 'p', 'a', 'span']), ['thingy'])
    })

    it('returns all relevant values in order from shallowest match to deepest', () => {
      let selector = new Selector().add(['span'], 'thingy')
      selector     = selector.add(['a', 'span'],  'thingy2')
      assertSame(selector.find(['div', 'a', 'span']), ['thingy', 'thingy2'])
    })

    it('matches a node has a proper tag as an option', () => {
      let selector = new Selector().add(['a', 'span'], 'thingy')
      selector     = selector.add(['Hello', 'span'], 'thingy2')
      assertSame(selector.find(['div', ['a', 'Hello'], 'span']),      ['thingy', 'thingy2'])
      assertSame(selector.find(['div', 'p', ['a', 'Hello'], 'span']), ['thingy', 'thingy2'])
    })

    it('matches multi nodes in the order they are specified to find', () => {
      let selector = new Selector().add(['a', 'span'], 'thingy')
      selector     = selector.add(['Hello', 'span'], 'thingy2')
      assertSame(selector.find(['div', ['Hello', 'a'], 'span']), ['thingy2', 'thingy'])
    })

    it('throws an error if any nodes are undefined', () => {
      let selector = new Selector().add(['a', 'span'],  'thingy')
      assert.throws(() => selector.find([undefined, 'a', 'span']), Error)
      assert.throws(() => selector.find(['div', [undefined, 'a'], 'span']), Error)
    })
  })
})
