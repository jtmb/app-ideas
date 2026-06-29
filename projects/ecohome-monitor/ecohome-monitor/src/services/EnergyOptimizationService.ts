import { EnergyData } from '../types/energy';
import { DeviceUsagePattern } from '../types/device';

export interface OptimizationRecommendation {
  deviceId: string;
  deviceName: string;
  currentUsage: number;
  recommendedUsage: number;
  potentialSavings: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UsagePatternAnalysis {
  peakHours: number[];
  averageDailyUsage: number;
  usageTrend: 'increasing' | 'decreasing' | 'stable';
  efficiencyScore: number;
}

class EnergyOptimizationService {
  private readonly BASELINE_USAGE = 0.5; // kWh per hour baseline

  analyzeUsagePatterns(
    energyData: EnergyData[],
    deviceName: string
  ): UsagePatternAnalysis {
    const deviceData = energyData.filter(
      (data) => data.deviceId === deviceName
    );

    if (deviceData.length === 0) {
      return {
        peakHours: [],
        averageDailyUsage: 0,
        usageTrend: 'stable',
        efficiencyScore: 100,
      };
    }

    const hourlyUsage = new Map<number, number>();
    deviceData.forEach((data) => {
      const hour = data.timestamp.getHours();
      const current = hourlyUsage.get(hour) || 0;
      hourlyUsage.set(hour, current + data.usage);
    });

    const peakHours: number[] = [];
    let maxUsage = 0;
    hourlyUsage.forEach((usage, hour) => {
      if (usage > maxUsage) {
        maxUsage = usage;
        peakHours.push(hour);
      }
    });

    const totalUsage = deviceData.reduce((sum, data) => sum + data.usage, 0);
    const averageDailyUsage = totalUsage / Math.max(1, deviceData.length);

    const firstHalfUsage = deviceData.slice(0, Math.floor(deviceData.length / 2));
    const secondHalfUsage = deviceData.slice(Math.ceil(deviceData.length / 2));
    const firstAvg = firstHalfUsage.reduce((sum, d) => sum + d.usage, 0) / Math.max(1, firstHalfUsage.length);
    const secondAvg = secondHalfUsage.reduce((sum, d) => sum + d.usage, 0) / Math.max(1, secondHalfUsage.length);

    let usageTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (secondAvg > firstAvg * 1.1) {
      usageTrend = 'increasing';
    } else if (secondAvg < firstAvg * 0.9) {
      usageTrend = 'decreasing';
    }

    const efficiencyScore = Math.min(100, Math.max(0, 100 - (averageDailyUsage - this.BASELINE_USAGE) * 20));

    return {
      peakHours,
      averageDailyUsage,
      usageTrend,
      efficiencyScore: Math.round(efficiencyScore),
    };
  }

  generateRecommendations(
    energyData: EnergyData[],
    deviceName: string
  ): OptimizationRecommendation[] {
    const analysis = this.analyzeUsagePatterns(energyData, deviceName);
    const recommendations: OptimizationRecommendation[] = [];

    if (analysis.usageTrend === 'increasing') {
      recommendations.push({
        deviceId: deviceName,
        deviceName: deviceName,
        currentUsage: analysis.averageDailyUsage,
        recommendedUsage: analysis.averageDailyUsage * 0.85,
        potentialSavings: analysis.averageDailyUsage * 0.15,
        reason: 'Usage is increasing - consider scheduling during off-peak hours',
        priority: 'high',
      });
    }

    if (analysis.efficiencyScore < 70) {
      recommendations.push({
        deviceId: deviceName,
        deviceName: deviceName,
        currentUsage: analysis.averageDailyUsage,
        recommendedUsage: analysis.averageDailyUsage * 0.8,
        potentialSavings: analysis.averageDailyUsage * 0.2,
        reason: 'Low efficiency score - optimize usage patterns',
        priority: 'medium',
      });
    }

    if (analysis.peakHours.length > 0) {
      recommendations.push({
        deviceId: deviceName,
        deviceName: deviceName,
        currentUsage: analysis.averageDailyUsage,
        recommendedUsage: analysis.averageDailyUsage * 0.9,
        potentialSavings: analysis.averageDailyUsage * 0.1,
        reason: `Peak usage at hours ${analysis.peakHours.join(', ')} - shift to off-peak`,
        priority: 'low',
      });
    }

    return recommendations;
  }

