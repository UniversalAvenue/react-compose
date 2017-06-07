module.exports = {
  extends: 'airbnb',
  parser: 'babel-eslint',
  plugins: [
    'react',
  ],
  rules: {
    'react/jsx-filename-extension': [1, {
      extensions: ['.js', '.jsx'],
    }],
  },
};
