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
    const path            = parentPath.push(I([component, elementTag]))

    const currentSelectors = this._mrCssParentSelectors || new Selector()
    const newSelectors     = MrCss.objectToSelectors(currentSelectors, this.style && this.style())

    const newChildren = React.Children.map(originalElement.props.children, (c) => {
      MrCss.styleChildren(c, path, newSelectors)
    })

    return React.cloneElement(originalElement, { _mrCssPath: path }, newChildren)
  }

  static styleChildren(element, path, selectors) {
    if (!element.type)                return element
    if (element._mrCssOriginalRender) return React.cloneElement(element, { _mrCssParentSelectors: selectors, _mrCssParentPath: path })

    const children    = (element.props && element.props.children) || []
    const elementTag  = element.type
    const newPath     = path.push(elementTag)
    const newChildren = React.Children.map(children, (c) => MrCss.styleChildren(c, newPath))

    return React.cloneElement(element, { _mrCssParentSelectors: selectors, _mrCssParentPath: path }, newChildren)
  }

  static objectToSelectors(oldSelectors, object) {
    if (!object) return {}
    return I(object).reduce((acc, value, selector) => {
      const selectorArray = selector.split(' ')
      return oldSelectors.add(selectorArray, value)
    }, oldSelectors)
  }
}

