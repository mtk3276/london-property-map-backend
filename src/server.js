const express = require("express");
const cors = require("cors");
const londonRoutes = require("./routes/londonRoutes");
const ukRegionsRoutes = require("./routes/ukRegionsRoutes");
const londonLocalAuthoritiesRoutes = require("./routes/londonLocalAuthoritiesRoutes");
const londonWardsRoutes = require("./routes/londonWardsRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/properties", londonRoutes);
app.use("/api/geojson", ukRegionsRoutes);
app.use("/api/geojson", londonLocalAuthoritiesRoutes);
app.use("/api/geojson", londonWardsRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});