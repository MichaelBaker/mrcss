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
  static decorate(target) {
    target.prototype._mrCssOriginalRender = target.prototype.render
    target.prototype.render               = MrCss.render
  }

  static render() {
    const originalElement = this._mrCssOriginalRender()
    const component       = this.constructor.name
    const elementTag      = originalElement.type || originalElement
    const parentPath      = this.props._mrCssParentPath || I.fromJS([])
    const path            = parentPath.push(I.fromJS({ component, elementTag }))
    const newChildren     = React.Children.map(originalElement.props.children, (c) => {
      return React.cloneElement(c, { _mrCssParentPath: path })
    })

    console.log(`Component:     ${component}`)
    console.log(`Rendered Type: ${elementTag}`)
    console.log(`Path:          ${path}`)
    console.log('')
    return React.cloneElement(originalElement, { _mrCssPath: path }, newChildren)
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
