const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'svg');

module.exports = config;

config.maxWorkers = 2;

module.exports = config;
