import type { HeatUnitData, TornadoRiskData, TornadoRiskMapPoint, TornadoRiskTimelinePoint } from './types';

export class WindyDataAdapter {
  /**
   * Extract temperature data from Windy's weather API
   */
  static async getTemperatureData(lat: number, lon: number, days: number = 30): Promise<HeatUnitData> {
    try {
      // Access Windy's picker for point data
      const picker = (window as any).W?.picker;
      if (!picker) throw new Error('Windy picker not available');

      // Get current weather data to bias the mock data towards live conditions
      const pickerData = typeof picker.getPickerData === 'function' ? picker.getPickerData() : null;

      // In a real implementation, you would:
      // 1. Use Windy's API to get historical temperature data
      // 2. Access temperature forecasts
      // 3. Extract min/max temperatures for the specified period

      // Mock data for demonstration
      const mockTemperatureData = this.generateMockTemperatureData(lat, lon, days, pickerData);

      return {
        lat,
        lon,
        gdd: mockTemperatureData.totalGDD,
        dailyGdd: mockTemperatureData.dailyGDD,
        temperature: {
          min: Math.min(...mockTemperatureData.minTemps),
          max: Math.max(...mockTemperatureData.maxTemps),
          avg: mockTemperatureData.avgTemp,
        },
      };
    } catch (error) {
      console.error('Error fetching temperature data:', error);
      throw error;
    }
  }

  /**
   * Generate realistic mock temperature data for demonstration
   */
  private static generateMockTemperatureData(lat: number, lon: number, days: number, pickerData: any) {
    const now = new Date();
    const dailyGDD: number[] = [];
    const minTemps: number[] = [];
    const maxTemps: number[] = [];
    let totalGDD = 0;

    // Base temperature varies by latitude
    const baseTemp = 10; // Corn base temperature
    const seasonalVariation = Math.sin((now.getMonth() - 3) * Math.PI / 6) * 10;
    const latitudeEffect = (50 - Math.abs(lat)) * 0.5;
    const longitudeEffect = Math.cos((lon * Math.PI) / 180) * 3;
    const pickerTemperature = typeof pickerData?.values?.temp === 'number'
      ? pickerData.values.temp
      : typeof pickerData?.temp === 'number'
        ? pickerData.temp
        : null;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate realistic temperature range
      const startOfYear = new Date(date.getFullYear(), 0, 0);
      const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
      const annualCycle = Math.sin((dayOfYear / 365) * 2 * Math.PI);
      const randomVariation = (Math.random() - 0.5) * 6;

      let avgTemp = 15 + seasonalVariation + latitudeEffect + longitudeEffect + annualCycle * 5 + randomVariation;
      if (pickerTemperature !== null) {
        avgTemp = (avgTemp + pickerTemperature) / 2;
      }
      const tempRange = 8 + Math.random() * 4;

      const tMin = avgTemp - tempRange / 2;
      const tMax = avgTemp + tempRange / 2;

      minTemps.push(tMin);
      maxTemps.push(tMax);

      // Calculate GDD
      const dailyGDDValue = Math.max(0, (tMin + tMax) / 2 - baseTemp);
      dailyGDD.push(dailyGDDValue);
      totalGDD += dailyGDDValue;
    }

