module.exports = {
  extends: ['airbnb-base', 'prettier'],
  env: {
    node: true,
    jest: true,
  },
  globals: {
    window: true,
    fetch: true,
  },
  rules: {
    'import/prefer-default-export': 0,
  },
};
