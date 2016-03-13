'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var I = _immutable2.default.fromJS;
var EmptyMap = I({});
var EmptyList = I([]);

var Selector = function () {
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

exports.default = Selector;