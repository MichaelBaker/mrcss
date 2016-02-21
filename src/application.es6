import React    from 'react'
import ReactDOM from 'react-dom'

class MrCss {
  static shouldManuallyApplyStyles(element) {
    if (!element.type)                     return true
    if (!element.type._isDecoratedByMrCss) return true
    return false
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

  static decorate(target) {
    const originalRender = target.prototype.render

    target._isDecoratedByMrCss = true

    const newRender = function() {
      const originalElement = originalRender.bind(this)()
      const children        = MrCss.flattenChildren(originalElement)

      children.map((c) => {
        console.log((c.type && c.type.name) || c)
        console.log(MrCss.shouldManuallyApplyStyles(c))
        console.log("")
      })

      return originalElement
    }
    target.prototype.render = newRender
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
