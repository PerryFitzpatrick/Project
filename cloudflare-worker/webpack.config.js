const path = require('path');

module.exports = {
  entry: './src/worker.js',
  target: 'webworker',
  mode: 'production',
  experiments: {
    asyncWebAssembly: true,
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.wasm'],
  },
  output: {
    filename: 'worker.js',
    path: path.resolve(__dirname, 'dist'),
  },
}; 