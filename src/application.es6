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
class ChildOneOne extends React.Component {
  render() {
    return (
      <div className="childOneOne">
        <ChildTwo />
      </div>
    )
  }
}

@MrCss.decorate
class ChildOneTwo extends React.Component {
  style() {
    return {
      childSelectors: {
        "i": { fontSize: 48 }
      }
    }
  }

  render() {
    return (
      <div className="childOneTwo">
        <ChildTwo />
      </div>
    )
  }
}

@MrCss.decorate
class Root extends React.Component {
  style() {
    return {
      color: 'green',
      childSelectors: {
        "span i": {
          color: 'red'
        },

        "p i": {
          color: 'blue'
        },

        "ChildOneOne": {
          background: 'purple'
        },
      }
    }
  }

  render() {
    return (
      <div className="root">
        <ChildOneOne />
        <ChildOneTwo />
      </div>
    )
  }
}

ReactDOM.render(
  React.createElement(Root, {}),
  document.getElementById('main')
)
