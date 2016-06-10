'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getDisplayName;
// https://github.com/jurassix/react-display-name/blob/master/src/getDisplayName.js
function getDisplayName(Component) {
  return Component.displayName || Component.name || (typeof Component === 'string' ? Component : 'Component');
}