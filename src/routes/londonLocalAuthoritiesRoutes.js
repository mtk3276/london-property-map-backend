const express = require("express");
const router = express.Router();
const londonLocalAuthoritiesController = require("../controllers/londonLocalAuthoritiesController");

router.get("/local-authorities", 
    londonLocalAuthoritiesController.getLondonLocalAuthorityBoundaries);

module.exports=router;