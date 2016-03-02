import React    from 'react'
import ReactDOM from 'react-dom'
import MrCss    from 'mr-css-decorator.es6'

// TODO: Error with none function predicate
// TODO: Error with none function compute
// TODO: Make sure style insertion works cross-browser
// TODO: Add comments
// TODO: Make this a legit NPM package

@MrCss
class ChildTwo extends React.Component {
  render() {
    return (
      <div mahBorder={this.props.mahBorder} className="childTwo">
        <span>
          <i>hello i</i>
          <b>hello b</b>
        </span>
        <p>
          <i thingy={true}>hello thingy i</i>
          <b>hello b</b>
        </p>
      </div>
    )
  }
}

@MrCss
class ChildOneOne extends React.Component {
  render() {
    return (
      <div className="childOneOne">
        <ChildTwo mahBorder={2} />
      </div>
    )
  }
}

@MrCss
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
        <ChildTwo mahBorder={4} />
      </div>
    )
  }
}

@MrCss
class Root extends React.Component {
  style() {
    return {
      color: 'green',
      cssLiterals: [
        `@media (max-width: 800px) {
          mrCSSTarget {
            background: gold;
          }
        }`,

        `mrCSSTarget:hover {
          background: green
        }`
      ],
      childSelectors: {
        "div": {
          compute: (elem) => {
            if (elem.props.mahBorder) return {
              margin: elem.props.mahBorder * 4,
              border: `${elem.props.mahBorder * elem.props.mahBorder}px solid magenta`
            }
          }
        },

        "i": {
          predicate:  (elem) => elem.props.thingy,
          background: 'yellow'
        },

        "span i": {
          color:     'red',
          cssLiterals: ['mrCSSTarget:hover { background: gray }']
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
