require('dotenv').config();
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: {
    main: ['babel-polyfill', './static/src/js/main.js'],
    validate: './static/src/js/validate.js'
  },
  output: {
    path: path.resolve(__dirname, 'static/dist'),
    filename: '[name]-bundle.js'
  },
  devServer: {
    //contentBase: path.join(__dirname, 'static/dist'),
    host: 'localhost',
    hot: true,
    inline: true,
    port: 8080,
    proxy: {
      '/': {
        target: `http://localhost:${process.env.PORT}`,
        secure: false
      }
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'main.css'
    }),
    new CleanWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        ]
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(jpg|png)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'img/',
            //publicPath: 'img/'
          }
        }
      },
      {
        test: /\.(ico)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          }
        }
      }
    ]
  }
};