# EcoHome Monitor — Smart Energy Management System

A comprehensive IoT-based energy monitoring and management platform that tracks real-time energy consumption, provides predictive analytics, and enables smart home automation for sustainable living.

## Features Overview

### Core Capabilities

- **Real-Time Energy Monitoring**
  - Live dashboard displaying current power consumption across all connected devices
  - Historical data visualization with customizable time ranges (1h, 24h, 7d, 30d)
  - Instant alerts for abnormal energy spikes or device malfunctions

- **Predictive Analytics**
  - ML-powered energy usage forecasting based on historical patterns
  - Cost optimization recommendations and savings projections
  - Anomaly detection for unusual consumption behaviors

- **Smart Device Integration**
  - Support for major IoT protocols (MQTT, Zigbee, Z-Wave)
  - Automated device control via REST API
  - Scene-based automation (e.g., Away Mode, Eco Mode)

- **Multi-Tenant Architecture**
  - User accounts with role-based access control (Admin, Member, Guest)
  - Private data isolation between tenants
  - Scalable cloud deployment ready

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Language | TypeScript | Type-safe development across frontend and backend |
| Backend | Node.js + Express | RESTful API for real-time energy data endpoints |
| Frontend | React.js | Responsive dashboard with Chart.js visualizations |
| Database (Relational) | PostgreSQL | User accounts, device metadata, billing information |
| Database (Time-Series) | InfluxDB | High-frequency energy consumption metrics |
| Containerization | Docker + Docker Compose | Local development and production deployment

## Prerequisites

Before running this project, ensure you have the following installed:

- Node.js >= 18.x (LTS recommended)
- npm or yarn package manager
- Docker >= 20.x (for containerized deployment)
- Git for version control

## Quick Start

### Option 1: Docker Compose (Recommended)



### Option 2: Local Development



## Project Structure


## API Endpoints

### Energy Data (GET /api/v1/energy)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/energy/current | Get current power consumption |
| GET | /api/v1/energy/history | Retrieve historical energy data |
| POST | /api/v1/energy/predict | Generate usage predictions |

### Device Management (GET /api/v1/devices)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/devices | List all connected devices |
| GET | /api/v1/devices/:id | Get device details |
| PUT | /api/v1/devices/:id | Update device settings |
| DELETE | /api/v1/devices/:id | Remove device |

### Authentication (POST /api/v1/auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/login | User authentication |
| POST | /api/v1/auth/register | Create new account |
| GET | /api/v1/auth/me | Get current user profile |

## Testing

### Run All Tests



### Test Coverage

