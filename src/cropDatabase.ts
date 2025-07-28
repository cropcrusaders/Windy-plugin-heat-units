import type { CropSettings } from './types';

export const CROP_DATABASE: Record<string, CropSettings> = {
  corn: {
    name: 'Corn',
    baseTemp: 10,
    upperTemp: 30,
    gddRequired: 1200,
    icon: '🌽'
  },
  wheat: {
    name: 'Wheat',
    baseTemp: 4,
    upperTemp: 25,
    gddRequired: 1400,
    icon: '🌾'
  },
  soybean: {
    name: 'Soybean',
    baseTemp: 10,
    upperTemp: 30,
    gddRequired: 1300,
    icon: '🫘'
  },
  rice: {
    name: 'Rice',
    baseTemp: 12,
    upperTemp: 35,
    gddRequired: 1800,
    icon: '🌾'
  },
  cotton: {
    name: 'Cotton',
    baseTemp: 15.5,
    upperTemp: 32,
    gddRequired: 1600,
    icon: '🌿'
  },
  tomato: {
    name: 'Tomato',
    baseTemp: 10,
    upperTemp: 30,
    gddRequired: 1100,
    icon: '🍅'
  },
  potato: {
    name: 'Potato',
    baseTemp: 7,
    upperTemp: 30,
    gddRequired: 1000,
    icon: '🥔'
  },
  canola: {
    name: 'Canola',
    baseTemp: 5,
    upperTemp: 27,
    gddRequired: 1400,
    icon: '🌻'
  }
};
