declare module '*.svelte' {
  import type { ComponentType } from 'svelte';
  const component: ComponentType;
  export default component;
}

declare module '@windycom/plugin-devtools' {
  export interface PluginContext {
    mount: HTMLElement;
    windy?: Record<string, unknown>;
    [key: string]: unknown;
  }

  export type RegisterPlugin = (ctx: PluginContext) => {
    name: string;
    onMount(): void;
    onUnmount(): void;
  };

  export interface PluginConfig {
    name: string;
    version: string;
    icon: string;
    title: string;
    description: string;
    author: string;
    repository: string;
    repositoryOwner: string;
    repositoryName: string;
    desktopUI: 'rhpane' | 'embedded';
    mobileUI: 'fullscreen' | 'small' | 'embedded';
    routerPath?: string;
    addToContextmenu?: boolean;
    listenToSingleclick?: boolean;
    devUrl: string;
    productionUrl?: string;
    built: number;
    builtReadable: string;
    commitSha: string;
    [key: string]: unknown;
  }
}
