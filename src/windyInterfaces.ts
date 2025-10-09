export interface PluginParams {
  el: HTMLElement;
  [key: string]: any;
}

export type PluginDataLoader = (
  params: PluginParams,
  utils: any
) => Promise<() => void>;

export interface ExternalPluginConfig {
  name: string;
  version: string;
  icon: string;
  title: string;
  description: string;
  author: string;
  repository: string;
  repositoryOwner: string;
  repositoryName: string;
  desktopUI: string;
  mobileUI: string;
  routerPath: string;
  addToContextmenu: boolean;
  listenToSingleclick: boolean;
  built: number;
  builtReadable: string;
  commitSha: string;
}
