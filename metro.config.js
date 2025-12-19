const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

// Add JSON support for i18n
config.resolver.assetExts.push('json');

module.exports = withNativeWind(config, { input: "./global.css" });
