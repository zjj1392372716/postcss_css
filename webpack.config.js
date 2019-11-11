const path = require("path")

module.exports = {
  entry: {
    index: path.resolve(__dirname, "./src/index.js")
  },
  mode: 'development',
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "./dist")
  },
  module: {
    rules: [
      {
        test: /\.pcss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            }
          },
          {
            loader: 'postcss-loader'
          }
        ]
      }
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    compress: true,
    port: 9000,
    inline: true,
    hot: true,
    host: '0.0.0.0',
    disableHostCheck: true
  }
}
