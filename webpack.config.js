const createExpoWebpackConfig = require('@expo/webpack-config');
const webpack = require('webpack');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfig(env, argv);
  config.resolve.alias['three$'] = 'three/build/three.min.js';
  config.resolve.alias['three/.*$'] = 'three';

  config.plugins.push(
    new webpack.ProvidePlugin({
      THREE: 'three',
    }),
  );
  return config;
};
