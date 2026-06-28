module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      },
    ],
    // zod v4 ships `export * as` namespace re-exports that Metro's preset
    // doesn't transform by default; this plugin handles them.
    '@babel/plugin-transform-export-namespace-from',
  ],
};
