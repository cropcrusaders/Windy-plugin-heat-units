export interface CropSettings {
  name: string;
  baseTemp: number;
  upperTemp: number;
  gddRequired: number;
  icon: string;
}

export interface HeatUnitData {
  lat: number;
  lon: number;
  gdd: number;
  dailyGdd: number[];
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
}

export interface CalculationSettings {
  crop: string;
  baseTemp: number;
  upperTemp: number;
  startDate: Date;
  endDate: Date;
  method: 'simple' | 'modified' | 'double-sine';
}
