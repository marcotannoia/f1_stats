const express = require("express");
const {
  elencaGare,
  dettaglioGara,
} = require("../controllers/garaController");
const gestisciFunzioneAsincrona = require("../middleware/gestisciFunzioneAsincrona");
const convalidaSlug = require("../middleware/convalidaSlug");

const router = express.Router();

router.get("/", gestisciFunzioneAsincrona(elencaGare));
router.get("/:slug", convalidaSlug, gestisciFunzioneAsincrona(dettaglioGara));

module.exports = router;
