import React     from 'react'
import Immutable from 'immutable'
import Selector  from 'selector.es6'
import sha1      from 'sha1'
import clsnm     from 'classnames'

const I         = Immutable.fromJS
const EmptyMap  = I({})
const EmptyList = I([])

export default class MrCss {
  static render() {
    const originalElement = this._mrCssOriginalRender()

    const component       = this.constructor.name
    const elementTag      = originalElement.type

    const parentPath      = this.props._mrCssParentPath || EmptyList
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
    const myStyles         = parentSelectors.find(path).push(immutStyles.delete('childSelectors'))
    const styleProps       = MrCss.styleProps(originalElement, EmptyList.push(originalElement).push(this), myStyles)

    const newChildren = React.Children.map(originalElement.props.children, (c) => {
      return MrCss.styleChildren(c, path, newSelectors)
    })

    return React.cloneElement(originalElement, {
        ...styleProps,
        _mrCssPath: path,
    }, newChildren)
  }

  static styleChildren(element, path, selector) {
    if (!element.type)                return element
    if (element._mrCssOriginalRender) return React.cloneElement(element, { _mrCssParentSelectors: selector, _mrCssParentPath: path })

    const children       = (element.props && element.props.children) || []
    const elementTag     = element.type
    const newPath        = path.push(elementTag)
    const newChildren    = React.Children.map(children, (c) => MrCss.styleChildren(c, newPath, selector))
    const styleProps     = MrCss.styleProps(element, EmptyList.push(element), selector.find(newPath))

    return React.cloneElement(element, {
        ...styleProps,
        _mrCssParentSelectors: selector,
        _mrCssParentPath:      path,
    }, newChildren)
  }

  static styleProps(element, synonymousElements, styles) {
    const computedStyles = MrCss.mergeStyles(synonymousElements, styles)
    const oldStyle       = element.props.style || {}
    const style          = { ...oldStyle, ...computedStyles.get('styles').toJS() }
    const oldClassNames  = element.props.className
    const className      = clsnm(oldClassNames, computedStyles.get('classNames').toJS())

    return { style, className }
  }

  static mergeStyles(elements, styles) {
    return styles.reduce((acc, style) => {
      const predicate  = style.get('predicate')
      const compute    = style.get('compute')
      const onlyStyles = style.delete('predicate').delete('compute')
      const matches    = !predicate || elements.some(predicate)

      if (matches) {
        const computedStyles = (compute && elements.map(compute)) || EmptyList
        const allStyles      = computedStyles.push(onlyStyles).filter(x => x).map(x => I(x))
        const literals       = allStyles.map(s => s.get('literalCSS')).filter(x => x)
        const objects        = allStyles.map(s => s.delete('literalCSS'))

        const newStyles     = objects.reduce((acc2, x) => acc2.merge(x), acc.get('styles'))
        const newClassNames = acc.get('classNames').concat(literals.map(MrCss.installCss))

        return acc.set('styles', newStyles).set('classNames', newClassNames)
      } else {
        return acc
      }
    }, I({ styles: {}, classNames: [] }))
  }

  static installCss(styleSheet) {
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

  static objectToSelectors(oldSelectors, object) {
    if (!object) return oldSelectors
    return I(object).reduce((acc, value, selector) => {
      const selectorArray = selector.split(' ')
      return acc.add(selectorArray, value)
    }, oldSelectors)
  }
}

