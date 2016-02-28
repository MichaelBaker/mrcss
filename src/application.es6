// TODO
// ----
// * When an element gets rendered, update all of its child components with its styles as their "parent" styles.
// * When an element gets rendered, merge in the local styles to the "parent styles".
// * Keep track of the current position through the rendering tree.
// * Add child selectors, which make use of the current position in the tree.

// * HANDLE TEXT NODES

import React    from 'react'
import ReactDOM from 'react-dom'
import MrCss    from 'mr-css.es6'

@MrCss.decorate
class ChildTwo extends React.Component {
  render() {
    return (
      <div className="childTwo">
        <span>
          <i>hello</i>
          <b>hello</b>
        </span>
        <p>
          <i>hello</i>
          <b>hello</b>
        </p>
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
  style() {
    return {
      "span i": {
        background: 'red'
      }
    }
  }

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
