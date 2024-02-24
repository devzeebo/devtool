module.exports = {
  extends: [
    '@react-ddd',
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  rules: {
    'no-console': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};
