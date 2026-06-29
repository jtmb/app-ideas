import { Pool } from 'pg';
import config from '../config';

export interface Device {
  id: number;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'error';
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeviceInput {
  name: string;
  type: string;
  macAddress?: string;
  ipAddress?: string;
  firmwareVersion?: string;
}

export interface UpdateDeviceInput {
  name?: string;
  type?: string;
  status?: 'online' | 'offline' | 'error';
  macAddress?: string;
  ipAddress?: string;
  firmwareVersion?: string;
}

class DeviceModel {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: config.postgres.host,
      port: config.postgres.port,
      database: config.postgres.database,
      user: config.postgres.user,
      password: config.postgres.password,
      max: config.postgres.maxPoolSize,
      min: config.postgres.minPoolSize,
    });
  }

  async findById(id: number): Promise<Device | null> {
    const query = `SELECT id, name, type, status, last_seen_at as lastSeenAt, created_at as createdAt, updated_at as updatedAt FROM devices WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByName(name: string): Promise<Device | null> {
    const query = `SELECT id, name, type, status, last_seen_at as lastSeenAt, created_at as createdAt, updated_at as updatedAt FROM devices WHERE name = $1`;
    const result = await this.pool.query(query, [name]);
    return result.rows[0] || null;
  }

  async findOnline(): Promise<Device[]> {
    const query = `SELECT id, name, type, status, last_seen_at as lastSeenAt, created_at as createdAt, updated_at as updatedAt FROM devices WHERE status = 'online' ORDER BY last_seen_at DESC`;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async create(input: CreateDeviceInput): Promise<Device> {
    const query = `INSERT INTO devices (name, type, mac_address, ip_address, firmware_version, status, last_seen_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, 'online', NOW(), NOW(), NOW()) RETURNING id, name, type, status, last_seen_at as lastSeenAt, created_at as createdAt, updated_at as updatedAt`;
    const result = await this.pool.query(query, [input.name, input.type, input.macAddress, input.ipAddress, input.firmwareVersion]);
    return result.rows[0];
  }

  async update(id: number, input: UpdateDeviceInput): Promise<Device | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (input.name) { updates.push('name = $1'); values.push(input.name); }
    if (input.type) { updates.push('type = $1'); values.push(input.type); }
    if (input.status) { updates.push('status = $1'); values.push(input.status); }
    if (input.macAddress !== undefined) { updates.push('mac_address = $1'); values.push(input.macAddress); }
    if (input.ipAddress !== undefined) { updates.push('ip_address = $1'); values.push(input.ipAddress); }
    if (input.firmwareVersion !== undefined) { updates.push('firmware_version = $1'); values.push(input.firmwareVersion); }

    updates.push('last_seen_at = NOW(), updated_at = NOW()');
    values.push(id);

    const query = `UPDATE devices SET ${updates.join(', ')} WHERE id = $1 RETURNING id, name, type, status, last_seen_at as lastSeenAt, created_at as createdAt, updated_at as updatedAt`;
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM devices WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rowCount !== 0;
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ devices: Device[]; total: number }> {
    const offset = (page - 1) * limit;
    const countQuery = 'SELECT COUNT(*) FROM devices';
    const countResult = await this.pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count, 10);

    const query = `SELECT id, name, type, status, last_seen_at as lastSeenAt, created_at as createdAt, updated_at as updatedAt FROM devices ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    const result = await this.pool.query(query, [limit, offset]);

    return { devices: result.rows, total };
  }

  async markOffline(id: number): Promise<Device | null> {
    const query = `UPDATE devices SET status = 'offline', last_seen_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING id, name, type, status, last_seen_at as lastSeenAt, created_at as createdAt, updated_at as updatedAt`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByType(type: string): Promise<Device[]> {
    const query = `SELECT id, name, type, status, last_seen_at as lastSeenAt, created_at as createdAt, updated_at as updatedAt FROM devices WHERE type = $1 ORDER BY name ASC`;
    const result = await this.pool.query(query, [type]);
    return result.rows;
  }
}

export default new DeviceModel();