const express = require("express");
const cors = require("cors");
const londonRoutes = require("./routes/londonRoutes");
const ukRegionsRoutes = require("./routes/ukRegionsRoutes");
const londonLocalAuthoritiesRoutes = require("./routes/londonLocalAuthoritiesRoutes");
const londonWardsRoutes = require("./routes/londonWardsRoutes");
const db = require("./db/dbConfig");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/properties", londonRoutes);
app.use("/api/geojson", ukRegionsRoutes);
app.use("/api/geojson", londonLocalAuthoritiesRoutes);
app.use("/api/geojson", londonWardsRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT. Shutting down gracefully...');
    
    server.close(() => {
        console.log('HTTP server closed.');
        
        // Close database pool
        db.end(() => {
            console.log('Database pool closed.');
            process.exit(0);
        });
    });
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Shutting down gracefully...');
    
    server.close(() => {
        console.log('HTTP server closed.');
        
        // Close database pool
        db.end(() => {
            console.log('Database pool closed.');
            process.exit(0);
        });
    });
});