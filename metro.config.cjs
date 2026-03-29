const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// lodash resolution on web often fails due to relative requires in CommonJS files
// Aliasing to lodash-es is a more robust solution for Expo Web
config.resolver.sourceExts.push('cjs');

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  lodash: require.resolve('lodash-es'),
};

module.exports = config;
