const express = require("express");
const router = express.Router();
const wardBoundariesController = require("../controllers/londonWardsController");

router.get("/wards", wardBoundariesController.getWardsGeoJSON);

module.exports=router;