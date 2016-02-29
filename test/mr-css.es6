import assert   from 'assert'
import MrCss    from 'mr-css.es6'
import Selector from 'selector.es6'

function assertSame(a, b) {
  return assert.equal(JSON.stringify(a),   JSON.stringify(b))
}

describe('MrCss', () => {
  describe('addSelectors', () => {
    it('parses and adds styles to the given selector', () => {
      const style1   = { background: 'red' }
      const style2   = { color:      'blue' }
      const selector = MrCss.addSelectors(new Selector(), {
        'i div Wat': style1,
        'p span':    style2,
      })
      assertSame(selector.find(['i', 'div', 'Wat']),      [style1])
      assertSame(selector.find(['p', 'i', 'div', 'Wat']), [style1])
      assertSame(selector.find(['p', 'span']),            [style2])
    })
  })
})
