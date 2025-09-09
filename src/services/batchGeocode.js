const axios = require("axios");
const db = require("../db/dbConfig");

async function fetchBatchLatLong(postcodes) {
    console.log("Fetching latitudes and longitudes...");
    try {
        const response = await axios.post("https://api.postcodes.io/postcodes", {
            postcodes: postcodes
        });

        const results = {};
        
        // Process each result in the response
        response.data.result.forEach((entry) => {
            if (entry.result && entry.result.latitude && entry.result.longitude) {
                const { postcode, latitude, longitude } = entry.result;
                results[postcode] = { latitude, longitude };
            } else {
                console.warn(`No data for postcode: ${entry?.query || 'Unknown'}`);
            }
        });

        return results;
    } catch (error) {
        console.error("Error fetching batch lat/long:", error.message);
        return null;
    }
}

async function updateLatLongBatch(tableName) {
    try {
        console.log("Connecting to database...");
        const res = await db.query(`SELECT id, postcode FROM ${tableName} WHERE latitude IS NULL OR longitude IS NULL LIMIT 10000`);
        
        console.log(`Fetched ${res.rows.length} rows from the database`);

        if (res.rows.length === 0) {
            console.log("No rows to update.");
            return; // Exit if there's nothing to process
        }

        for (let i = 0; i < res.rows.length; i += 100) {
            const batch = res.rows.slice(i, i + 100);
            const postcodes = batch.map(row => row.postcode);

            const latLongData = await fetchBatchLatLong(postcodes);
            if (!latLongData) {
                console.log("No data returned from API for this batch.");
                continue; // Skip if there's an issue with this batch
            }

            for (const row of batch) {
                const { id, postcode } = row;
                const latLong = latLongData[postcode];
                
                if (latLong) {
                    await db.query(
                        `UPDATE ${tableName} SET latitude = $1, longitude = $2 WHERE id = $3`,
                        [latLong.latitude, latLong.longitude, id]
                    );
                    console.log(`Updated property ${id} from ${tableName} with lat: ${latLong.latitude}, long: ${latLong.longitude}`);
                } else {
                    console.log(`No lat/long data for postcode ${postcode}`);
                }
            }
        }
    } catch (error) {
        console.error("Error updating lat/long in batch:", error);
    } finally {
        await db.end();
        console.log("Database connection closed.");
    }
}

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Please provide the table name.');
  process.exit(1);
}

const tableName = args[0];

// Run the batch update function
updateLatLongBatch(tableName);
