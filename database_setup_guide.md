# Complete Database Setup Guide: PostGIS & Restore

## Overview
This guide walks you through setting up PostGIS in your Neon database and restoring your data dump.

## Prerequisites
- Neon database connection details in `.env` file
- `pg_dump` and `pg_restore` tools installed
- Database dump file (`partial_dump.dump`)

## Step 1: Verify Database Connection

First, let's test your connection:

```bash
# Test connection
node -e "
const client = require('./src/db/dbConfig.js');
client.query('SELECT version();')
  .then(result => {
    console.log('✅ Connected to:', result.rows[0].version);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
"
```

## Step 2: Set Up PostGIS Extension

PostGIS is required for geometry operations. Run this in your Neon SQL console or via psql:

```sql
-- Create PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS installation
SELECT PostGIS_Version();

-- Check available spatial reference systems
SELECT COUNT(*) FROM spatial_ref_sys;
```

## Step 3: Clear Existing Data (if needed)

If you need to start fresh:

```sql
-- Drop all tables (be careful!)
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS local_authorities CASCADE;
DROP TABLE IF EXISTS regions CASCADE;
DROP TABLE IF EXISTS wards CASCADE;
DROP TABLE IF EXISTS ward_to_authorities_ref CASCADE;
```

## Step 4: Create Database Schema

Run all your schema files to create the table structure:

```bash
# Create all tables
psql $DATABASE_URL -f src/db/schema.sql
psql $DATABASE_URL -f src/db/regionBoundariesSchema.sql
psql $DATABASE_URL -f src/db/localAuthorityBoundariesSchema.sql
psql $DATABASE_URL -f src/db/wardBoundariesSchema.sql
psql $DATABASE_URL -f src/db/wardToAuthoritiesRefSchema.sql
```

Or using Node.js:

```bash
node -e "
const client = require('./src/db/dbConfig.js');
const fs = require('fs');

async function createTables() {
  const schemas = [
    'src/db/schema.sql',
    'src/db/regionBoundariesSchema.sql', 
    'src/db/localAuthorityBoundariesSchema.sql',
    'src/db/wardBoundariesSchema.sql',
    'src/db/wardToAuthoritiesRefSchema.sql'
  ];
  
  for (const schema of schemas) {
    try {
      const sql = fs.readFileSync(schema, 'utf8');
      await client.query(sql);
      console.log('✅ Created tables from:', schema);
    } catch (err) {
      console.error('❌ Error with', schema, ':', err.message);
    }
  }
  process.exit(0);
}
createTables();
"
```

## Step 5: Restore from Dump

Now restore your data from the dump file:

```bash
# Method 1: Using pg_restore (recommended)
pg_restore --verbose --clean --no-acl --no-owner -h YOUR_HOST -U YOUR_USER -d YOUR_DB partial_dump.dump

# Method 2: Using environment variables from .env
export $(grep -v '^#' .env | xargs)
pg_restore --verbose --clean --no-acl --no-owner -h $DB_HOST -U $DB_USER -d $DB_NAME partial_dump.dump
```

## Step 6: Verify Restore

Check that your data was restored correctly:

```bash
node -e "
const client = require('./src/db/dbConfig.js');

async function verifyRestore() {
  const tables = ['properties', 'local_authorities', 'regions', 'wards'];
  
  console.log('📊 Table verification:');
  for (const table of tables) {
    try {
      const result = await client.query(\`SELECT COUNT(*) FROM \${table}\`);
      console.log(\`  \${table}: \${result.rows[0].count} rows\`);
    } catch (err) {
      console.log(\`  \${table}: ❌ \${err.message}\`);
    }
  }
  
  // Check PostGIS functions work
  try {
    const geoTest = await client.query('SELECT ST_AsText(ST_Point(0, 0));');
    console.log('✅ PostGIS working:', geoTest.rows[0].st_astext);
  } catch (err) {
    console.log('❌ PostGIS error:', err.message);
  }
  
  process.exit(0);
}
verifyRestore();
"
```

## Troubleshooting

### Connection Issues
- Check your `.env` file has correct Neon credentials
- Ensure your IP is allowlisted in Neon console
- Verify SSL settings

### PostGIS Issues
- PostGIS must be installed before restoring geometry data
- Check Neon supports PostGIS (it should)
- Verify SRID 4326 exists: `SELECT * FROM spatial_ref_sys WHERE srid = 4326;`

### Restore Issues
- Use `--clean` flag to drop existing objects
- Use `--no-owner` and `--no-acl` for cross-database restores
- Check dump file integrity: `pg_restore --list partial_dump.dump`

### Storage Issues
- Monitor your Neon storage usage
- Consider importing only London data for development
- Use sampling for large datasets

## Next Steps

After successful restore:
1. Test your API endpoints
2. Verify geometry queries work
3. Check data integrity
4. Set up regular backups