    return {
      dailyGDD,
      totalGDD,
      minTemps,
      maxTemps,
      avgTemp: (minTemps.reduce((a, b) => a + b, 0) + maxTemps.reduce((a, b) => a + b, 0)) / (minTemps.length + maxTemps.length),
    };
  }

  /**
   * Create overlay data for map visualization
   */
  static generateHeatMapData(bounds: any, settings: any): Promise<any> {
    // In a real implementation, this would:
    // 1. Request temperature data for the visible map bounds
    // 2. Calculate GDD for each grid point
    // 3. Generate a data structure suitable for Leaflet overlay

    return Promise.resolve({
      bounds,
      data: this.generateMockGridData(bounds, settings),
    });
  }

  private static generateMockGridData(bounds: any, settings: any) {
    const gridSize = 20;
    const data = [] as Array<{lat: number, lon: number, gdd: number, intensity: number}>;

    const latStep = (bounds.north - bounds.south) / gridSize;
    const lonStep = (bounds.east - bounds.west) / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const lat = bounds.south + i * latStep;
        const lon = bounds.west + j * lonStep;

        // Generate mock GDD value based on location
        const seasonalFactor = Math.sin((new Date().getMonth() - 3) * Math.PI / 6);
        const latitudeFactor = (50 - Math.abs(lat)) * 0.02;
        const randomFactor = Math.random() * 0.3;

        const methodAdjustment = settings.method === 'double-sine' ? 1.1 : settings.method === 'modified' ? 1.05 : 1;
        const periodAdjustment = Math.max(1, settings.timePeriod / 30);
        const baseAdjustment = (settings.baseTemp - 5) * -4;

        const gdd = Math.max(0, (300 + seasonalFactor * 200 + latitudeFactor * 100 + randomFactor * 100 + baseAdjustment)) * methodAdjustment * (periodAdjustment / 1.5);

        data.push({
          lat,
          lon,
          gdd,
          intensity: Math.min(1, gdd / 800), // Normalize for color mapping
        });
      }
    }

    return data;
  }

  static async getTornadoRiskData(lat: number, lon: number, forecastHours: number = 48): Promise<TornadoRiskData> {
    try {
      const baseParameters = this.computeTornadoParameters(lat, lon);
      const riskIndex = this.calculateRiskIndex(baseParameters, forecastHours);
      const probability = this.calculateProbability(riskIndex);
      const timeline = this.generateTornadoTimeline(lat, lon, forecastHours, baseParameters);

      return {
        lat,
        lon,
        forecastHours,
        riskIndex,
        probability,
        summary: this.getRiskSummary(riskIndex),
        parameters: baseParameters,
        timeline,
      };
    } catch (error) {
      console.error('Error fetching tornado risk data:', error);
      throw error;
    }
  }

  static async generateTornadoRiskOverlay(bounds: any, forecastHours: number = 48): Promise<{bounds: any; points: TornadoRiskMapPoint[]}> {
    return {
      bounds,
      points: this.generateTornadoRiskGrid(bounds, forecastHours),
    };
  }

  private static generateTornadoRiskGrid(bounds: any, forecastHours: number): TornadoRiskMapPoint[] {
    const gridSize = 18;
    const latStep = (bounds.north - bounds.south) / gridSize;
    const lonStep = (bounds.east - bounds.west) / gridSize;
    const points: TornadoRiskMapPoint[] = [];

    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const lat = bounds.south + i * latStep;
        const lon = bounds.west + j * lonStep;
        const params = this.computeTornadoParameters(lat, lon);
        const variance = (this.pseudoRandom(lat, lon, forecastHours) - 0.5) * 2.5;
        const riskIndex = this.calculateRiskIndex(params, forecastHours, variance);
        const probability = this.calculateProbability(riskIndex);

        points.push({
          lat,
          lon,
          riskIndex,
          probability,
        });
      }
    }

    return points;
  }

  private static computeTornadoParameters(lat: number, lon: number) {
    const cape = 500 + this.pseudoRandom(lat, lon, 1) * 2500;
    const shear = 8 + Math.abs(this.pseudoRandom(lat, lon, 2)) * 45;
    const helicity = 60 + this.pseudoRandom(lat, lon, 3) * 260;

    return {
      cape: Math.round(cape),
      shear: Math.round(shear * 10) / 10,
      helicity: Math.round(helicity),
    };
  }

  private static calculateRiskIndex(
    parameters: { cape: number; shear: number; helicity: number },
    forecastHours: number,
    variance: number = 0
  ): number {
    const capeScore = Math.min(1, parameters.cape / 3000);
    const shearScore = Math.min(1, parameters.shear / 40);
    const helicityScore = Math.min(1, parameters.helicity / 350);

    let baseRisk = (capeScore * 0.5 + shearScore * 0.3 + helicityScore * 0.2) * 10;
    baseRisk += Math.min(2, (forecastHours / 72));
    baseRisk = baseRisk + variance;

    return Math.round(Math.max(0, Math.min(10, baseRisk)) * 10) / 10;
  }

  private static calculateProbability(riskIndex: number): number {
    const probability = Math.min(0.98, Math.max(0.03, (riskIndex / 10) * 0.92 + 0.04));
    return Math.round(probability * 100) / 100;
  }

  private static generateTornadoTimeline(
    lat: number,
    lon: number,
    forecastHours: number,
    parameters: { cape: number; shear: number; helicity: number }
  ): TornadoRiskTimelinePoint[] {
    const timeline: TornadoRiskTimelinePoint[] = [];
    const step = 3;

    for (let hour = 0; hour <= forecastHours; hour += step) {
      const decay = 1 - Math.min(0.75, hour / (forecastHours * 1.6));
      const hourVariance = (this.pseudoRandom(lat + hour, lon - hour, forecastHours) - 0.5) * 3;
      const adjustedParameters = {
        cape: parameters.cape * (0.9 + this.pseudoRandom(lat, lon, hour) * 0.2),
        shear: parameters.shear * (0.85 + this.pseudoRandom(lat, lon, hour + 1) * 0.25),
        helicity: parameters.helicity * (0.88 + this.pseudoRandom(lat, lon, hour + 2) * 0.3),
      };

      const riskIndex = this.calculateRiskIndex(adjustedParameters, forecastHours, hourVariance) * decay;
      const normalizedRisk = Math.round(Math.max(0, Math.min(10, riskIndex)) * 10) / 10;
      const probability = this.calculateProbability(normalizedRisk) * decay;

      timeline.push({
        hourOffset: hour,
        riskIndex: Math.round(normalizedRisk * 10) / 10,
        probability: Math.round(Math.max(0.02, Math.min(0.98, probability)) * 100) / 100,
      });
    }

    return timeline;
  }

  private static getRiskSummary(riskIndex: number): string {
    if (riskIndex < 2) {
      return 'Minimal tornado threat. Routine monitoring recommended.';
    }
    if (riskIndex < 4) {
      return 'Low-end risk. Keep an eye on forecast updates and radar trends.';
    }
    if (riskIndex < 6) {
      return 'Moderate risk. Ingredients are present for isolated severe storms.';
    }
    if (riskIndex < 8) {
      return 'Elevated risk. Organized severe storms capable of producing tornadoes are possible.';
    }
    return 'High risk. Conditions favor strong tornado development. Review safety plans immediately.';
  }

  private static pseudoRandom(lat: number, lon: number, seed: number): number {
    const x = Math.sin(lat * 12.9898 + lon * 78.233 + seed * 43758.5453) * 43758.5453;
    return x - Math.floor(x);
  }
}
