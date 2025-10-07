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

export interface TornadoRiskTimelinePoint {
  hourOffset: number;
  riskIndex: number;
  probability: number;
}

export interface TornadoRiskData {
  lat: number;
  lon: number;
  forecastHours: number;
  riskIndex: number;
  probability: number;
  summary: string;
  parameters: {
    cape: number;
    shear: number;
    helicity: number;
  };
  timeline: TornadoRiskTimelinePoint[];
}

export interface TornadoRiskMapPoint {
  lat: number;
  lon: number;
  riskIndex: number;
  probability: number;
}
