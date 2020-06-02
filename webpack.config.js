var path = require("path");
var webpack = require("webpack");
const prodModel = process.env.NODE_ENV == "production";
const rootPath = path.join(__dirname);

module.exports = {
  mode: prodModel ? "production" : "development",
  devtool: prodModel ? "cheap-module-source-map" : false,
  entry: [path.join(rootPath, "./src")],
  output: {
    path: path.join(rootPath, "./dist"),
    filename: "[name].js",
    chunkFilename: "[name].chunk.js",
    libraryTarget: "commonjs",
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
      },
      {
        test: /\.js?$/,
        include: path.join(rootPath, "./src"),
        use: [
          { loader: "babel-loader", options: { cacheDirectory: true } },
          //{loader: 'eslint-loader', options: {cache: true}},
        ],
      },
    ],
  },
  plugins: [new webpack.ProgressPlugin()],
};
