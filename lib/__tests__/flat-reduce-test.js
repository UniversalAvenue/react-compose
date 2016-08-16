'use strict';

jest.autoMockOff();

var flatReduce = require('../index-v2').flatReduce;

describe('Map deep', function () {
  function aProp(_ref) {
    var a = _ref.a;

    return {
      b: a
    };
  }
  function hoverGold(_ref2) {
    var isHovering = _ref2.isHovering;

    return {
      background: isHovering ? 'gold' : undefined,
      isHovering: isHovering
    };
  }
  function hoverSilver(_ref3) {
    var isHovering = _ref3.isHovering;

    return {
      background: isHovering ? 'silver' : undefined,
      isHovering: isHovering
    };
  }
  function hoverPicker(_ref4) {
    var color = _ref4.color;

    return [color === 'gold' ? hoverGold : hoverSilver];
  }
  function override() {
    return [hoverGold, hoverSilver];
  }
  it('should produce a valid output', function () {
    var res = flatReduce(aProp, { a: 4 });
    expect(res).toEqual({ b: 4 });
  });
  describe('hover picker', function () {
    it('should have golden background when isHovering', function () {
      expect(flatReduce(hoverPicker, {
        color: 'gold',
        isHovering: true
      }).background).toEqual('gold');
    });
    it('should have no background when not isHovering', function () {
      expect(flatReduce(hoverPicker, {
        color: 'gold',
        isHovering: false
      }).background).not.toBeDefined();
    });
  });

  describe('override', function () {
    it('should override props in valid order', function () {
      expect(flatReduce(override, { isHovering: true }).background).toEqual('silver');
    });
  });
  describe('static object', function () {
    it('should pass object in its entirity', function () {
      var obj = {
        a: 2,
        b: 4,
        c: [3, 4, 5, 6]
      };
      expect(flatReduce(obj)).toEqual(obj);
    });
  });
});