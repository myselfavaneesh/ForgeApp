module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      'react-native-reanimated/plugin',
      ["@lovesworking/watermelondb-expo-plugin-sdk-52-plus"],
      'react-native-reanimated/plugin',
    ],
  }
}
