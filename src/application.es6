import React    from 'react'
import ReactDOM from 'react-dom'
import I        from 'immutable'

// TODO
// ----
// * When an element gets rendered, update all of its child components with its styles as their "parent" styles.
// * When an element gets rendered, merge in the local styles to the "parent styles".
// * Keep track of the current position through the rendering tree.
// * Add child selectors, which make use of the current position in the tree.

class MrCss {
  static isDecoratedByMrCss(element) {
    if (!element.type) return false
    return element.type._isDecoratedByMrCss
  }

  static flattenChildren(element) {
    if (element.props.children && element.props.children.map) {
      return element.props.children
    } else if (element.props.children) {
      return [element.props.children]
    } else {
      return []
    }
  }

  static manuallyApplyStyles(element) {
    return element
  }

  static recursivelyApplyStyles(element) {
    if (MrCss.isDecoratedByMrCss(element) || !element.props) {
      return element
    } else {
      return MrCss.applyStyles(element)
    }
  }

  static applyStyles(element, mrCssStyles=[]) {
    const children                 = MrCss.flattenChildren(element).map(MrCss.recursivelyApplyStyles)
    const stylesFromStyleAttribute = I.fromJS(element.props.style || {})
    const calculatedStyles = I.fromJS(mrCssStyles).reduce((acc, newStyle) => acc.merge(newStyle), stylesFromStyleAttribute).toJS()
    return React.cloneElement(element, { children, style: calculatedStyles })
  }

  static decorate(target) {
    const originalRender       = target.prototype.render
    target._isDecoratedByMrCss = true

    target.prototype.render = function() {
      const originalElement = originalRender.bind(this)()

      if (this.getStyles && typeof this.getStyles !== 'function') {
        throw new Error(`The getStyles property of ${target.name} is not a function, which it should be for it to work with MrCss.`)
      }

      const styles = this.getStyles ? this.getStyles() : []

      if (!Array.isArray(styles)) {
        throw new Error(`The getStyles property of ${target.name} does not return an array, which it ought to.`)
      }

      return MrCss.applyStyles(originalElement, styles)
    }
  }
}


@MrCss.decorate
class ChildTwo extends React.Component {
  getStyles() {
    return [{ color: 'green' }]
  }

  render() {
    return (
      <p className="childTwo">
        <i>hello</i>
      </p>
    )
  }
}

@MrCss.decorate
class ChildOne extends React.Component {
  render() {
    return (
      <div className="childOne">
        <ChildTwo />
      </div>
    )
  }
}

@MrCss.decorate
class Root extends React.Component {
  render() {
    return (
      <div className="root">
        <ChildOne />
      </div>
    )
  }
}

ReactDOM.render(
  React.createElement(Root, {}),
  document.getElementById('main')
)
