// https://github.com/jurassix/react-display-name/blob/master/src/getDisplayName.js
export default function getDisplayName(Component) {
  return (
    Component.displayName ||
    Component.name ||
    (typeof Component === 'string' ? Component : 'Component')
  );
}
