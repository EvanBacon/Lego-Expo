const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const { getMode } = require('@expo/webpack-config/utils');

module.exports = async function(env, argv) {
  const mode = getMode(env);
  const isProd = mode === 'production';

  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      removeUnusedImportExports: false,
    },
    argv,
  );
  config.resolve.alias['three$'] = 'three/build/three.min.js';
  config.resolve.alias['three/.*$'] = 'three';

  config.plugins.push(
    new webpack.ProvidePlugin({
      THREE: 'three',
    }),
  );
  return config;
};
