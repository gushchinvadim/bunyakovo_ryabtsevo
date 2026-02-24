// frontend/webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      // Обработка CSS
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // Обработка изображений
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash:8][ext]',
        },
      },
    ],
  },
  mode: 'production',
  devtool: 'source-map',
};