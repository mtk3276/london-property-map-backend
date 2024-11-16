const express = require("express");
const router = express.Router();
const regionBoundariesController = require("../controllers/ukRegionsController");

router.get("/regions", regionBoundariesController.getRegionsGeoJSON);

module.exports=router;