import React     from 'react'
import Immutable from 'immutable'
import sha1      from 'sha1'
import clsnm     from 'classnames'

const I         = Immutable.fromJS
const EmptyMap  = I({})
const EmptyList = I([])

export function styleProps(element, synonymousElements, styles) {
  const computedStyles = mergeStyles(synonymousElements, styles)
  const oldStyle       = element.props.style || {}
  const style          = { ...oldStyle, ...computedStyles.get('styles').toJS() }
  const oldClassNames  = element.props.className
  const className      = clsnm(oldClassNames, computedStyles.get('classNames').toJS())

  return { style, className }
}

export function mergeStyles(elements, styles) {
  return styles.reduce((acc, style) => {
    const predicate  = style.get('predicate')
    const compute    = style.get('compute')
    const onlyStyles = style.delete('predicate').delete('compute')
    const matches    = !predicate || elements.some(predicate)

    if (matches) {
      const computedStyles = (compute && elements.map(compute)) || EmptyList
      const allStyles      = computedStyles.push(onlyStyles).filter(x => x).map(x => I(x))
      const literals       = allStyles.flatMap(s => I(s.get('cssLiterals'))).filter(x => x)
      const objects        = allStyles.map(s => s.delete('cssLiterals'))

      const newStyles     = objects.reduce((acc2, x) => acc2.merge(x), acc.get('styles'))
      const newClassNames = acc.get('classNames').concat(literals.map(installCss))

      return acc.set('styles', newStyles).set('classNames', newClassNames)
    } else {
      return acc
    }
  }, I({ styles: {}, classNames: [] }))
}

export function installCss(styleSheet) {
  const className = `_${sha1(styleSheet)}`

  if (!document.getElementById(className)) {
    const gsubedSheet  = styleSheet.replace(/mrCSSTarget/g, `.${className}`)
    const newSheet     = document.createElement('style')
    newSheet.id        = className
    newSheet.className = 'mrCssStyleSheet'

    document.head.appendChild(newSheet)
    newSheet.sheet.insertRule(gsubedSheet, 0)
  }

  return className
}

export function addSelectors(oldSelectors, object) {
  if (!object) return oldSelectors
  return I(object).reduce((acc, value, selector) => {
    const selectorArray = selector.split(' ')
    return acc.add(selectorArray, value)
  }, oldSelectors)
}

export class Selector {
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
    return Selector.findLoop(I([this.selectorTree]), tags, selector)
  }
}

export default function MrCssDecorator(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      const originalElement = WrappedComponent.prototype.render.bind(this)()

      const component       = WrappedComponent.name
      const elementTag      = originalElement.type

      const parentPath      = this.props._mrCssParentPath      || EmptyList
      const parentSelectors = this.props._mrCssParentSelectors || new Selector()

      const path = parentPath.push((() => {
        if (component && elementTag) {
          return I([component, elementTag])
        } else if (component) {
          return component
        } else {
          return elementTag
        }
      })())

      const styles           = this.style && this.style()
      const propStyles       = I(this.props.style || {})
      const immutStyles      = propStyles.merge(I(styles || {}))
      const newSelectors     = addSelectors(parentSelectors, immutStyles.get('childSelectors'))
      const myStyles         = parentSelectors.find(path).push(immutStyles.delete('childSelectors'))
      const props            = styleProps(originalElement, EmptyList.push(originalElement).push(this), myStyles)

      const newChildren = React.Children.map(originalElement.props.children, (c) => {
        return styleChildren(c, path, newSelectors)
      })

      return React.cloneElement(originalElement, {
          ...props,
          _mrCssPath: path,
      }, newChildren)
    }
  }
}

export function styleChildren(element, path, selector) {
  if (!element) { return element }

  // [Verify] This is a non-primitive component with an explicit render method
  if (element.render) {
    const elementWithProps = React.cloneElement(element, {
      _mrCssParentSelectors: selector,
      _mrCssParentPath: path
    })
    return MrCssDecorator(elementWithProps)
  }

  // [Verify] This is a node which doesn't have props or anything, so you cant style it
  if (!element.type) return element

  const children       = (element.props && element.props.children) || []
  const propStyles     = I(element.props.style || {})
  const elementTag     = element.type
  const newPath        = path.push(elementTag)
  const newChildren    = React.Children.map(children, (c) => styleChildren(c, newPath, selector))
  const props          = styleProps(element, EmptyList.push(element), selector.find(newPath).unshift(propStyles))

  if (newChildren.length === 0) {
    return React.cloneElement(element, {
        ...props,
        _mrCssParentSelectors: selector,
        _mrCssParentPath:      path,
    })
  } else {
    return React.cloneElement(element, {
        ...props,
        _mrCssParentSelectors: selector,
        _mrCssParentPath:      path,
    }, newChildren)
  }
}
