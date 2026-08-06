const express = require("express");
const {
  elencaScuderie,
  dettaglioScuderia,
} = require("../controllers/scuderiaController");
const gestisciFunzioneAsincrona = require("../middleware/gestisciFunzioneAsincrona");
const convalidaSlug = require("../middleware/convalidaSlug");

const router = express.Router();

router.get("/", gestisciFunzioneAsincrona(elencaScuderie));
router.get("/:slug", convalidaSlug, gestisciFunzioneAsincrona(dettaglioScuderia));

module.exports = router;
