import type { PluginDataLoader } from './windyInterfaces';
import config from './pluginConfig';

/**
 * Main plugin entry point that integrates with Windy.com
 */
const plugin: PluginDataLoader = async (params, utils) => {
  const { el } = params;

  // Import the Svelte component
  const Plugin = (await import('./plugin.svelte')).default;

  // Initialize the plugin component
  const pluginInstance = new Plugin({
    target: el,
    props: {},
  });

  // Return cleanup function
  return () => {
    pluginInstance.$destroy();
  };
};

// Export the plugin
export default plugin;
export { config };
