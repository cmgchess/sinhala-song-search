const {search} = require("../controllers/search");
const express = require("express");
const router = express.Router();

router.get("/", search);

module.exports = router;