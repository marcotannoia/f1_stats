const express = require("express");
const {
  elencaPiloti,
  dettaglioPilota,
} = require("../controllers/pilotaController");
const gestisciFunzioneAsincrona = require("../middleware/gestisciFunzioneAsincrona");
const convalidaSlug = require("../middleware/convalidaSlug");

const router = express.Router();

router.get("/", gestisciFunzioneAsincrona(elencaPiloti));
router.get("/:slug", convalidaSlug, gestisciFunzioneAsincrona(dettaglioPilota));

module.exports = router;