  calculateOptimalSchedule(
    energyData: EnergyData[],
    deviceName: string,
    targetUsage: number
  ): { startHour: number; endHour: number; duration: number } | null {
    const analysis = this.analyzeUsagePatterns(energyData, deviceName);

    if (analysis.peakHours.length === 0) {
      return null;
    }

    const sortedPeakHours = [...analysis.peakHours].sort((a, b) => a - b);
    const offPeakHours = Array.from({ length: 24 }, (_, i) => i).filter(
      (hour) => !sortedPeakHours.includes(hour)
    );

    if (offPeakHours.length === 0) {
      return null;
    }

    const optimalStart = offPeakHours[0];
    const duration = Math.ceil(targetUsage / 0.3);

    return {
      startHour: optimalStart,
      endHour: (optimalStart + duration) % 24,
      duration,
    };
  }
}

export const energyOptimizationService = new EnergyOptimizationService();
import { EnergyReading } from "../types";
import { Device } from "../types";
import { OptimizationRecommendation } from "../types/recommendations";

/**
 * EnergyOptimizationService - Analyzes energy usage patterns and provides optimization recommendations
 */
export class EnergyOptimizationService {
  private readonly ANALYSIS_WINDOW_HOURS = 24;
  private readonly PREDICTION_CONFIDENCE_THRESHOLD = 0.7;

  /**
   * Analyze historical energy data to identify usage patterns
   * @param energyData Array of energy consumption data points
   * @param devices Array of connected devices
   * @returns Pattern analysis results
   */
  analyzeUsagePatterns(energyData: EnergyReading[], devices: Device[]): {
    peakHours: number[];
    averageConsumptionByHour: Record<number, number>;
    deviceEfficiencyScores: Record<string, number>;
    anomalyDetected: boolean;
    anomalies: Array<{ timestamp: Date; deviation: number; reason: string }>;
  } {
    if (energyData.length === 0) {
      return {
        peakHours: [],
        averageConsumptionByHour: {},
        deviceEfficiencyScores: {},
        anomalyDetected: false,
        anomalies: [],
      };
    }

    // Calculate hourly averages
    const hourlyConsumption = new Array(24).fill(0);
    let totalDataPoints = 0;

    energyData.forEach((point) => {
      const hour = point.timestamp.getHours();
      hourlyConsumption[hour] += point.consumptionKwh;
      totalDataPoints++;
    });

    const averageByHour: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      averageByHour[i] = hourlyConsumption[i] / totalDataPoints;
    }

    // Identify peak hours (top 3 hours with highest consumption)
    const sortedHours = Object.entries(averageByHour)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const peakHours: number[] = sortedHours.map(([hour]) => parseInt(hour));

    // Calculate device efficiency scores based on usage patterns
    const deviceEfficiencyScores: Record<string, number> = {};
    devices.forEach((device) => {
      const deviceData = energyData.filter(
        (point) => point.deviceId === device.id
      );

      if (deviceData.length > 0) {
        const avgConsumption = deviceData.reduce((sum, p) => sum + p.consumptionKwh, 0) / deviceData.length;
        
        // Efficiency score: lower consumption relative to rated power = higher efficiency
        const ratedPowerWatts = device.metadata?.ratedPowerWatts || 100;
        const efficiencyScore = Math.max(0, Math.min(100, (ratedPowerWatts - avgConsumption * 1000) / ratedPowerWatts * 100));
        
        deviceEfficiencyScores[device.id] = parseFloat(efficiencyScore.toFixed(2));
      } else {
        deviceEfficiencyScores[device.id] = 50;
      }
    });

    // Detect anomalies (consumption > 3 standard deviations from mean)
    const meanConsumption = energyData.reduce((sum, p) => sum + p.consumptionKwh, 0) / energyData.length;
    const variance = energyData.reduce((sum, p) => sum + Math.pow(p.consumptionKwh - meanConsumption, 2), 0) / energyData.length;
    const stdDev = Math.sqrt(variance);

    const anomalies: Array<{ timestamp: Date; deviation: number; reason: string }> = [];
    let anomalyDetected = false;

    energyData.forEach((point) => {
      if (stdDev > 0 && point.consumptionKwh > meanConsumption + 3 * stdDev) {
        const deviation = ((point.consumptionKwh - meanConsumption) / meanConsumption) * 100;
        anomalies.push({
          timestamp: new Date(point.timestamp),
          deviation: parseFloat(deviation.toFixed(2)),
          reason: `Consumption ${deviation.toFixed(1)}%% above average`,
        });
        anomalyDetected = true;
      }
    });

    return {
      peakHours,
      averageConsumptionByHour,
      deviceEfficiencyScores,
      anomalyDetected,
      anomalies,
    };
  }
