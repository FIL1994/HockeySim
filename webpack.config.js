const webpack = require('webpack');

module.exports = {
  entry: [
    './src/index.js'
  ],
  output: {
    path: __dirname,
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015', 'stage-1']
      }
    },
    {
      test:/\.css$/,loader:'style!css!'
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devServer: {
    historyApiFallback: true,
    port: 8082,
    contentBase: './'
  },
  plugins: [
      new webpack.DefinePlugin({
          //production
          'process.env.NODE_ENV': JSON.stringify('production') //JSON.stringify(process.env.NODE_ENV || 'development')
      }),
  ]
};
