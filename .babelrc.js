module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        loose: true,
        modules: "cjs",
        targets: { ie: 11 },
      },
    ],
  ],
  plugins: [
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-optional-chaining",
    [
      "@babel/plugin-proposal-object-rest-spread",
      { loose: true, useBuiltIns: true },
    ],
    [
      "@babel/plugin-transform-runtime",
      {
        useESModules: false,
        version: "~7.9.0",
      },
    ],
  ],
  ignore: ["**/*.d.ts"],
  comments: false,
};
