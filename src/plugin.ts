import type { PluginDataLoader } from './windyInterfaces';
import config from './pluginConfig';

/**
 * Main plugin entry point that integrates with Windy.com
 */
const plugin: PluginDataLoader = async (params) => {
  if (typeof document === 'undefined') {
    console.warn('[windy-plugin-heat-units] Document is not available; skipping UI bootstrap.');
    return () => {};
  }

  const { el } = params;

  const target = ensureHostElement(params, el);

  target.innerHTML = '';
  target.dataset.pluginReady = 'true';

  // Import the Svelte component
  const Plugin = (await import('./plugin.svelte')).default;

  let pluginInstance: InstanceType<typeof Plugin> | null = null;

  try {
    // Initialize the plugin component
    pluginInstance = new Plugin({
      target,
      props: {},
    });
  } catch (error) {
    console.error('Failed to mount Windy heat units plugin UI:', error);
    renderBootstrapError(target);

    return () => {
      target.removeAttribute('data-plugin-ready');
    };
  }

  // Return cleanup function
  return () => {
    if (pluginInstance) {
      pluginInstance.$destroy();
      pluginInstance = null;
    }

    target.removeAttribute('data-plugin-ready');

    if (!el && target.parentElement) {
      target.parentElement.removeChild(target);
    }
  };
};

function ensureHostElement(params: Record<string, unknown>, existing: HTMLElement | undefined) {
  if (existing instanceof HTMLElement) {
    return existing;
  }

  const fallbackContainer = document.createElement('section');
  fallbackContainer.className = 'windy-plugin-heat-units-root';
  fallbackContainer.style.minHeight = '220px';
  fallbackContainer.style.padding = '16px';
  fallbackContainer.style.background = 'rgba(255, 255, 255, 0.95)';
  fallbackContainer.style.color = '#2c3e50';

  const parent = getParentHost(params);
  parent.appendChild(fallbackContainer);

  return fallbackContainer;
}

function getParentHost(params: Record<string, unknown>) {
  const potentialParent =
    'node' in params && params.node instanceof HTMLElement
      ? params.node
      : 'root' in params && params.root instanceof HTMLElement
        ? params.root
        : null;

  return potentialParent ?? document.body;
}

function renderBootstrapError(target: HTMLElement) {
  const errorContainer = document.createElement('div');
  errorContainer.className = 'windy-plugin-heat-units-error';
  errorContainer.style.padding = '16px';
  errorContainer.style.background = 'rgba(231, 76, 60, 0.12)';
  errorContainer.style.border = '1px solid rgba(231, 76, 60, 0.35)';
  errorContainer.style.borderRadius = '8px';
  errorContainer.style.color = '#c0392b';
  errorContainer.innerHTML = `
    <h3 style="margin: 0 0 8px 0; font-size: 1rem;">Plugin failed to load</h3>
    <p style="margin: 0; font-size: 0.85rem; line-height: 1.4;">
      The Agricultural Heat Units interface could not be initialised. Please reload the plugin or check the browser console for details.
    </p>
  `;

  target.appendChild(errorContainer);
}

// Export the plugin
export default plugin;
export { config };
