import type { RegisterPlugin, PluginContext } from '@windycom/plugin-devtools';
import PluginUI from './plugin.svelte';
import config from './pluginConfig';

const register: RegisterPlugin = (ctx: PluginContext) => {
  let app: PluginUI | null = null;

  return {
    name: config.title,
    onMount() {
      app = new PluginUI({
        target: ctx.mount,
        props: { ctx },
      });
    },
    onUnmount() {
      app?.$destroy();
      app = null;
    },
  };
};

const windyPluginModule = {
  config,
  default: register,
  register,
};

if (typeof globalThis !== 'undefined') {
  (globalThis as typeof globalThis & { windyPlugin?: typeof windyPluginModule }).windyPlugin = windyPluginModule;
}

export { config };
export default register;
