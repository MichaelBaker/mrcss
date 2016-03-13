'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Selector = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.styleProps = styleProps;
exports.mergeStyles = mergeStyles;
exports.installCss = installCss;
exports.addSelectors = addSelectors;
exports.default = MrCssDecorator;
exports.styleChildren = styleChildren;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _sha = require('sha1');

var _sha2 = _interopRequireDefault(_sha);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var I = _immutable2.default.fromJS;
var EmptyMap = I({});
var EmptyList = I([]);

function styleProps(element, synonymousElements, styles) {
  var computedStyles = mergeStyles(synonymousElements, styles);
  var oldStyle = element.props.style || {};
  var style = _extends({}, oldStyle, computedStyles.get('styles').toJS());
  var oldClassNames = element.props.className;
  var className = (0, _classnames2.default)(oldClassNames, computedStyles.get('classNames').toJS());

  return { style: style, className: className };
}

function mergeStyles(elements, styles) {
  return styles.reduce(function (acc, style) {
    var predicate = style.get('predicate');
    var compute = style.get('compute');
    var onlyStyles = style.delete('predicate').delete('compute');
    var matches = !predicate || elements.some(predicate);

    if (matches) {
      var computedStyles = compute && elements.map(compute) || EmptyList;
      var allStyles = computedStyles.push(onlyStyles).filter(function (x) {
        return x;
      }).map(function (x) {
        return I(x);
      });
      var literals = allStyles.flatMap(function (s) {
        return I(s.get('cssLiterals'));
      }).filter(function (x) {
        return x;
      });
      var objects = allStyles.map(function (s) {
        return s.delete('cssLiterals');
      });

      var newStyles = objects.reduce(function (acc2, x) {
        return acc2.merge(x);
      }, acc.get('styles'));
      var newClassNames = acc.get('classNames').concat(literals.map(installCss));

      return acc.set('styles', newStyles).set('classNames', newClassNames);
    } else {
      return acc;
    }
  }, I({ styles: {}, classNames: [] }));
}

function installCss(styleSheet) {
  var className = '_' + (0, _sha2.default)(styleSheet);

  if (!document.getElementById(className)) {
    var gsubedSheet = styleSheet.replace(/mrCSSTarget/g, '.' + className);
    var newSheet = document.createElement('style');
    newSheet.id = className;
    newSheet.className = 'mrCssStyleSheet';

    document.head.appendChild(newSheet);
    newSheet.sheet.insertRule(gsubedSheet, 0);
  }

  return className;
}

function addSelectors(oldSelectors, object) {
  if (!object) return oldSelectors;
  return I(object).reduce(function (acc, value, selector) {
    var selectorArray = selector.split(' ');
    return acc.add(selectorArray, value);
  }, oldSelectors);
}

var Selector = exports.Selector = function () {
  _createClass(Selector, null, [{
    key: 'makePath',
    value: function makePath(selector) {
      return I(selector).push('_values');
    }
  }, {
    key: 'findLoop',
    value: function findLoop(trees, path, originalPath) {
      if (path.size == 0) return EmptyList;
      if (trees.size == 0) return EmptyList;

      var nodeList = path.take(1).flatten();

      var values = nodeList.flatMap(function (node) {
        if (!node) throw new Error('Node with a value of ' + JSON.stringify(node) + ' was found in call to Selector.find. Path was ' + JSON.stringify(originalPath));

        return trees.flatMap(function (tree) {
          return tree.getIn([node, '_values'], EmptyList);
        });
      });

      var newTrees = nodeList.flatMap(function (node) {
        return trees.map(function (tree) {
          return tree.get(node);
        }).filter(function (x) {
          return x;
        });
      });

      return values.concat(Selector.findLoop(newTrees, path.rest(), originalPath));
    }
  }]);

  function Selector() {
    var selectorTree = arguments.length <= 0 || arguments[0] === undefined ? I({}) : arguments[0];

    _classCallCheck(this, Selector);

    this.selectorTree = selectorTree;
  }

  _createClass(Selector, [{
    key: 'add',
    value: function add(selector, value) {
      var path = Selector.makePath(I(selector).reverse());
      var newTree = this.selectorTree.updateIn(path, I([]), function (o) {
        return o.push(value);
      });
      return new Selector(newTree);
    }
  }, {
    key: 'find',
    value: function find(selector) {
      var tags = I(selector).reverse();
      return Selector.findLoop(I([this.selectorTree]), tags, selector);
    }
  }]);

  return Selector;
}();

function MrCssDecorator(WrappedComponent) {
  return function (_WrappedComponent) {
    _inherits(_class, _WrappedComponent);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
    }

    _createClass(_class, [{
      key: 'render',
      value: function render() {
        var originalElement = WrappedComponent.prototype.render.bind(this)();

        var component = WrappedComponent.name;
        var elementTag = originalElement.type;

        var parentPath = this.props._mrCssParentPath || EmptyList;
        var parentSelectors = this.props._mrCssParentSelectors || new Selector();

        var path = parentPath.push(function () {
          if (component && elementTag) {
            return I([component, elementTag]);
          } else if (component) {
            return component;
          } else {
            return elementTag;
          }
        }());

        var styles = this.style && this.style();
        var propStyles = I(this.props.style || {});
        var immutStyles = propStyles.merge(I(styles || {}));
        var newSelectors = addSelectors(parentSelectors, immutStyles.get('childSelectors'));
        var myStyles = parentSelectors.find(path).push(immutStyles.delete('childSelectors'));
        var props = styleProps(originalElement, EmptyList.push(originalElement).push(this), myStyles);

        var newChildren = _react2.default.Children.map(originalElement.props.children, function (c) {
          return styleChildren(c, path, newSelectors);
        });

        return _react2.default.cloneElement(originalElement, _extends({}, props, {
          _mrCssPath: path
        }), newChildren);
      }
    }]);

    return _class;
  }(WrappedComponent);
}

function styleChildren(element, path, selector) {
  if (!element) {
    return element;
  }

  // [Verify] This is a non-primitive component with an explicit render method
  if (element.render) {
    var elementWithProps = _react2.default.cloneElement(element, {
      _mrCssParentSelectors: selector,
      _mrCssParentPath: path
    });
    return MrCssDecorator(elementWithProps);
  }

  // [Verify] This is a node which doesn't have props or anything, so you cant style it
  if (!element.type) return element;

  var children = element.props && element.props.children || [];
  var propStyles = I(element.props.style || {});
  var elementTag = element.type;
  var newPath = path.push(elementTag);
  var newChildren = _react2.default.Children.map(children, function (c) {
    return styleChildren(c, newPath, selector);
  });
  var props = styleProps(element, EmptyList.push(element), selector.find(newPath).unshift(propStyles));

  if (newChildren.length === 0) {
    return _react2.default.cloneElement(element, _extends({}, props, {
      _mrCssParentSelectors: selector,
      _mrCssParentPath: path
    }));
  } else {
    return _react2.default.cloneElement(element, _extends({}, props, {
      _mrCssParentSelectors: selector,
      _mrCssParentPath: path
    }), newChildren);
  }
}