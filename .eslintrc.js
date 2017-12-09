module.exports = {
  extends: 'airbnb-base',
  env: {
    node: true,
    jest: true,
  },
  globals: {
    window: true,
    fetch: true,
  },
  rules: {
    "import/prefer-default-export": 0,
  }
};
