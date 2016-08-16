jest.autoMockOff();

const flatReduce = require('../index-v2').flatReduce;

describe('Map deep', () => {
  function aProp({ a }) {
    return {
      b: a,
    };
  }
  function hoverGold({ isHovering }) {
    return {
      background: isHovering ? 'gold' : undefined,
      isHovering,
    };
  }
  function hoverSilver({ isHovering }) {
    return {
      background: isHovering ? 'silver' : undefined,
      isHovering,
    };
  }
  function hoverPicker({ color }) {
    return [
      color === 'gold' ? hoverGold : hoverSilver,
    ];
  }
  function override() {
    return [hoverGold, hoverSilver];
  }
  it('should produce a valid output', () => {
    const res = flatReduce(aProp, { a: 4 });
    expect(res).toEqual({ b: 4 });
  });
  describe('hover picker', () => {
    it('should have golden background when isHovering', () => {
      expect(flatReduce(hoverPicker, {
        color: 'gold',
        isHovering: true,
      }).background).toEqual('gold');
    });
    it('should have no background when not isHovering', () => {
      expect(flatReduce(hoverPicker, {
        color: 'gold',
        isHovering: false,
      }).background).not.toBeDefined();
    });
  });

  describe('override', () => {
    it('should override props in valid order', () => {
      expect(flatReduce(override, { isHovering: true }).background).toEqual('silver');
    });
  });
  describe('static object', () => {
    it('should pass object in its entirity', () => {
      const obj = {
        a: 2,
        b: 4,
        c: [3, 4, 5, 6],
      };
      expect(flatReduce(obj)).toEqual(obj);
    });
  });
});

