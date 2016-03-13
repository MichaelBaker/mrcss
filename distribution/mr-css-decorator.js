'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = MrCssDecorator;
exports.styleChildren = styleChildren;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _selector = require('selector.es6');

var _selector2 = _interopRequireDefault(_selector);

var _mrCss = require('mr-css.es6');

var MrCss = _interopRequireWildcard(_mrCss);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var I = _immutable2.default.fromJS;
var EmptyList = I([]);

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
        var parentSelectors = this.props._mrCssParentSelectors || new _selector2.default();

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
        var immutStyles = I(styles || {});
        var newSelectors = MrCss.addSelectors(parentSelectors, immutStyles.get('childSelectors'));
        var myStyles = parentSelectors.find(path).push(immutStyles.delete('childSelectors'));
        var props = MrCss.styleProps(originalElement, EmptyList.push(originalElement).push(this), myStyles);

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
  var elementTag = element.type;
  var newPath = path.push(elementTag);
  var newChildren = _react2.default.Children.map(children, function (c) {
    return styleChildren(c, newPath, selector);
  });
  var props = MrCss.styleProps(element, EmptyList.push(element), selector.find(newPath));

  return _react2.default.cloneElement(element, _extends({}, props, {
    _mrCssParentSelectors: selector,
    _mrCssParentPath: path
  }), newChildren);
}