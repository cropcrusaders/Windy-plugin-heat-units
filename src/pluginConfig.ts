import type { PluginConfig } from '@windycom/plugin-devtools';

const config: PluginConfig = {
  name: 'windy-plugin-heat-units',
  version: '1.0.23',
  icon: '🌡️',
  title: 'Agricultural Heat Units',
  description: 'Calculate and visualize Growing Degree Days (GDD) for optimal crop management and agricultural planning',
  author: 'crop-crusaders',
  repository: 'https://github.com/crop-crusaders/windy-plugin-heat-units',
  repositoryOwner: 'crop-crusaders',
  repositoryName: 'windy-plugin-heat-units',
  desktopUI: 'rhpane',
  mobileUI: 'fullscreen',
  routerPath: '/heat-units',
  addToContextmenu: true,
  listenToSingleclick: true,
  devUrl: 'https://localhost:9999/plugin.js',
  productionUrl: 'https://windy-plugins.com/<your-user-id>/windy-plugin-heat-units/1.0.23/plugin.min.js',
  built: Date.now(),
  builtReadable: new Date().toISOString(),
  commitSha: 'development',
};

export default config;
