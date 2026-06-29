# Database Migrations

This directory contains PostgreSQL migration files for the PawPrint Tracker application.

## Migration Order

Migrations must be run in sequential order:

1. `001_create_pets_table.sql` - Creates pets table with indexes
2. `002_create_owners_table.sql` - Creates owners table with indexes

## Running Migrations

### Using psql directly:

```bash
psql -U postgres -d pawprint_tracker -f 001_create_pets_table.sql
psql -U postgres -d pawprint_tracker -f 002_create_owners_table.sql
```

### Using docker-compose (if configured):

```bash
docker-compose exec postgres psql -U postgres -d pawprint_tracker -f 001_create_pets_table.sql
docker-compose exec postgres psql -U postgres -d pawprint_tracker -f 002_create_owners_table.sql
```

## Schema Overview

### pets table
- Core pet information (name, species, breed, age, etc.)
- Owner relationship via foreign key
- Medical identifiers (microchip, rabies tag)
- Status tracking (is_active flag)

### owners table
- Owner personal information
- Contact details (email, phone, address)
- Emergency contact information
- Status tracking (is_active flag)

## Indexes

All migrations include appropriate indexes for common query patterns:
- Foreign key relationships
- Active/inactive filtering
- Date-based queries
- Search optimization