const express = require("express");
const cors = require("cors");
const londonRoutes = require("./routes/londonRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/properties", londonRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});