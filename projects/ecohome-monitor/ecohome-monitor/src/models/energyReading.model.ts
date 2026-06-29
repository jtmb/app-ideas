import { Point, Buckets } from 'influxdb-client';
import config from '../config';

export interface EnergyReading {
  id: number;
  deviceId: number;
  deviceName: string;
  timestamp: Date;
  energyKwh: number;
  powerWatts: number;
}

class EnergyReadingModel {
  private influxdbClient: any;

  constructor() {
    this.influxdbClient = new (require('influxdb-client').InfluxDBClient)({
      url: config.influxdb.url,
      token: config.influxdb.token,
      org: config.influxdb.organization,
    });
  }

  /**
   * Write energy reading to InfluxDB
   */
  async writeReading(deviceId: number, deviceName: string, energyKwh: number, powerWatts: number): Promise<void> {
    const bucket = this.influxdbClient.bucket(config.influxdb.bucket);
    
    const point = new Point('energy_readings')
      .tag('device_id', String(deviceId))
      .tag('device_name', deviceName)
      .field('energy_kwh', energyKwh)
      .field('power_watts', powerWatts)
      .time(new Date().toISOString());

    await bucket.writePoint(point);
  }

  /**
   * Get average energy consumption for a device over a time period
   */
  async getAverageConsumption(deviceId: number, startTime: Date, endTime: Date): Promise<number> {
    const query = `
      FROM ${config.influxdb.bucket}
      WHERE device_id = '${deviceId}' 
        AND time >= '${startTime.toISOString()}' 
        AND time < '${endTime.toISOString()}'
      GROUP BY time(1h)
      FILL(null)
    `;

    const reader = this.influxdbClient.queryRows(query, (row: any, _index: number) => {
      return row.get('energy_kwh');
    });

    let total = 0;
    let count = 0;
    for await (const value of reader) {
      if (value !== null && value !== undefined) {
        total += Number(value);
        count++;
      }
    }

    return count > 0 ? total / count : 0;
  }

  /**
   * Get energy consumption trend for a device
   */
  async getConsumptionTrend(deviceId: number, hours: number = 24): Promise<number[]> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

    const query = `
      FROM ${config.influxdb.bucket}
      WHERE device_id = '${deviceId}' 
        AND time >= '${startTime.toISOString()}' 
        AND time < '${endTime.toISOString()}'
      GROUP BY time(1h)
      FILL(null)
    `;

    const reader = this.influxdbClient.queryRows(query, (row: any, _index: number) => {
      return row.get('energy_kwh');
    });

    const values: number[] = [];
    for await (const value of reader) {
      if (value !== null && value !== undefined) {
        values.push(Number(value));
      } else {
        values.push(0);
      }
    }

    return values;
  }

  /**
   * Get total energy consumption for a device over a time period
   */
  async getTotalConsumption(deviceId: number, startTime: Date, endTime: Date): Promise<number> {
    const query = `
      FROM ${config.influxdb.bucket}
      WHERE device_id = '${deviceId}' 
        AND time >= '${startTime.toISOString()}' 
        AND time < '${endTime.toISOString()}'
      FILL(null)
    `;

    const reader = this.influxdbClient.queryRows(query, (row: any, _index: number) => {
      return row.get('energy_kwh');
    });

    let total = 0;
    for await (const value of reader) {
      if (value !== null && value !== undefined) {
        total += Number(value);
      }
    }

    return total;
  }

  /**
   * Get peak power consumption for a device over a time period
   */
  async getPeakPower(deviceId: number, startTime: Date, endTime: Date): Promise<number> {
    const query = `
      FROM ${config.influxdb.bucket}
      WHERE device_id = '${deviceId}' 
        AND time >= '${startTime.toISOString()}' 
        AND time < '${endTime.toISOString()}'
      FILL(null)
    `;

    const reader = this.influxdbClient.queryRows(query, (row: any, _index: number) => {
      return row.get('power_watts');
    });

    let peak = 0;
    for await (const value of reader) {
      if (value !== null && value !== undefined) {
        const watts = Number(value);
        if (watts > peak) {
          peak = watts;
        }
      }
    }

    return peak;
  }
}

export default new EnergyReadingModel();