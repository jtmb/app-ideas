import { Client } from 'influxdb-client';
import { InfluxDBConfig } from '../types/config-types';

const INFLUXDB_URL = process.env.INFLUXDB_URL || 'http://localhost:8086';
const INFLUXDB_TOKEN = process.env.INFLUXDB_TOKEN || '';
const INFLUXDB_ORG = process.env.INFLUXDB_ORG || 'ecohome';
const INFLUXDB_BUCKET = process.env.INFLUXDB_BUCKET || 'energy_metrics';

export function createInfluxDBClient(): Client {
  if (!INFLUXDB_TOKEN) {
    throw new Error('INFLUXDB_TOKEN environment variable is required');
  }

  return new Client(INFLUXDB_URL, INFLUXDB_TOKEN);
}

export function ensureBucketExists(client: Client): Promise<void> {
  return new Promise((resolve, reject) => {
    const api = client.api;
    
    api.bucketsPost({
      org: INFLUXDB_ORG,
      bucket: INFLUXDB_BUCKET,
    }, (err, result) => {
      if (err) {
        // Bucket already exists or other error - check if it's a 409 conflict
        if (err.code === 409 || err.message.includes('already exists')) {
          console.log(`Bucket "${INFLUXDB_BUCKET}" already exists in org "${INFLUXDB_ORG}"`);
          resolve();
        } else {
          reject(err);
        }
      } else {
        console.log(`Created bucket "${INFLUXDB_BUCKET}" in org "${INFLUXDB_ORG}"`);
        resolve();
      }
    });
  });
}

export function getBucketName(): string {
  return INFLUXDB_BUCKET;
}

export function getOrgName(): string {
  return INFLUXDB_ORG;
}

// Configuration object for easy access
export const influxdbConfig: InfluxDBConfig = {
  url: INFLUXDB_URL,
  token: INFLUXDB_TOKEN,
  org: INFLUXDB_ORG,
  bucket: INFLUXDB_BUCKET,
};