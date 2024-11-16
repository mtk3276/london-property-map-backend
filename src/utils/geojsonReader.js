const fs = require("fs");
const db = require("../db/dbConfig");
const { tableConfigs, lookupConfigs } = require("./geojsonReaderConfig");

const executeSchema = async (schemaPath, schemaName = "") => {
    try {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await db.query(schema);
        console.log(`${schemaName} schema executed successfully...`);
    } catch (error) {
        console.error(`Error executing ${schemaName} schema file:`, error);
        throw error;
    }
}

const importGeoJSONData = async (tableName, geojsonPath, tableColumnNames, dataColumns) => {
    try {
        const geoJsonData = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

        for (const feature of geoJsonData.features) {
            const { properties, geometry } = feature;

            const insertQuery = `
                INSERT INTO ${tableName} (
                ${tableColumnNames}
                ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ST_SetSRID(ST_GeomFromGeoJSON($11), 4326)
                )
                ON CONFLICT (global_id) DO NOTHING;
            `;

            const values = dataColumns.map(col => properties[col] || null);
            values.push(JSON.stringify(geometry));

            await db.query(insertQuery, values)
        }

        console.log('GeoJSON data imported successfully...');
    } catch (error) {
        console.error('Error importing GeoJSON data:', error);
        throw error;
    }
}

const createLondonLocalAuthoritiesTable = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS london_local_authorities AS
            SELECT *
            FROM local_authorities
            WHERE local_authorities.lad_cd LIKE 'E09%';
        `;

        await db.query(query);
        console.log("London local authorities table created and data successfully imported...")
    } catch (error) {
        console.error('Error creating london local authorities table:', error);
        throw error;
    }
}

const createWardToAuthoritiesReferenceTable = async () => {
    try {
        const query = `
            CREATE TEMP TABLE IF NOT EXISTS temp_ward_ref (
            WD24CD VARCHAR(10),
            WD24NM VARCHAR(255),
            WD24NMW VARCHAR(255),
            LAD24CD VARCHAR(10),
            LAD24NM VARCHAR(255),
            LAD24NMW VARCHAR(255),
            ObjectId INTEGER );

            COPY temp_ward_ref 
            FROM '${lookupConfigs.wardsToAuthorities.dataPath}' 
            WITH CSV HEADER;
            
            INSERT INTO london_ward_ref
            SELECT *
            FROM temp_ward_ref
            ON CONFLICT (ObjectId) DO NOTHING;

            DROP TABLE temp_ward_ref;
        `;

        await db.query(query);
        console.log("Wards to local authorities reference data successfully imported.");
    } catch (error) {
        console.error("Error importing data for wards to local authorities reference table:", error);
        throw error;
    }
}

const createLondonWardsTable = async () => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS london_wards (LIKE wards);
        `;

        await db.query(createTableQuery);
        console.log("London wards table successfully created...");

        const getWardsQuery = `
            INSERT INTO london_wards
            SELECT w.*
            FROM wards w
            JOIN london_ward_ref ref ON w.wd_cd = ref.wd24cd
            JOIN london_local_authorities la ON ref.lad24cd = la.lad_cd 
            ON CONFLICT (global_id) DO NOTHING;
            ;
        `;

        await db.query(getWardsQuery);
        console.log("Successfully imported london wards...");
    } catch (error) {
        console.log("Error creating London wards table:", error);
        throw error;
    }
}

const main = async () => {
    try {
        console.log('Connected to the database.');
        
        for (const { name, schemaPath, geojsonPath, columnNames, dataColumns } of tableConfigs) {
            await executeSchema(schemaPath, name);
            await importGeoJSONData(name, geojsonPath,columnNames, dataColumns);
        }

        // Create London local authorities table
        await createLondonLocalAuthoritiesTable();

        // Populate wards to authorities reference table

        // Populate London local authorities table

        // Populate London wards table
        await executeSchema(lookupConfigs.wardsToAuthorities.schemaPath, "wards to authorities reference");
        await createWardToAuthoritiesReferenceTable();

        // Create London wards table
        await createLondonWardsTable();
    } catch (error) {
        console.error('Error during database operations:', error);
    } finally {
        await db.end();
        console.log('Disconnected from the database.');
    }
};
  
// Run the main function
main();
