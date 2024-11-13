const express = require("express");
const router = express.Router();
const londonController = require("../controllers/londonController");

router.get("/london", londonController.getLondonProperties);

module.exports=router;