import React      from 'react'
import Immutable  from 'immutable'
import Selector   from 'selector.es6'
import * as MrCss from 'mr-css.es6'

const I         = Immutable.fromJS
const EmptyList = I([])

export default function MrCssDecorator(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      const originalElement = WrappedComponent.prototype.render.bind(this)()

      const component       = this.constructor.name
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
      const immutStyles      = I(styles || {})
      const newSelectors     = MrCss.addSelectors(parentSelectors, immutStyles.get('childSelectors'))
      const myStyles         = parentSelectors.find(path).push(immutStyles.delete('childSelectors'))
      const props            = MrCss.styleProps(originalElement, EmptyList.push(originalElement).push(this), myStyles)

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
  const elementTag     = element.type
  const newPath        = path.push(elementTag)
  const newChildren    = React.Children.map(children, (c) => styleChildren(c, newPath, selector))
  const props          = MrCss.styleProps(element, EmptyList.push(element), selector.find(newPath))

  return React.cloneElement(element, {
      ...props,
      _mrCssParentSelectors: selector,
      _mrCssParentPath:      path,
  }, newChildren)
}
