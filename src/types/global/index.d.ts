import type { Map } from 'leaflet';

declare global {
  interface PickerValues {
    temp?: number;
    dewpoint?: number;
    [key: string]: number | undefined;
  }

  interface PickerData {
    values?: PickerValues;
  }

  interface WindyPicker {
    getPickerData(): PickerData | null;
  }

  interface WindyBroadcastEvent {
    lat?: number;
    lon?: number;
  }

  interface WindyBroadcast {
    on(event: 'pickerOpened', handler: (event: WindyBroadcastEvent) => void): void;
    off(event: 'pickerOpened', handler: (event: WindyBroadcastEvent) => void): void;
  }

  interface WindyStore {
    [key: string]: unknown;
  }

  interface WindyAPI {
    map: Map;
    picker?: WindyPicker;
    store?: WindyStore;
    broadcast?: WindyBroadcast;
    [key: string]: unknown;
  }

  interface Window {
    W?: WindyAPI;
    L?: typeof import('leaflet');
  }
}

export {};
