const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const db = require("../db/dbConfig");

const csvFilePath = path.join(__dirname, "../../data/pp-2023.csv");
const tableName = "properties";
const sequenceName = "properties_id_seq";
const batchSize = 100;
const rows = [];

async function clearTable() {
    await db.query(`TRUNCATE TABLE ${tableName}`);
    await db.query(`ALTER SEQUENCE ${sequenceName} RESTART WITH 1`);
}

// insertBatch takes in a batch of rows, batch, from the dataset 
async function insertBatch(batch) {
    const values = [];

    // create an array of indices then join into string and populate values array with batch data.
    const placeholders = batch.map((_, index) => {
        // use offset to create a string of values indices for the sql query
        const offset = index * 5;
        // for each row in batch, push to values
        values.push(batch[index].price_paid, batch[index].postcode, batch[index].city, batch[index].latitude, batch[index].longitude);
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
    }).join(', ');

    const query = `
        INSERT INTO ${tableName} (price_paid, postcode, city, latitude, longitude) VALUES ${placeholders}
    `;

    try {
        // store batch of data
        await db.query(query, values);
    } catch (error) {
        console.error("Error inserting batch: ", error);
    }
}

async function processCsvFile() {
    // clear the table
    await clearTable();
    console.log("Table cleared:", tableName);

    fs.createReadStream(csvFilePath)
        .pipe(csv({ headers: false }))
        .on('data', async (row) => {
            // Extract and validate relevant data
            const price_paid = row[1]?.trim();
            const postcode = row[3]?.trim();
            const city = row[13]?.trim();
            const latitude = 51.5074;
            const longitude = -0.1278;

            // Only proceed if data is valid
            if (!isNaN(price_paid) && postcode && city) {
                // Add data to rows
                rows.push({ price_paid, postcode, city, latitude, longitude });

                // If we have enough rows, insert the batch
                if (rows.length >= batchSize) {
                    insertBatch(rows.slice());
                    rows.length = 0;
                }
            }
        })
        .on('end', async () => {
            // Insert any remaining rows
            if (rows.length > 0) {
                await insertBatch(rows);
            }
            console.log("CSV file has been processed");
            await db.end();
        });
}

processCsvFile();
