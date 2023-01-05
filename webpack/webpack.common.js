const path = require("path");
// eslint-disable-next-line import/no-extraneous-dependencies
const HtmlWebpackPlugin = require("html-webpack-plugin");
// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require("webpack");

module.exports = (env) => ({
  mode: env.WEBPACK_SERVE ? "development" : "production",
  entry: "./src/index.tsx",
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "images/[name].[contenthash:8].[ext]",
            },
          },
        ],
      },
      {
        test: /\.(mp3)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "audio/[name].[contenthash:8].[ext]",
            },
          },
        ],
      },
      {
        test: /\.(mp4)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "videos/[name].[contenthash:8].[ext]",
            },
          },
        ],
      },
      {
        test: /\.(xls|xlsx)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "excel/[name].[contenthash:8].[ext]",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    modules: ["node_modules", path.resolve(__dirname, "..", "src")],
    // alias: {
    //     "": "../"
    // }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
    new webpack.ProvidePlugin({
      React: "react",
    }),

    new webpack.DefinePlugin({
      "process.env": {
        PORT: JSON.stringify(process.env.PORT),
        REACT_APP_SERVER_URL: JSON.stringify(process.env.REACT_APP_SERVER_URL),
        REACT_APP_WEB_SOCKET_STREAM_URL: JSON.stringify(
          process.env.REACT_APP_WEB_SOCKET_STREAM_URL
        ),
        REACT_APP_WEB_SOCKET_IN_OUT_URL: JSON.stringify(
          process.env.REACT_APP_WEB_SOCKET_IN_OUT_URL
        ),
        REACT_APP_MAX_NUMBER_CAM_SHOW: JSON.stringify(process.env.REACT_APP_MAX_NUMBER_CAM_SHOW),
        REACT_APP_QR_CODE_IMAGE_URL: JSON.stringify(process.env.REACT_APP_QR_CODE_IMAGE_URL),
        REACT_APP_NUMBER_CAMERA_SHOW_DEFAULT: JSON.stringify(
          process.env.REACT_APP_NUMBER_CAMERA_SHOW_DEFAULT
        ),
        DISABLE_ESLINT_PLUGIN: JSON.stringify(process.env.DISABLE_ESLINT_PLUGIN),
      },
    }),
  ],
  // performance: {
  //     maxEntrypointSize: 800000 //  Khi có 1 file build vượt quá giới hạn này (tính bằng byte) thì sẽ bị warning trên terminal.
  // }
});
