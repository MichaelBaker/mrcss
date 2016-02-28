import Immutable from 'immutable'

const I         = Immutable.fromJS
const EmptyMap  = I({})
const EmptyList = I([])

export default class Selector {
  static makePath(selector) {
    return I(selector).push('_values')
  }

  static findLoop(trees, path, originalPath) {
    if (path.size  == 0) return EmptyList
    if (trees.size == 0) return EmptyList

    const nodeList = path.take(1).flatten()

    const values = nodeList.flatMap((node) => {
      if (!node) throw new Error(`Node with a value of ${JSON.stringify(node)} was found in call to Selector.find. Path was ${JSON.stringify(originalPath)}`)

      return trees.flatMap((tree) => {
        return tree.getIn([node, '_values'], EmptyList)
      })
    })

    const newTrees = nodeList.flatMap((node) => {
      return trees.map(tree => tree.get(node)).filter(x => x)
    })

    return values.concat(Selector.findLoop(newTrees, path.rest(), originalPath))
  }

  constructor(selectorTree = I({})) {
    this.selectorTree = selectorTree
  }

  add(selector, value) {
    const path    = Selector.makePath(I(selector).reverse())
    const newTree = this.selectorTree.updateIn(path, I([]), o => o.push(value))
    return new Selector(newTree)
  }

  find(selector) {
    const tags = I(selector).reverse()
    return Selector.findLoop(I([this.selectorTree]), tags, selector).toJS()
  }
}
