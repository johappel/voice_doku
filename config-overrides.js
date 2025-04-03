const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
  config => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "buffer": require.resolve("buffer/")
    };
    
    // Static files serving for templates
    config.devServer = {
      ...config.devServer,
      static: {
        directory: path.join(__dirname, 'public/templates'),
        publicPath: '/templates',
        serveIndex: true,
      }
    };
    
    return config;
  }
);