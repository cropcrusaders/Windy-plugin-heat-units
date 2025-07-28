import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
  name: 'windy-plugin-heat-units',
  version: '1.0.0',
  icon: '🌡️',
  title: 'Agricultural Heat Units',
  description: 'Calculate and visualize Growing Degree Days (GDD) for optimal crop management and agricultural planning',
  author: 'Agricultural Weather Solutions',
  repository: 'https://github.com/your-username/windy-plugin-heat-units',
  desktopUI: 'rhpane',
  mobileUI: 'fullscreen',
  routerPath: '/heat-units',
  addToContextmenu: true,
  listenToSingleclick: true,
  built: Date.now(),
  builtReadable: new Date().toISOString(),
};

export default config;
