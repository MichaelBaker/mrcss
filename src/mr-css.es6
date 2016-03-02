import React     from 'react'
import Immutable from 'immutable'
import Selector  from 'selector.es6'
import sha1      from 'sha1'
import clsnm     from 'classnames'

const I         = Immutable.fromJS
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
      const literals       = allStyles.map(s => s.get('literalCSS')).filter(x => x)
      const objects        = allStyles.map(s => s.delete('literalCSS'))

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
