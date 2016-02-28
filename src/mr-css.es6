import React     from 'react'
import Immutable from 'immutable'
import Selector  from 'selector.es6'

const I = Immutable.fromJS

export default class MrCss {
  static decorate(target) {
    target.prototype._mrCssOriginalRender = target.prototype.render
    target.prototype.render               = MrCss.render
  }

  static render() {
    const originalElement = this._mrCssOriginalRender()

    const component       = this.constructor.name
    const elementTag      = originalElement.type

    const parentPath      = this.props._mrCssParentPath || I([])
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
    const immutStyles      = I(styles || {})
    const newSelectors     = MrCss.objectToSelectors(parentSelectors, immutStyles.get('childSelectors'))
    const myStyles         = immutStyles.delete('childSelectors')
    const finalStyles      = parentSelectors.find(path).reduce((acc, x) => acc.merge(x), myStyles)

    const newChildren = React.Children.map(originalElement.props.children, (c) => {
      return MrCss.styleChildren(c, path, newSelectors)
    })

    return React.cloneElement(originalElement, { style: finalStyles.toJS(), _mrCssPath: path }, newChildren)
  }

  static styleChildren(element, path, selector) {
    if (!element.type)                return element
    if (element._mrCssOriginalRender) return React.cloneElement(element, { _mrCssParentSelectors: selector, _mrCssParentPath: path })

    const children    = (element.props && element.props.children) || []
    const elementTag  = element.type
    const newPath     = path.push(elementTag)
    const newChildren = React.Children.map(children, (c) => MrCss.styleChildren(c, newPath, selector))
    const style       = selector.find(newPath).reduce((acc, x) => acc.merge(x), I({})).toJS()

    return React.cloneElement(element, { style, _mrCssParentSelectors: selector, _mrCssParentPath: path }, newChildren)
  }

  static objectToSelectors(oldSelectors, object) {
    if (!object) return oldSelectors
    return I(object).reduce((acc, value, selector) => {
      const selectorArray = selector.split(' ')
      return acc.add(selectorArray, value)
    }, oldSelectors)
  }
}

