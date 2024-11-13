const axios = require("axios");
const db = require("../db/dbConfig");

async function fetchLatLong(postcode) {
    try { 
        // ? what is encode URI component?
        const response = await axios.get(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
        if (response.data.status === 200) {
            const { latitude, longitude } = response.data.result;
            return { latitude, longitude };
        } else {
            console.error(`Error fetching lat/long for postcode ${postcode}`, response.data.error);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching lat/long for postcode ${postcode}`, error/message);
        return null;
    }
}

async function updateLatLong() {
    try {
        const res = await db.query("SELECT id, postcode FROM properties WHERE latitude IS NULL OR longitude IS NULL LIMIT 100");

        for (const row of res.rows) {
            const { id, postcode } = row;
            const latLong = await fetchLatLong(postcode);

            if (latLong) {
                await db.query(
                    "UPDATE properties SET latitude = $1, longitude = $2 WHERE id = $3", 
                    [latLong.latitude, latLong.longitude, id]
                );
                console.log(`Updated property ${id} with lat: ${latLong.latitude}, long: ${latLong.longitude}`);
            }
        }
    } catch (error) {
        console.error("Error updating lat/long:", error);
    } finally {
        await db.end();
    }
}

updateLatLong();