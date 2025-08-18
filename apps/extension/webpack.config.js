const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background/simple-background.js',
    content: './src/content/index.tsx',
    popup: './src/popup/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public', to: '.' },
        { from: 'manifest.json', to: '.' },
        { from: 'popup.html', to: '.' },
        { from: 'src/content/styles.css', to: 'content.css' },
        { from: 'src/content/injected.js', to: 'injected.js' },
        { from: 'test-popup.html', to: 'test-popup.html' },
        { from: 'simple-test.html', to: 'simple-test.html' },
        { from: 'debug-popup.html', to: 'debug-popup.html' },
        { from: 'debug-popup.js', to: 'debug-popup.js' },
        { from: 'smart-popup.html', to: 'smart-popup.html' },
        { from: 'smart-popup.js', to: 'smart-popup.js' },
      ],
    }),
  ],
};