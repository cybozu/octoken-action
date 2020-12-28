module.exports = {
  extends: [
    "@cybozu/eslint-config/presets/node",
    "@cybozu/eslint-config/presets/typescript",
    "prettier",
    "prettier/@typescript-eslint"
  ],
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 9,
    sourceType: "module",
    project: "./tsconfig.eslint.json"
  },
  rules: {
    "quotes": ["error", "double", { "avoidEscape": true }],
    "object-curly-spacing": ["error", "always", { "arraysInObjects": true }],
    "node/no-unsupported-features/es-syntax": "off",
    "node/no-unpublished-import": ["error", {
      "allowModules": ["nock"]
    }]
  }
};
