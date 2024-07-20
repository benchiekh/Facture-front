const path = require('path');

module.exports = {
  entry: './src/index.js', // Replace with your entry file
  output: {
    path: path.resolve(__dirname, 'dist'), // Replace with your output directory
    filename: 'bundle.js',
  },
  resolve: {
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify")
    }

  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Example loader
        },
      },
    ],
  },
};
