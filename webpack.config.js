const webpack = require('webpack');
const merge = require('webpack-merge');

const TARGET = process.env.npm_lifecycle_event;

function getBabelConf(plugins) {
  return {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel', // 'babel-loader' is also a valid name to reference
          query: {
            presets: ['es2015'],
            plugins: plugins
          }
        };
}

let base = {};

//
// const getBabelConf = function getBabelConf(plugins) {
//   return {
//           test: /\.js$/,
//           exclude: /(node_modules|bower_components)/,
//           loader: 'babel', // 'babel-loader' is also a valid name to reference
//           query: {
//             presets: ['es2015'],
//             plugins: plugins
//           }
//         }
// }
//
// let base = {
//   module: {
//     loaders: [
//       {
//         test: /\.js$/,
//         exclude: /(node_modules|bower_components)/,
//         loader: 'babel', // 'babel-loader' is also a valid name to reference
//         query: {
//           presets: ['es2015'],
//           plugins: [
//             "syntax-flow",
//             "tcomb",
//             "transform-flow-strip-types"
//           ]
//         }
//       }
//     ]
//   }
// };


if (TARGET == 'build') {
  // Build the module bundle to the dist/ folder
  module.exports = merge(base, {
    entry: {
      contentSlider: "./src/ReactivePanZoom.js"
    },
    // Export ContentSlider as Library
    output: {
      path: "dist",
      filename: "ReactivePanZoom.min.js",
      // export itself to a global var
      libraryTarget: "umd",
      // name of the global var: "ContentSlider"
      library: "ContentSlider"
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
      })
    ],
    module: {
      loaders: [getBabelConf([
        "transform-flow-strip-types"
      ])]
    }
  });
} else if (TARGET == 'start') {
  // Start the development mode (webpack-dev-server) and serve `dev/index.html`
  module.exports = merge(base, {
    entry: {
      contentSlider: "./src/ReactivePanZoom.js"
    },
    output: {
      path: "dev",
      filename: "ReactivePanZoom.dev.js",
      libraryTarget: "var",
      library: "ReactivePanZoom"
    },
    devtool: "#inline-source-map",
    devServer: {
      contentBase: 'dev/'
    },
    module: {
      loaders: [getBabelConf([
        "syntax-flow",
        "tcomb",
        "transform-flow-strip-types"
      ])]
    }
  });
} else {
  module.exports = base;
}

function getJsLoader() {

}