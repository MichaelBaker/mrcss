import React    from 'react'
import ReactDOM from 'react-dom'
import I        from 'immutable'

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
    return React.cloneElement(element, { style: {background: 'red'} })
  }

  static recursivelyApplyStyles(element) {
    if (MrCss.isDecoratedByMrCss(element) || !element.props) {
      return element
    } else {
      return MrCss.applyStyles(element)
    }
  }

  static applyStyles(element) {
    const children     = MrCss.flattenChildren(element).map(MrCss.recursivelyApplyStyles)
    const currentStyle = element.props.style || {}
    return React.cloneElement(element, { children, style: { ...currentStyle, background: 'red' } })
  }

  static decorate(target) {
    const originalRender       = target.prototype.render
    target._isDecoratedByMrCss = true

    target.prototype.render = function() {
      const originalElement = originalRender.bind(this)()
      return MrCss.applyStyles(originalElement)
    }
  }
}


@MrCss.decorate
class ChildTwo extends React.Component {
  render() {
    return (
      <div className="childTwo">
        hello
      </div>
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
