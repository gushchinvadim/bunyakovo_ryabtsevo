// frontend/webpack.dev.js
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    hot: true,
    port: 8080,
    open: true,
    historyApiFallback: {
      index: "/index.html",
      rewrites: [
        { from: /\/community-rules/, to: "/index.html" },
        // ... другие реврайты если есть
      ],
    },
    // 🔑 ПРАВИЛЬНАЯ КОНФИГУРАЦИЯ ПРОКСИ (массив объектов)
    proxy: [
      {
        context: ["/api", "/media"],
        target: "http://localhost:8000",
        changeOrigin: true,
        logLevel: "debug",
      },
    ],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/", // ← Критически важно для SPA!
  },
});
