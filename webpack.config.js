const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const  CssMinimizerPlugin  =  require ( "css-minimizer-webpack-plugin" ) ;
const TerserWebpackPlugin = require("terser-webpack-plugin");
const ImageminPlugin = require("imagemin-webpack");


const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;

const filename = (ext) =>
  isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;

  const optimization = () => {
    const configObj = {
      splitChunks: {
        chunks: "all"
      }
    };

    if (isProd) {
      configObj.minimizer = [
        new CssMinimizerPlugin(),
        new TerserWebpackPlugin()
      ];
    }

    return configObj;
  };

  const plugins = () => {
    const basePlugins = [
      new HTMLWebpackPlugin({
        template: path.resolve(__dirname, "src/index.html"),
        filename: "index.html",
        minify: {
          collapseWhitespace: isProd
        }
      }),
      //new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: `./css/${filename("css")}`
      }),
    ];

    if (isProd) {
      basePlugins.push(
        new ImageminPlugin({
          bail: false, // Ignore errors on corrupted images
          cache: true,
          imageminOptions: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              [
                "svgo",
                {
                  plugins: [
                    {
                      removeViewBox: false,
                    }
                  ]
                }
              ]
            ]
          }
        })
      )
    }

    return basePlugins;
  };

module.exports = {
  context: path.resolve(__dirname, "src"),
  mode: "development",
  entry: "./js/main.js",
  output: {
    filename: `./js/${filename("js")}`,
    path: path.resolve(__dirname, "dist"),
    assetModuleFilename: "assets/[hash][ext][query]",
    publicPath: '',
    clean: true,
  },
  devServer: {
    historyApiFallback: true,
    static: path.resolve(__dirname, "dist"),
    open: true,
    compress: true,
    hot: true,
    port: 3000,
  },
  optimization: optimization(),
  plugins: plugins(),
  devtool: isProd ? false : "source-map",
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: "html-loader",
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev
            },
          },
          "css-loader"
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(?:|gif|png|jpg|jpeg|svg|ico)$/i,
        type: "asset/resource",
        generator : {
          filename : `./img/${filename('[ext]')}`
        }
      },
      {
        test: /\.(?:|woff2|woff)$/,
        type: "asset/resource",
        generator : {
          filename : `./fonts/${filename('[ext]')}`
        }
      },
    ],
  }
};
