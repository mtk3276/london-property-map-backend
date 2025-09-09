const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const db = require("../db/dbConfig");

function readCsv(filename, year) {
    const csvFilePath = path.join(__dirname, `../../data/${filename}`);
    const tableName = `properties_${year}`;
    const batchSize = 100;
    const rows = [];

    async function createTable() {
        await db.query(`CREATE TABLE IF NOT EXISTS ${tableName} (
            id SERIAL PRIMARY KEY,
            price_paid NUMERIC(15, 2) NOT NULL,
            postcode VARCHAR(10) NOT NULL,
            city VARCHAR(255) NOT NULL,
            latitude NUMERIC(9, 6),
            longitude NUMERIC(9, 6)
            );
        `)
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
        // create the table
        await createTable();
        
        fs.createReadStream(csvFilePath)
            .pipe(csv({ headers: false }))
            .on('data', async (row) => {
                // Extract and validate relevant data
                const price_paid = row[1]?.trim();
                const postcode = row[3]?.trim();
                const city = row[13]?.trim();
                const latitude = null;
                const longitude = null;

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
                console.log(`Price Paid ${year} CSV file has been processed`);
                await db.end();
            });
    }

    processCsvFile();
}

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Please provide the path to the CSV file.');
  process.exit(1);
}

const filename = args[0];
const year = args[1];

readCsv(filename, year);