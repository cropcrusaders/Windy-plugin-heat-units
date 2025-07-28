import type { HeatUnitData } from './types';

export class WindyDataAdapter {
  /**
   * Extract temperature data from Windy's weather API
   */
  static async getTemperatureData(lat: number, lon: number, days: number = 30): Promise<HeatUnitData> {
    try {
      // Access Windy's picker for point data
      const picker = (window as any).W?.picker;
      if (!picker) throw new Error('Windy picker not available');

      // Get current weather data
      const data = picker.getPickerData();

      // In a real implementation, you would:
      // 1. Use Windy's API to get historical temperature data
      // 2. Access temperature forecasts
      // 3. Extract min/max temperatures for the specified period

      // Mock data for demonstration
      const mockTemperatureData = this.generateMockTemperatureData(lat, lon, days);

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
  private static generateMockTemperatureData(lat: number, lon: number, days: number) {
    const now = new Date();
    const dailyGDD: number[] = [];
    const minTemps: number[] = [];
    const maxTemps: number[] = [];
    let totalGDD = 0;

    // Base temperature varies by latitude
    const baseTemp = 10; // Corn base temperature
    const seasonalVariation = Math.sin((new Date().getMonth() - 3) * Math.PI / 6) * 10;
    const latitudeEffect = (50 - Math.abs(lat)) * 0.5;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate realistic temperature range
      const dayOfYear = date.getDay();
      const randomVariation = (Math.random() - 0.5) * 8;

      const avgTemp = 15 + seasonalVariation + latitudeEffect + randomVariation;
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

        const gdd = Math.max(0, (300 + seasonalFactor * 200 + latitudeFactor * 100 + randomFactor * 100));

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
}
