import type { CalculationSettings } from './types';

export class HeatUnitCalculator {
  /**
   * Calculate Growing Degree Days using the simple average method
  */
  static calculateSimpleGDD(tMin: number, tMax: number, baseTemp: number, upperTemp?: number): number {
    // Apply upper threshold if specified
    const adjustedMax = upperTemp ? Math.min(tMax, upperTemp) : tMax;
    const adjustedMin = Math.max(tMin, baseTemp);
    const adjustedAvg = (adjustedMin + adjustedMax) / 2;

    return Math.max(0, adjustedAvg - baseTemp);
  }

  /**
   * Calculate GDD using the modified method (no negative values)
   */
  static calculateModifiedGDD(tMin: number, tMax: number, baseTemp: number, upperTemp?: number): number {
    const adjustedMin = Math.max(tMin, baseTemp);
    const adjustedMax = upperTemp ? Math.min(tMax, upperTemp) : tMax;

    if (adjustedMax < baseTemp) return 0;

    const avgTemp = (adjustedMin + adjustedMax) / 2;
    return Math.max(0, avgTemp - baseTemp);
  }

  /**
   * Calculate GDD using the double-sine method (most accurate)
   */
  static calculateDoubleSineGDD(tMin: number, tMax: number, baseTemp: number, upperTemp?: number): number {
    // Simplified double-sine approximation
    // In a real implementation, this would use more complex sine wave calculations
    const avgTemp = (tMin + tMax) / 2;
    const tempRange = (tMax - tMin) / 2;

    // Apply thresholds
    const effectiveMin = Math.max(tMin, baseTemp);
    const effectiveMax = upperTemp ? Math.min(tMax, upperTemp) : tMax;

    if (effectiveMax <= baseTemp) return 0;

    // Approximation of sine wave integration
    const clippedRange = Math.max(0, tempRange - Math.max(0, baseTemp - effectiveMin));
    const sineAdjustment = clippedRange / Math.PI;
    const adjustedAvg = Math.min(effectiveMax, avgTemp + sineAdjustment);
    return Math.max(0, adjustedAvg - baseTemp);
  }

  /**
   * Calculate accumulated GDD for a time series
   */
  static calculateAccumulatedGDD(
    temperatureData: Array<{date: Date, tMin: number, tMax: number}>,
    settings: CalculationSettings
  ): number[] {
    const gddValues: number[] = [];
    let accumulated = 0;

    for (const data of temperatureData) {
      let dailyGDD = 0;

      switch (settings.method) {
        case 'simple':
          dailyGDD = this.calculateSimpleGDD(data.tMin, data.tMax, settings.baseTemp, settings.upperTemp);
          break;
        case 'modified':
          dailyGDD = this.calculateModifiedGDD(data.tMin, data.tMax, settings.baseTemp, settings.upperTemp);
          break;
        case 'double-sine':
          dailyGDD = this.calculateDoubleSineGDD(data.tMin, data.tMax, settings.baseTemp, settings.upperTemp);
          break;
      }

      accumulated += dailyGDD;
      gddValues.push(accumulated);
    }

    return gddValues;
  }

  /**
   * Estimate crop development stage based on accumulated GDD
   */
  static getCropStage(accumulatedGDD: number, totalRequired: number): string {
    const percentage = (accumulatedGDD / totalRequired) * 100;

    if (percentage < 10) return 'Planting/Emergence';
    if (percentage < 25) return 'Early Vegetative';
    if (percentage < 50) return 'Late Vegetative';
    if (percentage < 75) return 'Reproductive';
    if (percentage < 90) return 'Grain Filling';
    if (percentage < 100) return 'Maturity';
    return 'Harvest Ready';
  }

  /**
   * Calculate days to maturity based on current GDD accumulation rate
   */
  static estimateDaysToMaturity(
    currentGDD: number,
    targetGDD: number,
    recentDailyAverage: number
  ): number {
    if (currentGDD >= targetGDD) return 0;
    if (recentDailyAverage <= 0) return Infinity;

    return Math.ceil((targetGDD - currentGDD) / recentDailyAverage);
  }
}
