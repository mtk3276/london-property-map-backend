const db = require("../db/dbConfig"); // Import your existing DB client

// Utility function to update the average price for a region
const updateRegionAvgPrice = async () => {
  const query = `
    ALTER TABLE regions ADD COLUMN IF NOT EXISTS avg_price_paid NUMERIC(15, 2);
    UPDATE regions r
    SET avg_price_paid = (
        SELECT AVG(p.price_paid)
        FROM london_properties p
        WHERE ST_Within(ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326), r.geom)
    );
  `;
  
  try {
    await db.query(query);  // Execute the query
    console.log("Region average prices updated successfully.");
  } catch (err) {
    console.error("Error updating region averages:", err);
  }
}

// Utility function to update the average price for a local authority
const updateLocalAuthorityAvgPrice = async () => {
  const query = `
    ALTER TABLE london_local_authorities ADD COLUMN IF NOT EXISTS avg_price_paid NUMERIC(15, 2);
    UPDATE london_local_authorities la
    SET avg_price_paid = (
        SELECT AVG(p.price_paid)
        FROM london_properties p
        WHERE ST_Within(ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326), la.geom)
    );
  `;
  
  try {
    await db.query(query);  // Execute the query
    console.log("Local authority average prices updated successfully.");
  } catch (err) {
    console.error("Error updating local authority averages:", err);
  }
}

// Utility function to update the average price for a ward
const updateWardAvgPrice = async () => {
  const query = `
    ALTER TABLE london_wards ADD COLUMN IF NOT EXISTS avg_price_paid NUMERIC(15, 2);
    UPDATE london_wards w
    SET avg_price_paid = (
        SELECT AVG(p.price_paid)
        FROM london_properties p
        WHERE ST_Within(ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326), w.geom)
    );
  `;
  
  try {
    await db.query(query);  // Execute the query
    console.log("Ward average prices updated successfully.");
  } catch (err) {
    console.error("Error updating ward averages:", err);
  }
}

const main = async () => {
    try {
        await updateRegionAvgPrice();
        await updateLocalAuthorityAvgPrice();
        await updateWardAvgPrice();

        console.log("Succesfully calculated and stored average price paid for boundaries.")
    } catch (error) {
        console.error("Could not caclulate and store average price paid for boundaries:", error);
        throw error;
    } finally {
        await db.end();
        console.log('Disconnected from the database.');
    }
}

main();

// Export the utility functions to be run when app starts...
module.exports = {
  updateRegionAvgPrice,
  updateLocalAuthorityAvgPrice,
  updateWardAvgPrice
};
